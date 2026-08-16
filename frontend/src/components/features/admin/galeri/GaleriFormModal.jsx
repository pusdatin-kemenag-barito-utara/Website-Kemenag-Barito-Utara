import React, { useRef } from "react";
import Image from "@/components/common/NextImage";
import DatePicker from "@/components/ui/DatePicker";

export function GaleriFormModal({
  open,
  editingId,
  form,
  imagePreview,
  saving,
  uploadingImage,
  isDraggingImage,
  onClose,
  onChange,
  onFileChange,
  onImageDragOver,
  onImageDragLeave,
  onImageDrop,
  onRemoveImage,
  onClearAllImages,
  onSave,
}) {
  const fileInputRef = useRef(null);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500" />

      <div className="relative w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-slate-200 bg-slate-50 shadow-2xl animate-in zoom-in-95 duration-500 dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-8 sm:py-6 dark:border-slate-800 dark:bg-slate-900/50">
          <div>
            <h3 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
              {editingId ? "Perbarui Visual" : "Tambah Visual Galeri"}
            </h3>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {editingId ? "Edit Dokumentasi Visual" : "Unggah Banyak Foto Sekaligus (Maks 20 Foto)"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all dark:bg-slate-800"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1">
          <div className="grid gap-5 sm:gap-8 md:grid-cols-5">
            {/* Left: Date & Info (2 cols) */}
            <div className="md:col-span-2 space-y-4">
              <DatePicker
                label="Tanggal Galeri"
                value={form.published_at}
                onChange={(date) =>
                  onChange({ target: { name: "published_at", value: date } })
                }
              />

              <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-emerald-100 p-1 text-emerald-700 dark:bg-emerald-900/40">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold leading-tight text-emerald-800 dark:text-emerald-300">
                      Publikasi Mandiri
                    </p>
                    <p className="text-[10px] text-emerald-700/90 dark:text-emerald-400/90 leading-relaxed">
                      Semua foto yang diunggah akan tampil secara otomatis di galeri publik instansi dengan kompresi WebP tajam.
                    </p>
                  </div>
                </div>
              </div>

              {!editingId && imagePreview && imagePreview.length > 0 && (
                <div className="p-3 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                    <span>Ringkasan Unggahan</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{imagePreview.length} Foto</span>
                  </div>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400">
                    Klik tombol silang merah di tiap foto jika ingin membatalkan foto tertentu.
                  </p>
                </div>
              )}
            </div>

            {/* Right: Upload & Multi-Photo Preview Grid (3 cols) */}
            <div className="md:col-span-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple={!editingId}
                className="hidden"
                onChange={onFileChange}
              />

              {imagePreview && imagePreview.length > 0 ? (
                <div className="space-y-2.5">
                  {/* Action Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Pratinjau Foto ({imagePreview.length})
                      </span>
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                    {!editingId && (
                      <button
                        type="button"
                        onClick={onClearAllImages}
                        className="text-[9px] font-black uppercase tracking-wider text-rose-500 hover:text-rose-700 transition"
                      >
                        Hapus Semua
                      </button>
                    )}
                  </div>

                  {/* Thumbnail Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto p-2 bg-slate-100/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {imagePreview.map((src, idx) => (
                      <div
                        key={idx}
                        className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                      >
                        <img
                          src={src}
                          alt={`Foto ${idx + 1}`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Number Badge */}
                        <div className="absolute top-1.5 left-1.5 bg-slate-950/75 backdrop-blur-xs text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow">
                          #{idx + 1}
                        </div>

                        {/* Remove Button */}
                        {!editingId && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveImage(idx);
                            }}
                            title="Hapus foto ini dari daftar"
                            className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-rose-600 text-white shadow-md hover:bg-rose-700 transition active:scale-90"
                          >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Add More Card */}
                    {!editingId && imagePreview.length < 20 && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition p-3 text-center group"
                      >
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-emerald-500 group-hover:text-white transition mb-1">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 group-hover:text-emerald-600">
                          + Tambah Foto
                        </span>
                        <span className="text-[7px] text-slate-400 mt-0.5">
                          Sisa {20 - imagePreview.length} slot
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Big Dropzone when no images selected */
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Pilih / Drag Foto Visual (3:4)
                  </label>
                  <div
                    onDragOver={onImageDragOver}
                    onDragLeave={onImageDragLeave}
                    onDrop={onImageDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex aspect-[3/4] w-full max-w-[280px] mx-auto cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-6 transition-all ${
                      isDraggingImage
                        ? "border-emerald-500 bg-emerald-500/10 scale-[1.02]"
                        : "border-slate-200 bg-white hover:border-slate-900 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-white"
                    }`}
                  >
                    <div className="text-center space-y-2">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 dark:bg-slate-900">
                        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                          Pilih / Drag Foto Di Sini
                        </p>
                        <p className="mt-1 text-[9px] text-slate-400 font-medium">
                          Bisa pilih 1 hingga 20 foto sekaligus
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg">
                        <span className="text-[8px] font-black uppercase tracking-wider">Kompresi Otomatis &lt; 500KB (WebP)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {uploadingImage && (
                <div className="mt-3 flex items-center justify-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                    Sedang Mengompres & Menyiapkan Foto...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:px-8 sm:py-6 dark:border-slate-800 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="h-10 sm:h-12 rounded-xl bg-rose-600 px-5 sm:px-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95"
          >
            Batal
          </button>
          <button
            onClick={onSave}
            disabled={saving || uploadingImage || !imagePreview || imagePreview.length === 0}
            className="group relative flex h-10 sm:h-12 items-center gap-2 sm:gap-3 overflow-hidden rounded-xl bg-slate-900 px-6 sm:px-8 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/20 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:shadow-none"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
            
            <div className="relative flex items-center gap-2.5">
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
              <span>
                {saving
                  ? "Sedang Mengunggah..."
                  : imagePreview?.length > 1
                  ? `Simpan ${imagePreview.length} Visual Sekaligus`
                  : "Simpan Visual"}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
