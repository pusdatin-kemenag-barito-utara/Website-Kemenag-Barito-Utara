import { useState, useEffect } from "react";
import { useRouter } from "@/hooks/useNextNavigation";
import { getPocketBase } from "@/lib/pocketbase/client";

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
  const rawMessage = String(error?.message || "").toLowerCase();
  if (rawMessage.includes("failed to authenticate") || rawMessage.includes("invalid")) {
    return "Email atau kata sandi salah, silakan coba lagi.";
  }
  return error?.message || "Terjadi kesalahan saat login admin.";
}

export function useAdminLogin(initialUnauthorized) {
  const router = useRouter();
  const pb = getPocketBase();

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
    if (pb.authStore.isValid && pb.authStore.record) {
      router.replace("/admin");
    } else {
      setLoadingSession(false);
    }
  }, [router, pb]);

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
      const authData = await pb
        .collection("users")
        .authWithPassword(email.trim().toLowerCase(), password);

      if (!authData || !authData.record) {
        throw new Error("Autentikasi gagal. Record tidak ditemukan.");
      }

      // 1. Ekspor dan sinkronkan cookie secara instan
      if (typeof document !== "undefined") {
        try {
          const cookie = pb.authStore.exportToCookie({
            httpOnly: false,
            sameSite: "Lax",
            secure: window.location.protocol === "https:",
          });
          document.cookie = cookie;
        } catch {
          // ignore cookie write errors
        }
      }

      // 2. Pre-cache session & permission ke sessionStorage agar useAdminShell di /admin langsung instant tanpa loading
      const user = authData.record;
      const role = user.role || "super_admin";
      const session = {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || "Admin",
          full_name: user.name || "Admin",
          role: role,
          avatar_url: user.avatar ? pb.files.getURL(user, user.avatar) : "",
        },
        permissions: {
          isAdmin: role === "super_admin" || role === "admin",
          isEditor: role === "editor",
          hasAdminPanelAccess: true,
          role: role,
        },
      };

      const perm = {
        role: role,
        email: user.email,
        isSuperAdmin: role === "super_admin",
        isAdmin: role === "super_admin" || role === "admin",
        isEditor: role === "editor",
        isActive: true,
        approved: true,
      };

      try {
        sessionStorage.setItem(
          "kemenag_admin_shell_session",
          JSON.stringify({ session, perm })
        );
      } catch {
        // ignore storage errors
      }

      try {
        if (rememberMe) {
          localStorage.setItem(
            "admin_remember_email",
            encodeSavedEmail(email.trim().toLowerCase())
          );
        } else {
          localStorage.removeItem("admin_remember_email");
        }
      } catch (e) {
        // ignore
      }

      setSuccess(true);
      // Animasi transisi cepat 200ms untuk feedback centang hijau, lalu navigasi instan
      setTimeout(() => {
        window.location.replace("/admin");
      }, 200);
    } catch (err) {
      setError(mapLoginError(err));
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
