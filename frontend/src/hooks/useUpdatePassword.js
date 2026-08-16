import { useState, useEffect, useMemo } from "react";
import { useRouter } from "@/hooks/useNextNavigation";
import { createClient } from "@/lib/supabase/client";

export function useUpdatePassword() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    async function checkRecoverySession() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!active) return;
        if (error || !user) {
          setError("Sesi reset password tidak valid atau sudah kedaluwarsa.");
          setChecking(false);
          return;
        }
        setReady(true);
      } catch (err) {
        if (active) setError(err?.message || "Terjadi kesalahan saat memeriksa sesi.");
      } finally {
        if (active) setChecking(false);
      }
    }
    checkRecoverySession();
    return () => { active = false; };
  }, [supabase]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (password.length < 8) return setError("Password baru minimal 8 karakter.");
    if (password !== confirmPassword) return setError("Konfirmasi password tidak sama.");

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess("Password berhasil diperbarui. Silakan login kembali.");
      setPassword(""); setConfirmPassword("");
      setTimeout(() => router.replace("/pusdatin/auth"), 1500);
    } catch (err) {
      setError(err?.message || "Gagal memperbarui password.");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    checking, ready, submitting,
    error, success,
    handleSubmit,
  };
}
