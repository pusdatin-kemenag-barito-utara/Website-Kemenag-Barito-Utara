import { useState } from "react";
import { useGAEvent } from "@/hooks/useGAEvent";
import { getPocketBase } from "@/lib/pocketbase/client";

const INITIAL = {
  nama: "",
  whatsapp: "",
  subjek: "Pertanyaan",
  pesan: "",
  website: "", // honeypot
};

export function useKontakForm() {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fieldErrors, setFieldErrors] = useState([]);
  const { trackContact, trackEvent } = useGAEvent();

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setFieldErrors([]);

    if (form.website) {
      // honeypot triggered
      setLoading(false);
      setResult({ ok: true, message: "Pesan berhasil dikirim." });
      setForm(INITIAL);
      return;
    }

    try {
      const pb = getPocketBase();
      try {
        await pb.collection("contact_messages").create({
          nama: form.nama.trim(),
          name: form.nama.trim(),
          whatsapp: form.whatsapp.trim(),
          subjek: form.subjek,
          subject: form.subjek,
          pesan: form.pesan.trim(),
          message: form.pesan.trim(),
        });
      } catch {
        // Fallback jika nama collection pesan_kontak
        await pb.collection("pesan_kontak").create({
          nama: form.nama.trim(),
          whatsapp: form.whatsapp.trim(),
          subjek: form.subjek,
          pesan: form.pesan.trim(),
        }).catch(() => {});
      }

      setResult({
        ok: true,
        message: "Pesan berhasil dikirim. Tim kami akan menindaklanjuti pada jam layanan.",
      });
      setForm(INITIAL);

      // ✅ GA4 event — kontak berhasil dikirim (konversi utama)
      trackContact(form.subjek);
    } catch {
      setResult({
        ok: false,
        message: "Terjadi kesalahan jaringan. Silakan coba kembali.",
      });

      // ✅ GA4 event — network error
      trackEvent("form_error", {
        event_category: "kontak",
        form_name: "kontak_publik",
        error_message: "network_error",
      });
    } finally {
      setLoading(false);
    }
  }

  function getFieldError(field) {
    if (!fieldErrors) return null;
    const match = fieldErrors.find((e) => e.field === field);
    return match ? match.message : null;
  }

  return {
    form,
    loading,
    result,
    fieldErrors,
    onChange,
    onSubmit,
    getFieldError,
  };
}
