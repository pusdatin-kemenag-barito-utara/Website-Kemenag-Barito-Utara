import { useState } from "react";
import { useRouter } from "@/hooks/useNextNavigation";
import { getPocketBase } from "@/lib/pocketbase/client";

export function useRegisterEditor() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [unitName, setUnitName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const pb = getPocketBase();
      await pb.collection("users").create({
        email: email.trim(),
        password: password,
        passwordConfirm: password,
        name: fullName.trim(),
        unit_name: unitName.trim(),
        role: "editor",
        status: "pending",
      });

      setSuccess(
        "Akun editor berhasil dibuat. Silakan login, lalu tunggu verifikasi super admin.",
      );
      setFullName("");
      setEmail("");
      setUnitName("");
      setPassword("");
      setTimeout(() => router.push("/pusdatin/auth"), 1400);
    } catch (err) {
      setError(err?.message || "Gagal membuat akun.");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    unitName,
    setUnitName,
    password,
    setPassword,
    submitting,
    showPassword,
    setShowPassword,
    error,
    success,
    handleSubmit,
  };
}
