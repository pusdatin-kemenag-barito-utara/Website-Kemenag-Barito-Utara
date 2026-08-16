"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "@/components/common/NextImage";
import { usePathname } from "@/hooks/useNextNavigation";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import "./ChatWidget.css";

// ─── Inline SVG Icons ───────────────────────────────────────────────────────
const IconBot = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);
const IconX = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconSend = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconChevronDown = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconSparkle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" />
  </svg>
);
const IconTrash = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

// ─── WhatsApp Icon ───────────────────────────────────────────────────────────
const IconWhatsApp = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);
const IconBotSmall = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

// ─── WhatsApp Config ─────────────────────────────────────────────────────────
const WA_NUMBER = "6285117491212";
const WA_MESSAGE = encodeURIComponent(
  "Halo, saya ingin bertanya mengenai layanan Kemenag Barito Utara."
);

// ─── WhatsApp Content ─────────────────────────────────────────────────────────
const WhatsAppContent = ({ onClose }) => (
  <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
    {/* WA Header */}
    <div style={{ background: "#075E54", padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ width: 42, height: 42, background: "#ffffff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible", border: "1.5px solid rgba(255,255,255,0.4)", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>
          <Image src="/assets/branding/atak-portal.webp" alt="Karakter ATAK" width={48} height={48} unoptimized style={{ width: 48, height: 48, objectFit: "contain", transform: "scale(1.25)", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }} />
        </div>
        <span style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, background: "#25D366", borderRadius: "50%", border: "2px solid #075E54" }} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>Kemenag Barito Utara</p>
        <p style={{ color: "#25D366", fontSize: 11, fontWeight: 600, marginTop: 2 }}>WhatsApp Resmi</p>
      </div>
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Tutup"
        style={{
          width: 32, height: 32, borderRadius: "50%", border: "none",
          background: "rgba(255,255,255,0.12)", color: "#fff",
          cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0,
        }}
      >
        <IconX />
      </button>
    </div>

    {/* Chat bubble area */}
    <div style={{ background: "#E5DDD5", padding: "20px 16px", flex: 1, overflowY: "auto" }}>
      <div style={{ position: "relative", background: "#fff", borderRadius: "0 14px 14px 14px", padding: "12px 14px", maxWidth: "90%", boxShadow: "0 1px 2px rgba(0,0,0,0.12)" }}>
        {/* Triangle */}
        <div style={{ position: "absolute", top: 0, left: -8, width: 0, height: 0, borderRight: "8px solid #fff", borderTop: "8px solid transparent" }} />
        <p style={{ color: "#075E54", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Kemenag Barito Utara</p>
        <p style={{ color: "#374151", fontSize: 13, lineHeight: 1.55 }}>
          Assalamu&apos;alaikum! Selamat datang di layanan WhatsApp resmi Kemenag Kabupaten Barito Utara. 🙏
          <br /><br />
          Ada yang bisa kami bantu?
        </p>
        <p style={{ color: "#9CA3AF", fontSize: 10, textAlign: "right", marginTop: 6 }}>
          {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>

    {/* CTA Button */}
    <div style={{ background: "#fff", padding: "14px 16px", flexShrink: 0 }}>
      <a
        href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg, #25D366 0%, #1ebe5d 100%)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 0", borderRadius: 50, textDecoration: "none", boxShadow: "0 4px 12px rgba(37,211,102,0.35)" }}
      >
        <IconWhatsApp />
        Kirim Pesan
      </a>
    </div>
  </div>
);

// ─── Format time ─────────────────────────────────────────────────────────────
const formatTime = (date) =>
  date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

const TypingDots = () => (
  <div className="typing-dots-container">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="typing-dot"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("whatsapp");
  const { messages, setMessages, status, isLoading: legacyIsLoading, sendMessage } = useChat({
    api: '/api/chat',
    maxSteps: 3,
    initialMessages: [
      {
        id: "initial",
        role: "assistant",
        content: "Halo! Saya Asisten Virtual Kemenag Barito Utara 👋\nAda yang bisa saya bantu hari ini?",
        createdAt: new Date(),
      }
    ],
  });

  const isChatLoading = status ? status === 'submitted' || status === 'streaming' : legacyIsLoading;

  const [localInput, setLocalInput] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [skipAutoFocus, setSkipAutoFocus] = useState(false);
  const [isWidgetHidden, setIsWidgetHidden] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkHidden = () => {
        setIsWidgetHidden(localStorage.getItem("admin_hide_ai_widget") === "true");
      };
      
      // Check initial state
      checkHidden();
      
      // Listen to storage event (if changed from other tabs)
      window.addEventListener("storage", checkHidden);
      // Listen to custom event (if changed from same tab)
      window.addEventListener("widget_visibility_changed", checkHidden);
      
      return () => {
        window.removeEventListener("storage", checkHidden);
        window.removeEventListener("widget_visibility_changed", checkHidden);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isPwa =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone;
      const isMobile = window.matchMedia("(max-width: 1024px)").matches;
      // Wrap in setTimeout to avoid synchronous setState during render
      setTimeout(() => setSkipAutoFocus(isPwa || isMobile), 0);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && !skipAutoFocus) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, skipAutoFocus]);

  const pathname = usePathname();
  const cleanPath = pathname ? pathname.toLowerCase().trim() : "";
  const isAuthOrAdminPath = 
    cleanPath.startsWith("/pusdatin/auth") || 
    cleanPath.includes("/auth") || 
    cleanPath.startsWith("/login") || 
    cleanPath.startsWith("/admin");

  const [is404, setIs404] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const check404 = () => {
        setIs404(Boolean(document.getElementById("not-found-page") || document.querySelector('[data-page="404"]')));
      };
      check404();
      const timer = setTimeout(check404, 50);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleReset = () => {
    setMessages([
      {
        id: "initial",
        role: "assistant",
        content:
          "Halo! Saya Asisten Virtual Kemenag Barito Utara 👋\nAda yang bisa saya bantu hari ini?",
        createdAt: new Date(),
      },
    ]);
    setShowResetConfirm(false);
  };

  // Track window scroll position for Scroll-To-Top button
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Lock background body scroll when widget is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ─── Render ─────────────────────────────────────────────────────────────
  if (isWidgetHidden || isAuthOrAdminPath || is404) return null;

  return (
    <>
      {/* ─── Scroll To Top Button (Bottom-Center Minimalist Pill) ───────────── */}
      <AnimatePresence>
        {showScrollTop && !isOpen && (
          <motion.button
            initial={{ opacity: 0, y: 20, x: "-50%", scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: 20, x: "-50%", scale: 0.9 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={scrollToTop}
            aria-label="Kembali ke atas"
            title="Kembali ke atas"
            style={{
              position: "fixed",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9990,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 16px",
              borderRadius: 30,
              border: "1px solid rgba(0, 0, 0, 0.08)",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              color: "#1e293b",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow:
                "0 4px 20px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.06)",
              fontFamily: "inherit",
            }}
          >
            <motion.svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#075E54"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ y: [0, -2, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <polyline points="18 15 12 9 6 15" />
            </motion.svg>
            <span>Ke atas</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── FAB Button ─────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            whileHover={{ scale: 1.1, y: -3 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            onClick={() => setIsOpen(true)}
            aria-label="Buka Chat Asisten"
            className="ai-fab-button"
            style={{
              position: "fixed",
              zIndex: 9999,
              background: "#ffffff",
              border: "1.5px solid rgba(7, 94, 84, 0.15)",
              borderRadius: "50%",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 6px 24px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(7, 94, 84, 0.2)",
              overflow: "visible",
            }}
          >
            <Image
              src="/assets/branding/atak-portal.webp"
              alt="Karakter ATAK"
              width={56}
              height={56}
              priority
              unoptimized
              style={{
                width: 56,
                height: 56,
                objectFit: "contain",
                transform: "scale(1.3) translateY(-2px)",
                filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.15))",
              }}
            />
            <span
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                width: 10,
                height: 10,
                background: "#25D366",
                borderRadius: "50%",
                border: "2px solid #fff",
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Backdrop Blur Overlay ─────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 9998,
              background: "rgba(15, 23, 42, 0.45)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              cursor: "pointer",
            }}
            aria-label="Tutup widget"
          />
        )}
      </AnimatePresence>

      {/* ─── Chat Window ─────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { type: "spring", stiffness: 260, damping: 24 },
            }}
            exit={{
              opacity: 0,
              scale: 0.92,
              y: 20,
              transition: { duration: 0.18, ease: "easeOut" },
            }}
            className="ai-chat-window"
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 9999,
              background: "#ffffff",
              borderRadius: 24,
              border: "1px solid rgba(7, 94, 84, 0.15)",
              boxShadow:
                "0 20px 45px -10px rgba(7, 94, 84, 0.25), 0 8px 24px -6px rgba(0, 0, 0, 0.12)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              fontFamily: "var(--font-plus-jakarta-sans), 'Plus Jakarta Sans', sans-serif",
            }}
          >
            {/* ── Custom Reset Confirmation Modal ──────────────── */}
            <AnimatePresence>
              {showResetConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 100,
                    background: "rgba(0,0,0,0.7)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 160, damping: 16 }}
                    style={{
                      background: "#1a2234",
                      borderRadius: 20,
                      padding: "24px 20px",
                      width: "100%",
                      maxWidth: 300,
                      textAlign: "center",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        background: "rgba(239,68,68,0.15)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                        color: "#ef4444",
                      }}
                    >
                      <IconTrash />
                    </div>
                    <h3
                      style={{
                        color: "#fff",
                        fontSize: 17,
                        fontWeight: 600,
                        marginBottom: 8,
                      }}
                    >
                      Hapus Riwayat?
                    </h3>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 13,
                        lineHeight: 1.5,
                        marginBottom: 20,
                      }}
                    >
                      Seluruh percakapan Anda akan dihapus dan tidak dapat
                      dikembalikan.
                    </p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "transparent",
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleReset}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: 12,
                          border: "none",
                          background: "#ef4444",
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>



            {/* ── Tab Bar ───────────────────────────────────────── */}
            <div
              style={{
                display: "flex",
                background: "linear-gradient(135deg, #075E54 0%, #128C7E 100%)",
                padding: "6px",
                gap: 6,
                flexShrink: 0,
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <button
                onClick={() => setActiveTab("whatsapp")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 6, padding: "8px 0", borderRadius: 16, border: "none", cursor: "pointer",
                  fontSize: 12.5, fontWeight: 600, transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)", fontFamily: "inherit",
                  background: activeTab === "whatsapp" ? "#ffffff" : "rgba(255,255,255,0.08)",
                  color: activeTab === "whatsapp" ? "#075E54" : "rgba(255,255,255,0.85)",
                  boxShadow: activeTab === "whatsapp" ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                }}
                aria-label="WhatsApp"
              >
                <IconWhatsApp /> WhatsApp
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 6, padding: "8px 0", borderRadius: 16, border: "none", cursor: "pointer",
                  fontSize: 12.5, fontWeight: 600, transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)", fontFamily: "inherit",
                  background: activeTab === "chat" ? "#ffffff" : "rgba(255,255,255,0.08)",
                  color: activeTab === "chat" ? "#075E54" : "rgba(255,255,255,0.85)",
                  boxShadow: activeTab === "chat" ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                }}
                aria-label="Chat AI"
              >
                <IconBotSmall /> Chat AI
              </button>
            </div>

            {/* ── Tab Content ───────────────────────────────────── */}
            {activeTab === "whatsapp" ? (
              <WhatsAppContent onClose={() => setIsOpen(false)} />
            ) : (
              <>
            {/* ── Chat AI Header ──────────────────────────────────── */}
            <div
              style={{
                background: "#075E54",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexShrink: 0,
              }}
            >
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    background: "#ffffff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "visible",
                    border: "1.5px solid rgba(255,255,255,0.4)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  }}
                >
                  <Image
                    src="/assets/branding/atak-portal.webp"
                    alt="Karakter ATAK"
                    width={48}
                    height={48}
                    unoptimized
                    style={{ width: 48, height: 48, objectFit: "contain", transform: "scale(1.25)", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                  />
                </div>
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    bottom: 1,
                    right: 1,
                    width: 11,
                    height: 11,
                    background: "#25D366",
                    borderRadius: "50%",
                    border: "2px solid #075E54",
                    display: "block",
                  }}
                />
              </div>
              {/* Info */}
              <div style={{ flex: 1 }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                  Asisten Kemenag
                </p>
                <p style={{ color: "#25D366", fontSize: 11, fontWeight: 600, marginTop: 2 }}>
                  Chat AI
                </p>
              </div>
              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 6 }}>
                <motion.button
                  whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowResetConfirm(true)}
                  title="Hapus Riwayat"
                  aria-label="Hapus Riwayat"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(255,255,255,0.12)",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s",
                  }}
                >
                  <IconTrash />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, background: "rgba(239,68,68,0.35)" }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsOpen(false)}
                  aria-label="Tutup"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(255,255,255,0.12)",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s",
                  }}
                >
                  <IconX />
                </motion.button>
              </div>
            </div>

            {/* ── Messages ───────────────────────────────────────── */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                padding: "16px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(0,0,0,0.15) transparent",
                background: "#E5DDD5",
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                    animation: "fadeSlideIn 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "82%",
                      background:
                        msg.role === "user"
                          ? "#DCF8C6"
                          : "#fff",
                      border: "none",
                      borderRadius:
                        msg.role === "user"
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                      padding: "10px 14px",
                      color: "#111",
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.13)",
                    }}
                  >
                    {(() => {
                      const textContent = msg.content || (msg.parts ? msg.parts.filter(p => p.type === 'text').map(p => p.text).join('') : '');
                      return textContent.split(/(https?:\/\/[^\s]+)/g).map((part, idx) => {
                            if (part.match(/(https?:\/\/[^\s]+)/)) {
                              return (
                                <a
                                  key={idx}
                                  href={part}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "#059669",
                                    textDecoration: "underline",
                                    fontWeight: 600,
                                    wordBreak: "break-all",
                                  }}
                                >
                                  {part}
                                </a>
                              );
                            }
                            return (
                              <React.Fragment key={idx}>{part}</React.Fragment>
                            );
                          })
                    })()}
                  </div>
                  
                  {/* Generative UI & Tool Invocations */}
                  {msg.toolInvocations?.map(toolInvocation => {
                    const { toolName, toolCallId, state, result } = toolInvocation;
                    
                    if (state === 'result') {
                      if (toolName === 'showLocationMap') {
                        return (
                          <div key={toolCallId} style={{ marginTop: 10, padding: 10, background: 'rgba(255,255,255,0.8)', borderRadius: 12, width: '100%' }}>
                            <p style={{fontSize: 12, marginBottom: 5, color: '#374151'}}>📍 Peta Lokasi:</p>
                            <iframe 
                              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3986.366447283995!2d114.88764021524314!3d-0.957519699301072!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2df6935baab5baeb%3A0xc66512b1bdf69a68!2sKantor%20Kementerian%20Agama%20Kab.%20Barito%20Utara!5e0!3m2!1sen!2sid!4v1689000000000"
                              width="100%" height="120" style={{border: 0, borderRadius: 8}} allowFullScreen loading="lazy"></iframe>
                          </div>
                        );
                      }
                      if (toolName === 'showServiceList') {
                        return (
                          <div key={toolCallId} style={{ marginTop: 10, padding: 10, background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)' }}>
                            <p style={{fontSize: 12, marginBottom: 5, color: '#10b981', fontWeight: 'bold'}}>📋 Layanan PTSP & Survei</p>
                            <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 5, background: '#25D366', color: 'white', padding: '6px 12px', borderRadius: 16, fontSize: 12, textDecoration: 'none' }}>
                              Buka Layanan Terpadu
                            </a>
                          </div>
                        )
                      }
                      if (toolName === 'searchPublicKnowledge') {
                        return (
                          <div key={toolCallId} style={{ marginTop: 10, padding: 8, background: 'rgba(0,0,0,0.04)', borderRadius: 8 }}>
                            <p style={{fontSize: 11, color: 'rgba(0,0,0,0.45)', margin: 0}}>✓ Berhasil mencari di database publik</p>
                          </div>
                        )
                      }
                    } else {
                      return <div key={toolCallId} style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', marginTop: 5 }}>⏳ Memanggil fungsi {toolName}...</div>;
                    }
                  })}

                  <span
                    style={{
                      fontSize: 10.5,
                      color: "rgba(0,0,0,0.35)",
                      marginTop: 4,
                      paddingLeft: 4,
                      paddingRight: 4,
                    }}
                  >
                    {msg.createdAt ? formatTime(new Date(msg.createdAt)) : formatTime(new Date())}
                  </span>
                </div>
              ))}

              {/* Typing Indicator */}
              {isChatLoading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    animation: "fadeSlideIn 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      background: "#fff",
                      border: "none",
                      borderRadius: "18px 18px 18px 4px",
                      padding: "10px 14px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.13)",
                    }}
                  >
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input ──────────────────────────────────────────── */}
            <div
              style={{
                padding: "12px 14px 16px",
                background: "#f0f0f0",
                borderTop: "1px solid rgba(0,0,0,0.08)",
                flexShrink: 0,
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!localInput.trim()) return;
                  if (sendMessage) {
                    sendMessage({ text: localInput });
                  }
                  setLocalInput("");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 25,
                  padding: "8px 8px 8px 16px",
                  transition: "border-color 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "#25D366")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)")
                }
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={localInput}
                  onChange={(e) => setLocalInput(e.target.value)}
                  placeholder="Tulis pesan..."
                  disabled={isChatLoading}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#111",
                    fontSize: 13.5,
                    fontFamily: "inherit",
                    caretColor: "#25D366",
                    "::placeholder": { color: "rgba(0,0,0,0.4)" },
                  }}
                />
                <motion.button
                  type="submit"
                  disabled={!localInput.trim() || isChatLoading}
                  whileHover={localInput.trim() && !isChatLoading ? { scale: 1.08 } : {}}
                  whileTap={localInput.trim() && !isChatLoading ? { scale: 0.92 } : {}}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "none",
                    background:
                      localInput.trim() && !isChatLoading
                        ? "#25D366"
                        : "rgba(0,0,0,0.08)",
                    color:
                      localInput.trim() && !isChatLoading
                        ? "#fff"
                        : "rgba(0,0,0,0.35)",
                    cursor:
                      localInput.trim() && !isChatLoading ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    flexShrink: 0,
                    boxShadow:
                      localInput.trim() && !isChatLoading
                        ? "0 4px 12px rgba(37,211,102,0.35)"
                        : "none",
                  }}
                >
                  <IconSend />
                </motion.button>
              </form>

            </div>
            </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
