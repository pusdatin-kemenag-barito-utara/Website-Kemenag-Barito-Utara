"use client";

import { useState, useEffect } from "react";

export function getPdfEmbedUrl(fileUrl) {
  if (!fileUrl) return "";

  const isAbsolute = fileUrl.startsWith("http://") || fileUrl.startsWith("https://");

  // Jika URL relatif / lokal (misal /assets/docs/xxx.pdf), ubah ke URL absolut jika berada di browser
  const absoluteUrl = isAbsolute
    ? fileUrl
    : typeof window !== "undefined"
    ? `${window.location.origin}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`
    : fileUrl;

  // Di SSR / Server-side
  if (typeof window === "undefined") {
    return `${absoluteUrl}#pagemode=thumbs&navpanes=1&view=FitH`;
  }

  const isMobile =
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Jika file berada di domain eksternal publik (misal Supabase / HTTPS publik)
  if (isMobile && isAbsolute) {
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(absoluteUrl)}`;
  }

  // Untuk localhost atau native browser viewer (PDF rendering bawaan browser modern)
  return `${absoluteUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`;
}

/**
 * Hook opsional jika komponen memerlukan re-check saat window di-resize
 */
export function usePdfEmbedUrl(fileUrl) {
  const [embedUrl, setEmbedUrl] = useState(() => getPdfEmbedUrl(fileUrl));

  useEffect(() => {
    const updateUrl = () => setEmbedUrl(getPdfEmbedUrl(fileUrl));
    updateUrl();
    window.addEventListener("resize", updateUrl);
    return () => window.removeEventListener("resize", updateUrl);
  }, [fileUrl]);

  return embedUrl;
}
