"use client";

import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";
import { siteInfo } from "@/data/site";

export default function BarcodeShell() {
  const portalUrl = siteInfo.siteUrl || "https://baritoutara.kemenag.go.id";

  const downloadQRCode = () => {
    const qrCanvas = document.getElementById("qr-code-canvas");
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
    downloadLink.href = pngUrl;
    downloadLink.download = "QR-Code-Portal-Kemenag.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <PageBanner
          title="Barcode Portal"
          description="Scan QR Code untuk mengakses Portal Layanan Digital Kemenag Barito Utara."
          breadcrumb={[
            { label: "Beranda", href: "/beranda" },
            { label: "Barcode Portal" },
          ]}
        />

        <div className="min-h-[80vh] bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-8 dark:bg-slate-950">
          <div className="w-full max-w-md flex flex-col items-center justify-center text-center p-10 bg-white border-2 border-slate-200 rounded-3xl shadow-xl dark:bg-slate-900 dark:border-slate-800">
            <img
              src={siteInfo.logoSrc}
              alt="Logo Kemenag"
              width={100}
              height={100}
              className="mb-6 object-contain"
            />
            <h1 className="text-xl md:text-2xl font-black mb-1 uppercase text-emerald-800 dark:text-emerald-400">
              Kementerian Agama
            </h1>
            <h2 className="text-lg md:text-xl font-bold mb-8 uppercase text-emerald-700 dark:text-emerald-500">
              Kabupaten Barito Utara
            </h2>

            <div className="bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm mb-8 inline-block dark:bg-white">
              <QRCodeCanvas
                id="qr-code-canvas"
                value={portalUrl}
                size={250}
                level="H"
                fgColor="#000000"
                imageSettings={{
                  src: "/assets/icons/kemenag-512.png",
                  height: 50,
                  width: 50,
                  excavate: true,
                }}
              />
            </div>

            <p className="text-xl font-bold text-slate-800 mb-2 dark:text-slate-100">
              Scan QR Code
            </p>
            <p className="text-sm font-medium text-slate-500 mb-8 max-w-[250px] dark:text-slate-400">
              Akses Portal Layanan Digital Kemenag Barito Utara
            </p>

            <button
              onClick={downloadQRCode}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30"
            >
              Unduh PNG
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </Providers>
  );
}