package lib

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"
	"unicode"

	"github.com/microcosm-cc/bluemonday"
)

// CleanString: trim, hilangkan null bytes, rapikan whitespace, cap max.
func CleanString(value any, max int) string {
	if max <= 0 {
		max = 5000
	}
	s, ok := value.(string)
	if !ok {
		return ""
	}
	s = strings.ReplaceAll(s, "\u0000", "")
	s = strings.TrimSpace(s)
	if max > 0 && len(s) > max {
		s = s[:max]
	}
	return s
}

// CleanHTML: strip script/style/iframe + on* handlers + javascript:, cap max.
func CleanHTML(value any, max int) string {
	if max <= 0 {
		max = 50000
	}
	s, ok := value.(string)
	if !ok {
		return ""
	}
	s = strings.ReplaceAll(s, "\u0000", "")
	s = strings.TrimSpace(s)

	// sanitasi awal: buang blok berbahaya
	reScript := regexp.MustCompile(`(?is)<script[\s\S]*?</script>`)
	s = reScript.ReplaceAllString(s, "")
	reStyle := regexp.MustCompile(`(?is)<style[\s\S]*?</style>`)
	s = reStyle.ReplaceAllString(s, "")
	reIframe := regexp.MustCompile(`(?is)<iframe[\s\S]*?</iframe>`)
	s = reIframe.ReplaceAllString(s, "")
	reOnAttr := regexp.MustCompile(`(?i)\son[a-z]+\s*=\s*"[^"]*"`)
	s = reOnAttr.ReplaceAllString(s, "")
	reOnAttr2 := regexp.MustCompile(`(?i)\son[a-z]+\s*=\s*'[^']*'`)
	s = reOnAttr2.ReplaceAllString(s, "")
	reJS := regexp.MustCompile(`(?i)javascript\s*:`)
	s = reJS.ReplaceAllString(s, "")

	// sanitasi lanjut dengan bluemonday (browser-safe, izinkan formatting umum)
	p := bluemonday.UGCPolicy()
	p.AllowElements("h1", "h2", "h3", "h4", "p", "br", "ul", "ol", "li", "blockquote", "figure", "figcaption")
	p.AllowAttrs("class").OnElements("figure", "figcaption")
	p.AllowAttrs("href", "title", "rel", "target").OnElements("a")
	p.AllowAttrs("src", "alt", "title", "width", "height").OnElements("img")
	p.AllowAttrs("src", "title").OnElements("iframe")
	p.AllowElements("strong", "em", "b", "i", "u", "s", "code", "pre", "table", "thead", "tbody", "tr", "th", "td", "hr", "span")
	s = p.Sanitize(s)

	if max > 0 && len(s) > max {
		s = s[:max]
	}
	return s
}

// ToBool: konversi boolean dari berbagai tipe.
func ToBool(value any) bool {
	switch v := value.(type) {
	case bool:
		return v
	case float64:
		return v == 1
	case int:
		return v == 1
	case string:
		s := strings.ToLower(strings.TrimSpace(v))
		return s == "true" || s == "1" || s == "yes" || s == "on"
	default:
		return false
	}
}

// ToInt: aman konversi ke int, default 0.
func ToInt(value any) int {
	switch v := value.(type) {
	case float64:
		return int(v)
	case int:
		return v
	case int64:
		return int(v)
	case string:
		n, _ := strconv.Atoi(strings.TrimSpace(v))
		return n
	default:
		return 0
	}
}

// Slugify: pola dari cms-utils.ts.
func Slugify(value string) string {
	s := CleanString(value, 200)
	s = strings.ToLower(s)
	// hilangkan aksen (NFD)
	s = stripAccents(s)
	// buang karakter non a-z0-9 spasi dash
	var b strings.Builder
	for _, r := range s {
		if r >= 'a' && r <= 'z' || r >= '0' && r <= '9' || r == ' ' || r == '-' {
			b.WriteRune(r)
		}
	}
	s = b.String()
	s = strings.Join(strings.Fields(s), "-")
	s = strings.ReplaceAll(s, " ", "-")
	re := regexp.MustCompile(`-+`)
	s = re.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	return s
}

func stripAccents(s string) string {
	var b strings.Builder
	for _, r := range s {
		if unicode.Is(unicode.Mn, r) {
			continue
		}
		b.WriteRune(r)
	}
	return b.String()
}

// IsHttpsUrl: validasi URL https (dengan allowlist host opsional).
func IsHttpsUrl(value any, allowedHosts []string) bool {
	s, ok := value.(string)
	if !ok {
		return false
	}
	s = strings.TrimSpace(s)
	if !strings.HasPrefix(s, "https://") {
		return false
	}
	rest := strings.TrimPrefix(s, "https://")
	host := rest
	if i := strings.IndexAny(rest, "/?#"); i != -1 {
		host = rest[:i]
	}
	if host == "" {
		return false
	}
	if len(allowedHosts) > 0 {
		for _, h := range allowedHosts {
			if strings.EqualFold(h, host) {
				return true
			}
		}
		return false
	}
	return true
}

// ToDateISO: validasi & normalisasi tanggal ke ISO8601.
func ToDateISO(value any) string {
	s, ok := value.(string)
	if !ok || strings.TrimSpace(s) == "" {
		return ""
	}
	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		if t2, err2 := time.Parse("2006-01-02", s); err2 == nil {
			return t2.Format(time.RFC3339)
		}
		return ""
	}
	return t.Format(time.RFC3339)
}

// ValidationErrors helper.
func ValidationErrors(fields map[string]string) []map[string]any {
	out := make([]map[string]any, 0, len(fields))
	for f, msg := range fields {
		out = append(out, map[string]any{"field": f, "message": msg})
	}
	return out
}

func I(field, msg string) map[string]any {
	return map[string]any{"field": field, "message": msg}
}

// NilString → pointer string (untuk sql null).
func NilString(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// NilInt → pointer int (untuk sql null).
func NilInt(n int) *int {
	return &n
}

var _ = fmt.Sprintf