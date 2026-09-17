"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import { logError } from "@/lib/logger";

export default function ProfileUpdateModal({ open, onClose, profile, onUpdateSuccess }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  
  // Cropper states
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rawImageSrc, setRawImageSrc] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open && profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || "");
      setAvatarPreview(profile.avatar_url || "");
      setAvatarFile(null);
      setError("");
      setSuccess("");
      setIsCropping(false);
    }
  }, [open, profile]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  if (!open || !mounted) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran foto maksimal 2MB");
      return;
    }
    
    const url = URL.createObjectURL(file);
    setRawImageSrc(url);
    setIsCropping(true);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setError("");
    e.target.value = null; // reset input
  };

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const generateCroppedImage = async () => {
    try {
      const image = await createImage(rawImageSrc);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) return;
          // Add a custom property to simulate a File
          blob.name = "avatar.jpg";
          resolve(blob);
        }, "image/jpeg", 0.95);
      });
    } catch (e) {
      logError("profile_update_crop_error", { error: e?.message });
      return null;
    }
  };

  const handleCropApply = async () => {
    const croppedBlob = await generateCroppedImage();
    if (croppedBlob) {
      setAvatarFile(croppedBlob);
      setAvatarPreview(URL.createObjectURL(croppedBlob));
      setIsCropping(false);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const trimmedName = fullName.trim();
      if (!trimmedName) {
        throw new Error("Nama lengkap tidak boleh kosong");
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sesi login tidak valid. Silakan login kembali.");

      let finalAvatarUrl = profile?.avatar_url;
      let avatarBase64 = null;

      // Konversi avatarFile ke base64 jika ada foto baru
      if (avatarFile) {
        avatarBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(avatarFile);
        });
      }

      // Update ke database backend (backend meng-handle storage upload & DB update)
      const response = await fetch("/api/admin/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: trimmedName,
          email,
          avatarUrl: finalAvatarUrl,
          avatarBase64,
          accessToken: session.access_token,
        }),
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || "Gagal memperbarui profil");

      const newAvatarUrl = resData.avatar_url || resData.data?.avatar_url || finalAvatarUrl;

      setSuccess("Profil berhasil diperbarui.");
      
      // Call success callback to refresh data in parent immediately
      if (onUpdateSuccess) {
        onUpdateSuccess({ full_name: trimmedName, email, avatar_url: newAvatarUrl });
      }

      // Sinkronkan ke sessionStorage & kirim event real-time ke useAdminShell
      if (typeof window !== "undefined") {
        try {
          const raw = sessionStorage.getItem("kemenag_admin_shell_session");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.session?.user) {
              parsed.session.user.full_name = trimmedName;
              if (newAvatarUrl) parsed.session.user.avatar_url = newAvatarUrl;
              sessionStorage.setItem("kemenag_admin_shell_session", JSON.stringify(parsed));
            }
          }
        } catch (_) {}

        window.dispatchEvent(new CustomEvent("admin_profile_updated", {
          detail: { full_name: trimmedName, avatar_url: newAvatarUrl }
        }));
      }

      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 1000);

    } catch (err) {
      setError(err?.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  const getInitials = (name) => {
    if (!name) return "A";
    return name.split(" ").filter(Boolean).map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={(!loading && !isCropping) ? onClose : undefined} 
      />

      <div className="relative w-full max-w-lg animate-in zoom-in slide-in-from-bottom-8 duration-300 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        
        {/* Tombol Tutup X */}
        {!isCropping && !loading && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Tutup"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {isCropping ? (
          <div className="flex flex-col items-center">
            <h3 className="mb-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">Sesuaikan Foto</h3>
            <p className="mb-6 text-center text-xs font-medium text-slate-500">Geser atau zoom untuk menempatkan foto wajah tepat di tengah bingkai.</p>
            
            <div className="relative h-64 w-full overflow-hidden rounded-3xl border-2 border-slate-100 bg-slate-900 dark:border-slate-700">
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="mt-6 flex w-full items-center gap-4">
              <span className="text-xs font-bold text-slate-400">Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600 dark:bg-slate-700"
              />
            </div>

            <div className="mt-8 flex w-full gap-3">
              <button
                type="button"
                onClick={() => setIsCropping(false)}
                className="flex h-11 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-6 text-[12px] font-black uppercase tracking-widest text-slate-700 shadow-xs transition-all hover:bg-slate-200 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCropApply}
                className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-emerald-600 px-6 text-[12px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95"
              >
                Terapkan Foto
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Header */}
            <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Ubah Profil</h3>
            <p className="mt-1 mb-6 px-6 text-center text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              Perbarui nama lengkap dan avatar foto akun admin Anda.
            </p>

            <div className="relative mb-2">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white bg-slate-100 text-4xl font-black text-slate-400 shadow-xl shadow-slate-200/50 transition-all hover:scale-105 active:scale-95 ring-4 ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-500 dark:shadow-none"
              >
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Preview Avatar" 
                    className={`h-full w-full ${
                      avatarPreview.endsWith(".svg") || avatarPreview.includes("kemenag.svg")
                        ? "object-contain p-2.5 bg-white"
                        : "object-cover"
                    }`} 
                  />
                ) : (
                  <span>{getInitials(fullName || profile?.full_name)}</span>
                )}
                
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Permanent Camera Badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-white shadow-lg transition-transform hover:scale-110 hover:bg-emerald-600 dark:border-slate-900"
                title="Unggah Foto Baru"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg,image/png,image/webp" 
                onChange={handleFileChange}
              />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Klik foto untuk ubah avatar</p>
            
            <form onSubmit={handleSubmit} className="mt-6 w-full space-y-4 text-left">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  required
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-800 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-slate-900"
                />
              </div>
              
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                    Alamat Email (Akun Login)
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Terverifikasi
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    readOnly
                    disabled
                    aria-readonly="true"
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-100/80 px-4 py-2.5 pr-10 text-xs font-semibold text-slate-500 cursor-not-allowed select-none dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400"
                  />
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                  Email login terikat dengan kredensial sistem. Hubungi Super Admin jika perlu mutasi email.
                </p>
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-400">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {success}
                </div>
              )}

              <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="order-2 sm:order-1 flex h-11 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-6 text-[12px] font-black uppercase tracking-widest text-slate-700 shadow-xs transition-all hover:bg-slate-200 active:scale-95 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !fullName.trim()}
                  className="order-1 sm:order-2 flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 text-[12px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
