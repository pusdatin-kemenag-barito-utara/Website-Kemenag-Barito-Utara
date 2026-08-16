package services

import (
	"encoding/json"
	"log"
	"net/url"
	"strings"
	"sync"
	"time"

	"kemenag-backend/internal/config"

	"github.com/gorilla/websocket"
)

// RealtimeService — broadcast Supabase Realtime (channel "site-updates")
// untuk invalidasi cache sisi client (pola realtime-service.js).
type RealtimeService struct {
	mu      sync.Mutex
	conn    *websocket.Conn
	ref     int64
	ready   bool
	stopped bool
}

var Realtime = &RealtimeService{}

func wsURL() string {
	base := strings.TrimPrefix(config.Cfg.SupabaseURL, "https://")
	base = strings.TrimPrefix(base, "http://")
	return "wss://" + base + "/realtime/v1/websocket?apikey=" + url.QueryEscape(config.Cfg.SupabaseAnon) + "&vsn=1.0.0"
}

// Start memulai koneksi websocket ke Supabase Realtime (non-blocking).
func (r *RealtimeService) Start() {
	if config.Cfg.SupabaseURL == "" {
		return
	}
	go r.loop()
}

func (r *RealtimeService) loop() {
	for !r.stopped {
		conn, _, err := websocket.DefaultDialer.Dial(wsURL(), nil)
		if err != nil {
			log.Printf("[realtime] dial gagal: %v (retry 10s)", err)
			time.Sleep(10 * time.Second)
			continue
		}

		r.mu.Lock()
		r.conn = conn
		r.ready = false
		r.mu.Unlock()

		r.send(map[string]any{
			"topic":   "realtime:site-updates",
			"event":   "phx_join",
			"payload": map[string]any{},
			"ref":     r.nextRef(),
		})

		_ = conn.SetReadDeadline(time.Now().Add(55 * time.Second))
		_ = conn.SetWriteDeadline(time.Now().Add(10 * time.Second))

		conn.SetPongHandler(func(string) error {
			_ = conn.SetReadDeadline(time.Now().Add(55 * time.Second))
			return nil
		})

		// heartbeat
		stopHeartbeat := make(chan struct{})
		go func() {
			ticker := time.NewTicker(25 * time.Second)
			defer ticker.Stop()
			for {
				select {
				case <-ticker.C:
					r.mu.Lock()
					c := r.conn
					r.mu.Unlock()
					if c != nil {
						_ = c.WriteMessage(websocket.PingMessage, nil)
					}
				case <-stopHeartbeat:
					return
				}
			}
		}()

		// baca pesan (join success / push replies)
		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				break
			}
			var envelope map[string]any
			if err := json.Unmarshal(msg, &envelope); err != nil {
				continue
			}
			if event, _ := envelope["event"].(string); event == "phx_reply" {
				r.mu.Lock()
				r.ready = true
				r.mu.Unlock()
				log.Println("[realtime] channel site-updates bergabung")
			}
		}

		close(stopHeartbeat)
		r.mu.Lock()
		if r.conn == conn {
			r.conn = nil
			r.ready = false
		}
		r.mu.Unlock()
		_ = conn.Close()
		time.Sleep(5 * time.Second)
	}
}

func (r *RealtimeService) nextRef() int64 {
	r.ref++
	return r.ref
}

func (r *RealtimeService) send(payload map[string]any) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.conn == nil {
		return false
	}
	_ = r.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
	if err := r.conn.WriteJSON(payload); err != nil {
		return false
	}
	return true
}

// BroadcastRefresh — kirim event "refresh-content" ke channel site-updates.
func (r *RealtimeService) BroadcastRefresh(entity string) {
	r.mu.Lock()
	ready := r.ready
	r.mu.Unlock()
	if !ready {
		return
	}
	r.send(map[string]any{
		"topic":   "realtime:site-updates",
		"event":   "broadcast",
		"payload": map[string]any{
			"type":    "broadcast",
			"event":   "refresh-content",
			"payload": map[string]any{"entity": entity},
		},
		"ref": r.nextRef(),
	})
}
