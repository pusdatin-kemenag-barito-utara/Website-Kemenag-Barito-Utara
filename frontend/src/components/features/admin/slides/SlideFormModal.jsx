import React, { useRef, useState, useEffect } from "react";
import Image from "@/components/common/NextImage";
import { buildCleanInfografisFileName } from "@/hooks/useSlidesManager";
import { ToggleSwitch } from "./SlidesUI";

export function SlideFormModal({
  open,
  editingId,
  form,
  categories = [],
  imagePreview,
  saving,
  uploadingImage,
  isDraggingImage,
  onClose,
  onChange,
  onFileChange,
  onRemoveSelectedImage,
  onImageDragOver,
  onImageDragLeave,
  onImageDrop,
  onSave,
}) {
  const fileInputRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  // Close dropdown when modal opens/closes
  useEffect(() => {
    if (open) {
      setDropdownOpen(false);
    }
  }, [open]);

  // Modal keyboard shortcuts: Escape to close
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape" && !saving) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, saving, onClose]);

  if (!open) return null;

  const normalizedCat = String(form.category || "ipkp").toLowerCase().trim() || "ipkp";
  const currentCategory =
    categories.find((c) => c.id === normalizedCat) || {
      id: normalizedCat,
      label: normalizedCat.toUpperCase(),
      shortLabel: normalizedCat.toUpperCase(),
      color: "bg-emerald-500",
    };

  const displayFileName = buildCleanInfografisFileName(
    form.title,
    form.image_upload_name || String(form.image_url || "").split("?")[0].split("/").pop()
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={!saving ? onClose : undefined}
      />

      {/* Modal Dialog */}
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-300 dark:border-slate-800 dark:bg-slate-900 z-10 my-auto">
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Formulir Banner
              </p>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {editingId ? "Edit Infografis" : "Tambah Infografis Baru"}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95 disabled:opacity-50 dark:bg-slate-800 dark:hover:bg-rose-900/40"
            title="Tutup (Esc)"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
          {/* Section: Judul & Caption */}
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Judul Infografis <span className="text-rose-500">*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="Contoh: Hasil Survei Kepuasan Masyarakat Triwulan 1"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Keterangan / Caption <span className="text-xs font-normal text-slate-400">(Opsional)</span>
              </label>
              <textarea
                name="caption"
                value={form.caption}
                onChange={onChange}
                placeholder="Deskripsi singkat atau pesan pokok yang disampaikan infografis ini..."
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-emerald-500 dark:focus:bg-slate-800"
              />
            </div>
          </div>

          {/* Section: Kategori, Urutan & Status (Grid 3 Kolom) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            {/* Official Slot Category Selector */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center mb-1.5 h-4">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Kategori Slot
                </label>
              </div>

              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-left text-xs font-bold text-slate-800 flex items-center justify-between transition-all focus:border-emerald-600 focus:bg-white dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`h-2.5 w-2.5 rounded-full ${currentCategory.color || "bg-emerald-500"} shrink-0`} />
                  <span className="truncate">{currentCategory.shortLabel || currentCategory.label || currentCategory.id}</span>
                </div>
                <svg
                  className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                Posisi di beranda: {currentCategory.slotDesc || "Slider Utama (Tengah)"}
              </p>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-[68px] z-50 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 dark:border-slate-800 dark:bg-slate-800 max-h-64 overflow-y-auto custom-scrollbar">
                  {categories
                    .filter((c) => !c.isCustom)
                    .map((cat) => {
                      const isSelected = normalizedCat === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            onChange({ target: { name: "category", value: cat.id } });
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                            isSelected
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                              : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          <span className={`h-2.5 w-2.5 rounded-full ${cat.color || "bg-indigo-500"} shrink-0`} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate">{cat.shortLabel || cat.label || cat.id}</p>
                            {cat.slotDesc && (
                              <p className="text-[10px] font-medium text-slate-400 truncate">
                                Posisi: {cat.slotDesc}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Urutan Tampil */}
            <div>
              <div className="flex items-center mb-1.5 h-4">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Urutan Slider
                </label>
              </div>
              <input
                type="number"
                name="sort_order"
                value={form.sort_order}
                onChange={onChange}
                min="1"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-xs font-bold text-slate-900 outline-none transition-all focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-800/50 dark:text-white"
              />
              <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                Urutan tampil pada kategori &ldquo;{currentCategory.shortLabel || currentCategory.label || currentCategory.id}&rdquo;
              </p>
            </div>

            {/* Status Publikasi */}
            <div>
              <div className="flex items-center mb-1.5 h-4">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Status Tayang
                </label>
              </div>
              <div className="h-12 flex items-center justify-between gap-3 px-4 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      form.is_published ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                    {form.is_published ? "Tayang" : "Draft"}
                  </span>
                </div>
                <ToggleSwitch
                  size="sm"
                  checked={Boolean(form.is_published)}
                  onChange={(val) =>
                    onChange({ target: { name: "is_published", type: "checkbox", checked: val } })
                  }
                />
              </div>
              <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                {form.is_published ? "Tampil di halaman depan" : "Disimpan sebagai draft"}
              </p>
            </div>
          </div>

          {/* Section: Upload & Pratinjau Gambar */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              File Visual Infografis <span className="text-rose-500">*</span>
            </label>

            {imagePreview ? (
              /* Preview Area when image is selected */
              <div className="relative flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                <div className="relative aspect-[4/5] w-32 sm:w-36 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-800">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    sizes="9rem"
                    className="object-contain"
                    unoptimized
                  />
                </div>

                <div className="flex flex-1 min-w-0 flex-col justify-between space-y-3 w-full">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {form.image_upload_base64 ? "Gambar Baru Siap Diunggah" : "Gambar Terpasang"}
                    </span>
                    <p
                      className="mt-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 truncate"
                      title={displayFileName}
                    >
                      {displayFileName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Format gambar dioptimalkan otomatis (&lt; 500KB) agar pemuatan halaman tetap ringan dan cepat.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage || saving}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>{uploadingImage ? "Memproses..." : "Ganti Gambar"}</span>
                    </button>

                    {form.image_upload_base64 && onRemoveSelectedImage && (
                      <button
                        type="button"
                        onClick={onRemoveSelectedImage}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 active:scale-95 disabled:opacity-50 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-400"
                      >
                        <span>Batal Ganti</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Dropzone when no image is selected */
              <div
                onDragOver={onImageDragOver}
                onDragLeave={onImageDragLeave}
                onDrop={onImageDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                  isDraggingImage
                    ? "border-emerald-500 bg-emerald-500/10 scale-[1.01]"
                    : "border-slate-300 bg-slate-50/70 hover:border-emerald-600 hover:bg-emerald-50/20 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-emerald-500"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200/80 text-slate-600 mb-2 dark:bg-slate-700 dark:text-slate-300">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                  {uploadingImage ? "Sedang Memproses Gambar..." : "Klik atau Tarik & Lepas Gambar Di Sini"}
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  Mendukung JPG, PNG, WebP (Rasio potret atau lanskap, kompresi otomatis &lt; 500KB)
                </p>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
        </div>

        {/* Fixed Sticky Footer with Prominent Actions */}
        <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/60 shrink-0">
          <p className="text-[11px] font-bold text-slate-400 hidden sm:block">
            Tekan <kbd className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700 dark:bg-slate-700 dark:text-slate-300">Esc</kbd> untuk membatalkan
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Cancel Button - Solid Red */}
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 sm:flex-none h-11 px-6 rounded-2xl bg-rose-600 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-rose-600/20 transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-50"
            >
              Batalkan
            </button>

            {/* Save Button - Solid Emerald */}
            <button
              type="button"
              onClick={onSave}
              disabled={saving || uploadingImage}
              className="flex-1 sm:flex-none h-11 px-7 rounded-2xl bg-emerald-600 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{editingId ? "Simpan Perubahan" : "Simpan Infografis"}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
