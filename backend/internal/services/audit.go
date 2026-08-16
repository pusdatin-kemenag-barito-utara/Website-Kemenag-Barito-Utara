package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"kemenag-backend/internal/db"
)

// AuditService — buffer batch ke kemenag_pusdatin.audit_logs (pola audit.ts).
type AuditService struct {
	mu      sync.Mutex
	buffer  []AuditRecord
	timer   *time.Timer
	lock    bool
}

type AuditRecord struct {
	Action       string `json:"action"`
	Target       string `json:"target"`
	TargetSchema string `json:"target_schema"`
	PerformedBy  string `json:"performed_by"`
	BeforeState  any    `json:"before_state"`
	AfterState   any    `json:"after_state"`
	IP           any    `json:"ip"`
}

var Audit = &AuditService{}

const (
	auditBatchSize      = 10
	auditMaxBuffer      = 200
	auditFlushInterval  = 5 * time.Second
)

func redact(v any) any {
	if v == nil {
		return nil
	}
	switch t := v.(type) {
	case map[string]any:
		out := map[string]any{}
		for k, val := range t {
			lk := strings.ToLower(k)
			if strings.Contains(lk, "password") || strings.Contains(lk, "token") ||
				strings.Contains(lk, "secret") || strings.Contains(lk, "service_role") ||
				strings.Contains(lk, "otp") || strings.Contains(lk, "mfa_code") {
				out[k] = "[redacted]"
				continue
			}
			if s, ok := val.(string); ok && strings.HasPrefix(s, "data:") && len(s) > 400 {
				out[k] = "[redacted]"
				continue
			}
			out[k] = redact(val)
		}
		return out
	case []any:
		out := make([]any, len(t))
		for i, item := range t {
			out[i] = redact(item)
		}
		return out
	default:
		return v
	}
}

func extractIP(xForwardedFor, xRealIP string) any {
	if xForwardedFor != "" {
		return strings.TrimSpace(strings.Split(xForwardedFor, ",")[0])
	}
	if xRealIP != "" {
		return strings.TrimSpace(xRealIP)
	}
	return nil
}

// Record menambah record audit (async flush).
func (a *AuditService) Record(opts struct {
	Action      string
	Entity      string
	EntityID    string
	PerformedBy string
	Before      any
	After       any
	IP          any
}) {
	a.mu.Lock()
	defer a.mu.Unlock()

	target := opts.Entity
	if opts.EntityID != "" {
		target += ":" + opts.EntityID
	}
	performedBy := opts.PerformedBy
	if performedBy == "" {
		performedBy = "system"
	}

	rec := AuditRecord{
		Action:       truncate(opts.Action, 20),
		Target:       truncate(target, 255),
		TargetSchema: "kemenag_website",
		PerformedBy:  truncate(performedBy, 255),
		BeforeState:  redact(opts.Before),
		AfterState:   redact(opts.After),
		IP:           opts.IP,
	}

	if len(a.buffer) >= auditMaxBuffer {
		a.buffer = a.buffer[1:]
		log.Println("[audit] buffer overflow, drop 1")
	}
	a.buffer = append(a.buffer, rec)

	if a.timer == nil {
		a.timer = time.AfterFunc(auditFlushInterval, a.Flush)
	}
	if len(a.buffer) >= auditBatchSize {
		go a.Flush()
	}
}

// Flush insert batch ke DB.
func (a *AuditService) Flush() {
	a.mu.Lock()
	if a.lock || len(a.buffer) == 0 {
		a.mu.Unlock()
		return
	}
	a.lock = true
	batch := a.buffer
	a.buffer = nil
	if a.timer != nil {
		a.timer.Stop()
		a.timer = nil
	}
	a.mu.Unlock()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool := db.Get()
	if pool == nil {
		a.mu.Lock()
		a.lock = false
		a.mu.Unlock()
		return
	}

	tx, err := pool.Begin(ctx)
	if err == nil {
		for _, rec := range batch {
			beforeJSON, _ := json.Marshal(rec.BeforeState)
			afterJSON, _ := json.Marshal(rec.AfterState)
			ipVal := rec.IP
			var ipArg any
			if ipVal == nil {
				ipArg = nil
			} else {
				ipArg = fmt.Sprintf("%v", ipVal)
			}
			_, err2 := tx.Exec(ctx, `
				INSERT INTO kemenag_pusdatin.audit_logs
					(action, target, target_schema, performed_by, before_state, after_state, ip)
				VALUES ($1, $2, $3, $4, $5, $6, $7)`,
				rec.Action, rec.Target, rec.TargetSchema, rec.PerformedBy,
				string(beforeJSON), string(afterJSON), ipArg)
			if err2 != nil {
				log.Printf("[audit] insert error: %v", err2)
			}
		}
		_ = tx.Commit(ctx)
	} else {
		log.Printf("[audit] begin tx error: %v", err)
		// kembalikan batch ke buffer
		a.mu.Lock()
		a.buffer = append(batch, a.buffer...)
		a.mu.Unlock()
	}

	a.mu.Lock()
	a.lock = false
	a.mu.Unlock()
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n]
}
