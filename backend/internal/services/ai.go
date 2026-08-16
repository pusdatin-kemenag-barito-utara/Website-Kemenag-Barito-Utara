package services

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"kemenag-backend/internal/config"
	"kemenag-backend/internal/db"
)

// AIMessage pesan chat.
type AIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// ToolResult hasil RAG yang diinjeksi.
type RAGResult struct {
	Title   string  `json:"title"`
	Summary string  `json:"content_summary"`
	URL     string  `json:"source_url"`
	Score   float64 `json:"score"`
}

// StreamCallback dipanggil per delta teks.
type StreamCallback func(delta string) error

// ---------- Gemini ----------

type geminiClient struct {
	apiKey string
	http   *http.Client
}

func (g *geminiClient) stream(ctx context.Context, system string, messages []AIMessage, cb StreamCallback) error {
	parts := []map[string]any{{"text": system + "\n\n" + buildContext(messages)}}
	for _, m := range messages {
		if m.Role == "user" {
			parts = append(parts, map[string]any{"text": m.Content})
		}
	}

	body, _ := json.Marshal(map[string]any{
		"contents": []map[string]any{
			{"role": "user", "parts": parts},
		},
		"generationConfig": map[string]any{
			"maxOutputTokens": 800,
			"temperature":     0.7,
		},
	})

	for _, model := range []string{"gemini-flash-latest", "gemini-flash-lite-latest", "gemini-3.7-flash", "gemini-3-flash-preview"} {
		url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:streamGenerateContent?alt=sse&key=%s", model, g.apiKey)
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
		if err != nil {
			continue
		}
		req.Header.Set("Content-Type", "application/json")
		resp, err := g.http.Do(req)
		if err != nil {
			continue
		}
		if resp.StatusCode >= 400 {
			errBytes, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
			resp.Body.Close()
			if resp.StatusCode == 400 || resp.StatusCode == 404 || resp.StatusCode == 503 {
				continue // coba model fallback
			}
			return fmt.Errorf("gemini status %d: %s", resp.StatusCode, string(errBytes))
		}

		scanner := bufio.NewScanner(resp.Body)
		scanner.Buffer(make([]byte, 64*1024), 1024*1024)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if !strings.HasPrefix(line, "data:") {
				continue
			}
			data := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
			if data == "[DONE]" || data == "" {
				continue
			}
			var chunk struct {
				Candidates []struct {
					Content struct {
						Parts []struct {
							Text string `json:"text"`
						} `json:"parts"`
					} `json:"content"`
				} `json:"candidates"`
			}
			if err := json.Unmarshal([]byte(data), &chunk); err != nil {
				continue
			}
			for _, cand := range chunk.Candidates {
				for _, part := range cand.Content.Parts {
					if part.Text != "" {
						if err := cb(part.Text); err != nil {
							resp.Body.Close()
							return err
						}
					}
				}
			}
		}
		if err := scanner.Err(); err != nil {
			resp.Body.Close()
			return fmt.Errorf("gemini stream error: %w", err)
		}
		resp.Body.Close()
		return nil
	}
	return fmt.Errorf("semua model Gemini gagal")
}

// ---------- OpenAI-compatible (Groq / Mistral / OpenRouter) ----------

type openAICompatClient struct {
	apiKey  string
	baseURL string
	model   string
	http    *http.Client
}

func (o *openAICompatClient) stream(ctx context.Context, system string, messages []AIMessage, cb StreamCallback) error {
	apiMessages := []map[string]any{{"role": "system", "content": system + "\n\n" + buildContext(messages)}}
	for _, m := range messages {
		apiMessages = append(apiMessages, map[string]any{"role": m.Role, "content": m.Content})
	}

	body, _ := json.Marshal(map[string]any{
		"model":       o.model,
		"messages":    apiMessages,
		"stream":      true,
		"max_tokens":  800,
		"temperature": 0.7,
	})

	url := strings.TrimSuffix(o.baseURL, "/") + "/chat/completions"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+o.apiKey)

	resp, err := o.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		errBytes, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
		return fmt.Errorf("openai-compat status %d (%s): %s", resp.StatusCode, o.model, string(errBytes))
	}

	scanner := bufio.NewScanner(resp.Body)
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if !strings.HasPrefix(line, "data:") {
			continue
		}
		data := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
		if data == "[DONE]" || data == "" {
			continue
		}
		var chunk struct {
			Choices []struct {
				Delta struct {
					Content string `json:"content"`
				} `json:"delta"`
			} `json:"choices"`
		}
		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			continue
		}
		for _, choice := range chunk.Choices {
			if choice.Delta.Content != "" {
				if err := cb(choice.Delta.Content); err != nil {
					return err
				}
			}
		}
	}
	if err := scanner.Err(); err != nil {
		return fmt.Errorf("openai stream error: %w", err)
	}
	return nil
}

// ---------- Provider list & fallback ----------

type provider struct {
	name string
	run  func(ctx context.Context, system string, messages []AIMessage, cb StreamCallback) error
}

func buildProviders() []provider {
	var list []provider
	// Provider 1: Groq (sangat cepat & stabil)
	if config.Cfg.GroqAPIKey != "" {
		c := &openAICompatClient{apiKey: config.Cfg.GroqAPIKey, baseURL: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile", http: &http.Client{Timeout: 60 * time.Second}}
		list = append(list, provider{name: "groq", run: c.stream})
	}
	// Provider 2: Gemini
	if config.Cfg.GeminiAPIKey != "" {
		g := &geminiClient{apiKey: config.Cfg.GeminiAPIKey, http: &http.Client{Timeout: 60 * time.Second}}
		list = append(list, provider{name: "gemini", run: g.stream})
	}
	// Provider 3: Mistral
	if config.Cfg.MistralAPIKey != "" {
		c := &openAICompatClient{apiKey: config.Cfg.MistralAPIKey, baseURL: "https://api.mistral.ai/v1", model: "mistral-small-latest", http: &http.Client{Timeout: 60 * time.Second}}
		list = append(list, provider{name: "mistral", run: c.stream})
	}
	// Provider 4: OpenRouter
	if config.Cfg.OpenRouterAPIKey != "" {
		c := &openAICompatClient{apiKey: config.Cfg.OpenRouterAPIKey, baseURL: "https://openrouter.ai/api/v1", model: "meta-llama/llama-3.1-8b-instruct:free", http: &http.Client{Timeout: 60 * time.Second}}
		list = append(list, provider{name: "openrouter", run: c.stream})
	}
	return list
}

// StreamChat menjalankan fallback multi-provider dengan streaming.
func StreamChat(ctx context.Context, system string, messages []AIMessage, cb StreamCallback) (string, error) {
	providers := buildProviders()
	if len(providers) == 0 {
		return "", fmt.Errorf("tidak ada API key AI terkonfigurasi")
	}

	var lastErr error
	for _, p := range providers {
		select {
		case <-ctx.Done():
			return "", ctx.Err()
		default:
		}
		err := p.run(ctx, system, messages, cb)
		if err == nil {
			return p.name, nil
		}
		fmt.Printf("[ai provider fallback] %s error: %v\n", p.name, err)
		lastErr = err
	}
	if lastErr == nil {
		lastErr = fmt.Errorf("unknown error")
	}
	return "", lastErr
}

// buildContext: konteks RAG yang diinjeksi.
func buildContext(messages []AIMessage) string {
	// query terakhir user untuk RAG
	var query string
	for i := len(messages) - 1; i >= 0; i-- {
		if messages[i].Role == "user" && messages[i].Content != "" {
			query = messages[i].Content
			break
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	results, err := SearchKnowledge(ctx, query, 3)
	if err != nil || len(results) == 0 {
		return ""
	}

	var b strings.Builder
	b.WriteString("\n\n=== KONTEKS DARI WEBSITE KEMENAG (gunakan jika relevan) ===\n")
	for i, r := range results {
		b.WriteString(fmt.Sprintf("[%d] %s\n%s\n(sumber: %s)\n", i+1, r.Title, r.Summary, r.URL))
	}
	b.WriteString("=== AKHIR KONTEKS ===\n")
	return b.String()
}

// ---------- Embedding & RAG ----------

// EmbedQuery menghasilkan embedding via Gemini gemini-embedding-001.
func EmbedQuery(ctx context.Context, text string) ([]float64, error) {
	if config.Cfg.GeminiAPIKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY tidak diatur")
	}
	body, _ := json.Marshal(map[string]any{
		"model": "models/gemini-embedding-001",
		"content": map[string]any{
			"parts": []map[string]any{{"text": text}},
		},
	})
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=%s", config.Cfg.GeminiAPIKey)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := (&http.Client{Timeout: 30 * time.Second}).Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		io.Copy(io.Discard, io.LimitReader(resp.Body, 4096))
		return nil, fmt.Errorf("embedding status %d", resp.StatusCode)
	}
	var out struct {
		Embedding struct {
			Values []float64 `json:"values"`
		} `json:"embedding"`
	}
	if err := json.NewDecoder(io.LimitReader(resp.Body, 2<<20)).Decode(&out); err != nil {
		return nil, err
	}
	if len(out.Embedding.Values) == 0 {
		return nil, fmt.Errorf("embedding kosong")
	}
	// pastikan 768D (MRL: potong ke 768)
	vals := out.Embedding.Values
	if len(vals) > 768 {
		vals = vals[:768]
	}
	return vals, nil
}

// SearchKnowledge: RAG cosine similarity ke ai_knowledge_base (threshold 0.5, top 4).
func SearchKnowledge(ctx context.Context, query string, limit int) ([]RAGResult, error) {
	query = strings.TrimSpace(query)
	if query == "" || limit <= 0 {
		return nil, nil
	}
	embedding, err := EmbedQuery(ctx, query)
	if err != nil {
		return nil, err
	}

	pool := db.Get()
	if pool == nil {
		return nil, fmt.Errorf("db tidak tersedia")
	}

	embJSON, _ := json.Marshal(embedding)
	rows, err := pool.Query(ctx, `
		SELECT title, content_summary, source_url, 1 - (embedding <=> $1::vector) AS score
		FROM kemenag_website.ai_knowledge_base
		WHERE 1 - (embedding <=> $1::vector) > 0.5
		ORDER BY embedding <=> $1::vector
		LIMIT $2`, string(embJSON), limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []RAGResult
	for rows.Next() {
		var r RAGResult
		if err := rows.Scan(&r.Title, &r.Summary, &r.URL, &r.Score); err == nil {
			results = append(results, r)
		}
	}
	return results, rows.Err()
}

// ---------- System prompt builder ----------

// BuildSystemPrompt menyusun system prompt + injeksi opsional.
func BuildSystemPrompt(injection string) string {
	prompt := SYSTEM_PROMPT
	if strings.TrimSpace(injection) != "" {
		prompt += "\n\nINFORMASI TAMBAHAN DARI PENGELOLA:\n" + injection
	}
	return prompt
}
