"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Download, X, Link as LinkIcon, Check, QrCode } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function BeritaBarcodeModal({
    isOpen,
    onClose,
    title,
    url,
    category,
    date,
    slug,
}) {
    const { t, locale } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    const handleDownloadQr = () => {
        const qrCanvas = document.getElementById("berita-qr-canvas");
        if (!qrCanvas) return;

        const padding = 20;
        const border = 2;
        const borderRadius = 16;
        const size = qrCanvas.width;

        const canvas = document.createElement("canvas");
        canvas.width = size + padding * 2;
        canvas.height = size + padding * 2;
        const ctx = canvas.getContext("2d");

        const x = border / 2;
        const y = border / 2;
        const w = canvas.width - border;
        const h = canvas.height - border;
        const r = borderRadius;

        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();

        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = border;
        ctx.strokeStyle = "#e2e8f0";
        ctx.stroke();

        ctx.drawImage(qrCanvas, padding, padding);

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        const safeSlug = (slug || "berita").toLowerCase().replace(/[^a-z0-9_-]/g, "-").slice(0, 50);
        downloadLink.download = `QR-Berita-${safeSlug}.png`;
        downloadLink.href = pngUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const modalContent = (
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md transition-all"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="barcode-modal-title"
        >
            <div
                className="relative w-full max-w-sm sm:max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                            <QrCode className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 id="barcode-modal-title" className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                                {t("newsDetail.barcodeModalTitle") || "Barcode Berita Resmi"}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {locale === "en" ? "Scan or download QR Code" : "Pindai atau unduh QR Code"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                        aria-label="Tutup"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Printable / Preview Card (Clean without gradient bar) */}
                <div className="mt-4 rounded-2xl border-2 border-slate-200 bg-white p-4 sm:p-5 text-center shadow-xs">
                    {/* Logo & Header */}
                    <img
                        src="/assets/icons/kemenag-512.png"
                        alt="Logo Kemenag"
                        className="mx-auto mb-1.5 h-10 w-10 object-contain"
                    />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                        Kementerian Agama Republik Indonesia
                    </p>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-900">
                        Kantor Kabupaten Barito Utara
                    </p>

                    <div className="my-2.5 h-px w-full bg-slate-200" />

                    {/* Category & Title */}
                    <div className="mb-2">
                        <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                            {category || (locale === "en" ? "Official News" : "Berita Resmi")}
                        </span>
                        {date && (
                            <span className="ml-1.5 text-[10px] text-slate-500">
                                • {date}
                            </span>
                        )}
                        <h4 className="mt-1 line-clamp-2 text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                            {title}
                        </h4>
                    </div>

                    {/* QR Code Canvas */}
                    <div className="my-3 inline-block rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs">
                        <QRCodeCanvas
                            id="berita-qr-canvas"
                            value={url}
                            size={180}
                            level="H"
                            fgColor="#000000"
                            bgColor="#FFFFFF"
                            imageSettings={{
                                src: "/assets/icons/kemenag-512.png",
                                height: 36,
                                width: 36,
                                excavate: true,
                            }}
                        />
                    </div>

                    {/* Instructions */}
                    <p className="text-[11px] leading-relaxed text-slate-600">
                        {t("newsDetail.scanInstruction") ||
                            "Arahkan kamera smartphone ke barcode untuk membuka berita resmi secara langsung."}
                    </p>

                    {/* Truncated URL pill */}
                    <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-[11px] text-slate-600">
                        <span className="truncate font-mono text-[10px] text-emerald-800">
                            {url.replace(/^https?:\/\//, "")}
                        </span>
                        <button
                            onClick={handleCopy}
                            className="inline-flex shrink-0 items-center gap-1 rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3 w-3 text-emerald-600" />
                                    <span className="text-emerald-700">Tersalin</span>
                                </>
                            ) : (
                                <>
                                    <LinkIcon className="h-3 w-3" />
                                    <span>Salin</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Action Buttons: Unduh QR Code & Tutup (Warna Merah) */}
                <div className="mt-4 flex items-center gap-2.5">
                    <button
                        onClick={handleDownloadQr}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
                    >
                        <Download className="h-4 w-4" />
                        <span>{locale === "en" ? "Download QR Code" : "Unduh QR Code"}</span>
                    </button>

                    <button
                        onClick={onClose}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                        <span>{locale === "en" ? "Close" : "Tutup"}</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
