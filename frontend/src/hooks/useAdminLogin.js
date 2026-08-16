import { useState, useEffect, useMemo } from "react";
import { useRouter } from "@/hooks/useNextNavigation";
import { createClient } from "@/lib/supabase/client";

function encodeSavedEmail(email) {
  try {
    return btoa(encodeURIComponent(email));
  } catch (e) {
    return email;
  }
}

function decodeSavedEmail(encoded) {
  try {
    return decodeURIComponent(atob(encoded));
  } catch (e) {
    return encoded;
  }
}

function mapLoginError(error) {
  const rawCode = String(error?.code || "").toUpperCase();
  const rawMessage = String(error?.message || "").toLowerCase();
  if (rawCode === "ACCOUNT_LOCKED" || rawCode === "RATE_LIMITED" || rawMessage.includes("terlalu banyak")) {
    return error?.message || "Terlalu banyak percobaan login. Akun dikunci sementara demi keamanan. Silakan tunggu beberapa saat.";
  }
  if (rawMessage.includes("invalid login credentials") || rawCode === "INVALID_CREDENTIALS") {
    return "Email atau password salah, silakan coba lagi.";
  }
  if (rawCode === "NOT_ADMIN") {
    return "Akun ini tidak memiliki hak akses ke panel admin.";
  }
  if (rawCode === "CAPTCHA_FAILED") {
    return "Verifikasi captcha gagal. Silakan ulangi verifikasi.";
  }
  return error?.message || "Terjadi kesalahan saat login admin.";
}

export function useAdminLogin(initialUnauthorized) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [error, setError] = useState(
    initialUnauthorized
      ? "Sesi Anda tidak valid atau tidak memiliki akses admin."
      : "",
  );

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_remember_email");
      if (saved) {
        setEmail(decodeSavedEmail(saved));
        setRememberMe(true);
      }
    } catch (e) {
      // ignore local storage errors
    }
  }, []);

  const [turnstileToken, setTurnstileToken] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function checkSession() {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (controller.signal.aborted) return;
        if (!sessionError && data?.session) {
          const res = await fetch("/api/admin/session", {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          });
          if (controller.signal.aborted) return;
          if (res.ok) {
            const payload = await res.json();
            if (
              payload?.ok &&
              (payload?.permissions?.isAdmin || payload?.permissions?.isEditor)
            ) {
              router.replace("/admin");
              return;
            }
          }
        }
      } catch (err) {
        if (err?.name === "AbortError") return;
      } finally {
        if (!controller.signal.aborted) setLoadingSession(false);
      }
    }
    checkSession();
    return () => controller.abort();
  }, [router, supabase]);

  const handlePasswordKeyState = (event) =>
    setCapsLock(Boolean(event.getModifierState?.("CapsLock")));

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setError("");

    if (!turnstileToken) {
      setError("Silakan lakukan verifikasi keamanan terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/pusdatin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password,
          turnstileToken 
        }),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok || (payload && payload.ok === false)) {
        setError(payload ? mapLoginError(payload) : "Layanan autentikasi sedang tidak tersedia, silakan coba beberapa saat lagi.");
        setSubmitting(false);
        setTurnstileToken(null);
        setTurnstileResetKey((prev) => prev + 1);
        return;
      }

      try {
        if (rememberMe) {
          localStorage.setItem("admin_remember_email", encodeSavedEmail(email.trim().toLowerCase()));
        } else {
          localStorage.removeItem("admin_remember_email");
        }
      } catch (e) {
        // ignore
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/admin";
      }, 1500);
    } catch (err) {
      setError(err?.message || "Terjadi kesalahan jaringan saat login.");
      setSubmitting(false);
      setTurnstileToken(null);
      setTurnstileResetKey((prev) => prev + 1);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    loadingSession,
    submitting,
    success,
    showPassword,
    setShowPassword,
    capsLock,
    error,
    setError,
    turnstileToken,
    setTurnstileToken,
    turnstileResetKey,
    rememberMe,
    setRememberMe,
    handlePasswordKeyState,
    handleSubmit,
  };
}
