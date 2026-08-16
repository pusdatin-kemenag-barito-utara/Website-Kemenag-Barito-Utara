"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FloatingFeedback, ToggleSwitch } from "@/components/features/admin/slides/SlidesUI";

const defaultSettings = {
  nama_kantor: "Kementerian Agama Kabupaten Barito Utara",
  alamat: "Jl. Yetro Sinseng No. 12, Muara Teweh, Kabupaten Barito Utara, Kalimantan Tengah 73812",
  telepon: "(0519) 123456",
  whatsapp: "0812-3456-7890",
  email: "baritoutara@kemenag.go.id",
  instagram: "https://instagram.com/kemenag_barut",
  facebook: "https://facebook.com/kemenagbaritoutara",
  youtube: "https://youtube.com/@kemenagbaritoutara",
  tiktok: "",
  jam_layanan_senin: "07:30 - 16:00 WIB",
  jam_layanan_selasa: "07:30 - 16:00 WIB",
  jam_layanan_rabu: "07:30 - 16:00 WIB",
  jam_layanan_kamis: "07:30 - 16:00 WIB",
  jam_layanan_jumat: "07:30 - 16:30 WIB",
  fitur_anti_copas: false,
};

export default function PengaturanForm({ initialSettings }) {
  const [formData, setFormData] = useState({
    ...defaultSettings,
    ...(initialSettings || {}),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch settings from API
  const fetchSettings = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/admin/pengaturan", { cache: "no-store", signal });
      if (!res.ok) throw new Error("Gagal mengambil data pengaturan.");
      const data = await res.json();
      if (data && typeof data === "object") {
        setFormData((prev) => ({
          ...defaultSettings,
          ...prev,
          ...data,
        }));
        if (data.updated_at) {
          setLastUpdated(data.updated_at);
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Terjadi kesalahan saat memuat pengaturan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchSettings(controller.signal);
    return () => controller.abort();
  }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/pengaturan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Gagal menyimpan pengaturan.");
      }

      setMessage("Pengaturan identitas kantor berhasil disimpan.");
      setLastUpdated(new Date().toISOString());

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("settings-updated", { detail: formData }));
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Memuat Pengaturan Identitas...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      <FloatingFeedback
        message={message}
        error={error}
        onClose={() => {
          setMessage("");
          setError("");
        }}
      />

      {/* Header Section */}
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Pengaturan Identitas
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Kelola profil kantor, kontak layanan publik, jadwal operasional PTSP, dan media sosial resmi instansi.
          </p>
        </div>

        {lastUpdated && (
          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Terakhir Diperbarui: {new Date(lastUpdated).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })} WIB
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Card 1: Informasi Utama Kantor */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Profil & Informasi Kantor
              </h2>
              <p className="text-[11px] text-slate-400">
                Nama resmi instansi dan alamat domisili kantor.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="col-span-1 md:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Nama Kantor / Instansi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="nama_kantor"
                value={formData.nama_kantor || ""}
                onChange={handleChange}
                placeholder="Contoh: Kantor Kementerian Agama Kabupaten Barito Utara"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-emerald-400"
                required
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Alamat Lengkap Kantor <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="alamat"
                value={formData.alamat || ""}
                onChange={handleChange}
                rows={3}
                placeholder="Contoh: Jl. Yetro Sinseng No. 12, Muara Teweh, Kalimantan Tengah 73812"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-emerald-400 resize-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Card 2: Jam Layanan Operasional (PTSP) */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Jam Layanan Operasional (PTSP)
              </h2>
              <p className="text-[11px] text-slate-400">
                Waktu jam operasional pelayanan tatap muka kepada masyarakat.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
            {[
              { key: "senin", label: "Senin" },
              { key: "selasa", label: "Selasa" },
              { key: "rabu", label: "Rabu" },
              { key: "kamis", label: "Kamis" },
              { key: "jumat", label: "Jumat" },
            ].map((day) => (
              <div key={day.key} className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {day.label}
                </span>
                <input
                  type="text"
                  name={`jam_layanan_${day.key}`}
                  value={formData[`jam_layanan_${day.key}`] || ""}
                  onChange={handleChange}
                  placeholder="07:30 - 16:00 WIB"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs text-slate-900 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-sky-400 text-center font-mono"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Kontak Publik */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Kontak & Saluran Pengaduan
              </h2>
              <p className="text-[11px] text-slate-400">
                Kontak yang ditampilkan di footer, halaman kontak, dan tombol aduan masyarakat.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Nomor Telepon Kantor
              </label>
              <input
                type="text"
                name="telepon"
                value={formData.telepon || ""}
                onChange={handleChange}
                placeholder="(0519) 123456"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-teal-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                WhatsApp Hotline PTSP
              </label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp || ""}
                onChange={handleChange}
                placeholder="0812-3456-7890"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-teal-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Email Resmi Kantor
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="baritoutara@kemenag.go.id"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-teal-400"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Media Sosial */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Tautan Sosial Media Resmi
              </h2>
              <p className="text-[11px] text-slate-400">
                Tautan channel resmi yang terpasang di header dan footer portal.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Instagram URL
              </label>
              <input
                type="url"
                name="instagram"
                value={formData.instagram || ""}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-rose-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Facebook URL
              </label>
              <input
                type="url"
                name="facebook"
                value={formData.facebook || ""}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-rose-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                YouTube Channel URL
              </label>
              <input
                type="url"
                name="youtube"
                value={formData.youtube || ""}
                onChange={handleChange}
                placeholder="https://youtube.com/@..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-rose-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                TikTok URL (Opsional)
              </label>
              <input
                type="url"
                name="tiktok"
                value={formData.tiktok || ""}
                onChange={handleChange}
                placeholder="https://tiktok.com/@..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-rose-400"
              />
            </div>
          </div>
        </div>

        {/* Card 5: Keamanan & Perlindungan Anti-Copas */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Perlindungan & Keamanan Portal
              </h2>
              <p className="text-[11px] text-slate-400">
                Fitur perlindungan hak cipta dan konten visual instansi.
              </p>
            </div>
          </div>

          <div
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                fitur_anti_copas: !prev.fitur_anti_copas,
              }))
            }
            className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Proteksi Anti-Copas (Khusus Halaman Portal Utama)
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                Jika diaktifkan, pengunjung tidak dapat mengklik kanan atau menyalin teks secara sembarangan khusus di halaman Portal Utama demi perlindungan integritas informasi instansi. Halaman lain tetap normal.
              </p>
            </div>
            <div
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                formData.fitur_anti_copas
                  ? "bg-emerald-600"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                  formData.fitur_anti_copas ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Submit Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Menyimpan Pengaturan...</span>
              </>
            ) : (
              <span>Simpan Pengaturan</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
