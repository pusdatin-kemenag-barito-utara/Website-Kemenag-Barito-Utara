import { useState, useEffect } from "react";
import { useRouter } from "@/hooks/useNextNavigation";
import { getPocketBase } from "@/lib/pocketbase/client";

export function useUpdatePassword() {
  const router = useRouter();
  const pb = getPocketBase();

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
    if (pb.authStore.isValid && pb.authStore.record) {
      setReady(true);
    } else {
      setError("Sesi update password tidak valid atau belum login.");
    }
    setChecking(false);
  }, [pb]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (password.length < 8) return setError("Password baru minimal 8 karakter.");
    if (password !== confirmPassword) return setError("Konfirmasi password tidak sama.");

    setSubmitting(true);
    try {
      await pb.collection("users").update(pb.authStore.record.id, {
        password: password,
        passwordConfirm: confirmPassword,
      });
      setSuccess("Password berhasil diperbarui. Silakan login kembali.");
      setPassword(""); setConfirmPassword("");
      pb.authStore.clear();
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
