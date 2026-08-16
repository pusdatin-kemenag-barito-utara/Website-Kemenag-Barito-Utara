import React, { useRef } from "react";
import {
  ToolbarButton,
  ToggleSwitch,
  CoverThumb,
  ModernSelect
} from "./BeritaUI";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconJustify,
  IconNumber,
  IconLink,
  IconClear,
  IconImage,
  IconBullet
} from "./BeritaIcons";
import { BERITA_CATEGORIES } from "@/lib/berita-utils";
import DatePicker from "@/components/ui/DatePicker";

export function BeritaFormModal({
  open,
  editingId,
  form,
  dirty,
  saving,
  uploadingCover,
  wordCount,
  readingTime,
  previewSlug,
  coverPreviewSrc,
  editorRef,
  error,
  onClose,
  onChange,
  onPublishedToggle,
  onEditorInput,
  onEditorPaste,
  onEditorClick,
  onEditorKeyDown,
  onRunCommand,
  onInsertText,
  onInsertLink,
  onInsertImage,
  onCoverChange,
  isDraggingCover,
  onCoverDragOver,
  onCoverDragLeave,
  onCoverDrop,
  onClearCover,
  onSave,
}) {
  const fileInputRef = useRef(null);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 sm:p-2 md:p-4">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />

      <div className="relative flex h-full w-full sm:w-[95vw] sm:max-w-[95vw] animate-in zoom-in slide-in-from-bottom-8 duration-500 flex-col overflow-hidden bg-slate-50 shadow-2xl sm:h-[94vh] sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 dark:bg-slate-900">

        {/* Header - Fixed */}
        <div className="shrink-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-800/30 sm:px-6 sm:py-3.5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/20 dark:bg-white dark:text-black dark:shadow-none">
              <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white sm:text-lg">
                {editingId ? "Update Berita" : "Buat Berita Baru"}
              </h3>
              <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${dirty ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {dirty ? "Ada perubahan" : "Draft Tersimpan"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-90 dark:bg-slate-800 dark:hover:bg-rose-900/40"
          >
            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto sm:overflow-hidden">
          <div className="flex flex-col sm:grid sm:h-full sm:grid-cols-1 xl:grid-cols-[1fr_360px]">

            {/* Left Column - Main Form & Editor */}
            <div className="flex flex-col border-r border-slate-100 dark:border-slate-800/50 sm:h-full sm:overflow-hidden">
              {/* Top Fields */}
              <div className="shrink-0 space-y-3 p-4 sm:p-5 sm:pb-2.5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Judul Utama</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    placeholder="Tulis judul berita..."
                    className="mt-1 h-11 sm:h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm sm:text-base font-bold text-slate-900 outline-none transition-all focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-white"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Slug URL</label>
                    <input
                      name="slug"
                      value={form.slug}
                      onChange={onChange}
                      placeholder="slug-berita"
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs sm:text-sm font-semibold text-slate-900 outline-none transition-all focus:border-slate-900 dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <ModernSelect
                      label="Kategori"
                      name="category"
                      value={form.category}
                      options={BERITA_CATEGORIES}
                      onChange={onChange}
                      buttonClassName="h-11"
                    />
                  </div>
                  <div>
                    <DatePicker
                      label="Publikasi"
                      value={form.published_at}
                      buttonClassName="mt-1 h-11"
                      onChange={(date) =>
                        onChange({ target: { name: "published_at", value: date } })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Editor Section */}
              <div className="flex flex-col p-4 pt-1 sm:p-5 sm:pt-1 sm:flex-1 sm:min-h-0 sm:overflow-hidden">
                <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-800/20 dark:shadow-none sm:h-full sm:overflow-hidden">
                  <div className="shrink-0 flex items-center justify-between px-1">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Isi Konten</h4>
                    <div className="flex items-center gap-2.5 rounded-lg bg-slate-900 px-2.5 py-1 dark:bg-slate-800">
                      <span className="text-[9px] font-black uppercase text-white dark:text-slate-400">{wordCount} Kata</span>
                      <div className="h-2 w-[1px] bg-white/20 dark:bg-slate-600" />
                      <span className="text-[9px] font-black uppercase text-white/60 dark:text-slate-400">{readingTime} Min</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-wrap items-center gap-0.5 rounded-lg bg-slate-50 p-1 border border-slate-100 dark:bg-slate-800/50 dark:border-none">
                    <ToolbarButton title="Bold" onClick={() => onRunCommand("bold")}><IconBold /></ToolbarButton>
                    <ToolbarButton title="Italic" onClick={() => onRunCommand("italic")}><IconItalic /></ToolbarButton>
                    <ToolbarButton title="Underline" onClick={() => onRunCommand("underline")}><IconUnderline /></ToolbarButton>
                    <div className="mx-1 h-3.5 w-px bg-slate-200 dark:bg-slate-700" />
                    <ToolbarButton title="L" onClick={() => onRunCommand("justifyLeft")}><IconAlignLeft /></ToolbarButton>
                    <ToolbarButton title="C" onClick={() => onRunCommand("justifyCenter")}><IconAlignCenter /></ToolbarButton>
                    <ToolbarButton title="R" onClick={() => onRunCommand("justifyRight")}><IconAlignRight /></ToolbarButton>
                    <ToolbarButton title="J" onClick={() => onRunCommand("justifyFull")}><IconJustify /></ToolbarButton>
                    <div className="mx-1 h-3.5 w-px bg-slate-200 dark:bg-slate-700" />
                    <ToolbarButton title="Bullet List" onClick={() => onRunCommand("insertUnorderedList")}><IconBullet /></ToolbarButton>
                    <ToolbarButton title="Number List" onClick={() => onRunCommand("insertOrderedList")}><IconNumber /></ToolbarButton>
                    <div className="mx-1 h-3.5 w-px bg-slate-200 dark:bg-slate-700" />
                    <ToolbarButton title="Link" onClick={onInsertLink}><IconLink /></ToolbarButton>
                    <ToolbarButton title="Gambar" onClick={onInsertImage}><IconImage /></ToolbarButton>
                  </div>

                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={onEditorInput}
                    onPaste={onEditorPaste}
                    onClick={onEditorClick}
                    onKeyDown={onEditorKeyDown}
                    className="admin-editor-content min-h-[300px] sm:flex-1 overflow-y-auto custom-scrollbar rounded-xl border border-slate-100 bg-slate-50/30 px-5 py-4 text-sm leading-relaxed text-slate-700 outline-none focus:ring-4 focus:ring-slate-900/5 selection:bg-emerald-200 selection:text-emerald-900 dark:border-slate-800/50 dark:bg-slate-900/40 dark:text-slate-300 dark:selection:bg-emerald-600/60 dark:selection:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="flex flex-col bg-slate-50/50 p-4 sm:p-5 dark:bg-slate-900/20 sm:h-full sm:overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-800/20 dark:shadow-none">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Status Tayang</label>
                  <div className="mt-3">
                    <ToggleSwitch
                      checked={form.is_published}
                      onChange={onPublishedToggle}
                      label={form.is_published ? "PUBLIK" : "DRAFT"}
                      description="Konten akan tampil jika diset Publik."
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-800/20 dark:shadow-none">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gambar Utama (Cover)</label>
                    {coverPreviewSrc && (
                      <button
                        type="button"
                        onClick={onClearCover}
                        className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-wider transition-colors"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={onCoverChange}
                  />

                  {coverPreviewSrc ? (
                    <div
                      onDragOver={onCoverDragOver}
                      onDragLeave={onCoverDragLeave}
                      onDrop={onCoverDrop}
                      className="group relative w-full aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm"
                    >
                      <CoverThumb
                        src={coverPreviewSrc}
                        alt="Preview Cover"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Overlay On Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 rounded-xl bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-lg hover:bg-white transition-all active:scale-95"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Ganti Foto
                        </button>

                        <button
                          type="button"
                          onClick={onClearCover}
                          className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-600/90 text-white shadow-lg hover:bg-rose-600 transition-all active:scale-95"
                          title="Hapus Cover"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={onCoverDragOver}
                      onDragLeave={onCoverDragLeave}
                      onDrop={onCoverDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex h-36 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
                        isDraggingCover
                          ? "border-emerald-500 bg-emerald-500/10 scale-[1.02]"
                          : "border-slate-200 bg-slate-50 hover:border-slate-900 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-white"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Pilih Gambar Cover</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Tarik & lepas atau klik</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 pt-1 pb-8 sm:pb-0">
                  {error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 animate-in fade-in">
                      <p className="flex items-center gap-1.5 font-bold">
                        <svg className="h-4 w-4 shrink-0 text-rose-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        {error}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onSave(true)}
                    disabled={saving || uploadingCover}
                    className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 px-5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-slate-900/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 dark:bg-white dark:text-black dark:shadow-none"
                  >
                    {saving ? "Menyimpan..." : "Publish Berita"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSave(false)}
                    disabled={saving || uploadingCover}
                    className="flex h-12 w-full items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-5 text-xs font-black uppercase tracking-wider text-slate-900 transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                  >
                    Simpan Draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
