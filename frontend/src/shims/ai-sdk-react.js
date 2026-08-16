// Shim @ai-sdk/react untuk Astro: hanya mengimplementasikan useChat dengan
// fetch manual ke /api/chat (SSE flat: text-start / text-delta / finish).
// API mengikuti kontrak yang dipakai ChatWidget: { api, initialMessages, onResponse }
// → { messages, setMessages, status, isLoading, sendMessage }

import React, { useState, useCallback, useEffect, useRef } from "react";

function createId(prefix = "msg") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function parseSSE(buf) {
  const events = [];
  const lines = buf.split("\n");
  let current = null;
  for (const line of lines) {
    if (line.startsWith("data:")) {
      current = line.slice(5).trim();
      if (current) {
        try {
          events.push(JSON.parse(current));
        } catch {
          events.push({ type: "text-delta", delta: current });
        }
      }
      current = null;
    }
  }
  return events;
}

export function useChat({
  api = "/api/chat",
  maxSteps,
  initialMessages = [],
  onResponse,
  onError,
} = {}) {
  const [messages, setMessages] = useState(() =>
    initialMessages.map((m, i) => ({ id: m.id || createId("init"), role: m.role, content: m.content, createdAt: m.createdAt || new Date() }))
  );
  const [status, setStatus] = useState("ready");
  const abortRef = useRef(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStatus((s) => (s === "submitted" || s === "streaming" ? "ready" : s));
  }, []);

  const sendMessage = useCallback(
    async ({ text, messages: extraMessages } = {}) => {
      if (!text && !extraMessages) return;
      stop();

      const userMessage = extraMessages
        ? extraMessages.map((m) => ({ id: m.id || createId("user"), role: m.role, content: m.content, createdAt: new Date() }))
        : [{ id: createId("user"), role: "user", content: text, createdAt: new Date() }];

      setMessages((prev) => [...prev, ...userMessage]);
      setStatus("submitted");

      const history = [
        ...messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: String(m.content || "") })),
        ...userMessage.map((m) => ({ role: m.role, content: String(m.content || "") })),
      ];

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (!res.body) throw new Error("No body");

        setStatus("streaming");
        onResponse?.(res);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let assistantText = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const events = parseSSE(buf);
          buf = "";
          for (const ev of events) {
            if (ev.type === "text-start") {
              assistantText = "";
            } else if (ev.type === "text-delta") {
              assistantText += ev.delta || "";
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.role === "assistant" && last._streaming) {
                  const next = [...prev];
                  next[next.length - 1] = { ...last, content: assistantText };
                  return next;
                }
                return [...prev, { id: createId("assistant"), role: "assistant", content: assistantText, createdAt: new Date(), _streaming: true }];
              });
            } else if (ev.type === "finish") {
              // selesai
            } else if (ev.type === "error") {
              assistantText = ev.error || assistantText;
            }
          }
        }

        setMessages((prev) => {
          const next = [...prev];
          const lastIdx = next.length - 1;
          if (next[lastIdx] && next[lastIdx].role === "assistant") {
            const { _streaming, ...clean } = next[lastIdx];
            next[lastIdx] = clean;
          }
          return next;
        });
        setStatus("ready");
      } catch (err) {
        if (err?.name === "AbortError") return;
        onError?.(err);
        setMessages((prev) => [
          ...prev,
          {
            id: createId("assistant"),
            role: "assistant",
            content:
              "Mohon maaf, layanan AI sedang sibuk. Silakan hubungi WhatsApp Call Center PTSP melalui https://wa.me/6285117491212",
            createdAt: new Date(),
          },
        ]);
        setStatus("ready");
      }
    },
    [api, messages, stop, onResponse, onError],
  );

  const reload = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) sendMessage({ text: lastUser.content });
  }, [messages, sendMessage]);

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => () => abortRef.current?.abort(), []);

  return {
    messages,
    setMessages,
    status,
    isLoading,
    sendMessage,
    stop,
    reload,
    error: undefined,
  };
}

export function useAssistant(options) {
  return useChat(options);
}

export const generateText = async () => ({
  text: "",
});

export const streamText = async () => ({
  toTextStreamResponse: () => new Response("", { status: 200 }),
  text: "",
});

export default { useChat, useAssistant };
