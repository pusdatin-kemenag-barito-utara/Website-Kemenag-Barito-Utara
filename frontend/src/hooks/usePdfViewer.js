import { useState, useEffect, useRef } from "react";

export function usePdfViewer(fileUrl, fileName) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState(820);
  const [zoom, setZoom] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const viewerRef = useRef(null);
  const pageRefs = useRef({});

  useEffect(() => {
    const handleViewport = () => setIsMobile(window.innerWidth < 640);
    handleViewport();
    window.addEventListener("resize", handleViewport);
    return () => window.removeEventListener("resize", handleViewport);
  }, []);

  useEffect(() => {
    if (!viewerRef.current) return;

    const el = viewerRef.current;
    const updateWidth = () => {
      const sidePadding = isMobile ? 8 : 24;
      const next = Math.max(220, Math.min(980, el.clientWidth - sidePadding));
      setContainerWidth(next);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile]);

  const goToPage = (page) => {
    const safePage = Math.max(1, Math.min(numPages || 1, page));
    setCurrentPage(safePage);

    const target = pageRefs.current[safePage];
    if (target && viewerRef.current) {
      viewerRef.current.scrollTo({
        top: target.offsetTop - 8,
        behavior: "smooth",
      });
    }
  };

  const onScrollUpdateCurrentPage = () => {
    if (!viewerRef.current || !numPages) return;

    const scrollTop = viewerRef.current.scrollTop + 24;
    let nearest = 1;
    let minDiff = Number.POSITIVE_INFINITY;

    for (let i = 1; i <= numPages; i += 1) {
      const node = pageRefs.current[i];
      if (!node) continue;
      const diff = Math.abs(node.offsetTop - scrollTop);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = i;
      }
    }

    if (nearest !== currentPage) {
      setCurrentPage(nearest);
    }
  };

  const handleDirectDownload = async () => {
    try {
      const response = await fetch(fileUrl, { mode: "cors" });
      if (!response.ok) throw new Error("Gagal mengunduh file");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.setAttribute("download", fileName);
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const maxZoom = isMobile ? 1.25 : 2;
  const pageWidth = Math.max(220, Math.floor(containerWidth * zoom));

  return {
    numPages,
    setNumPages,
    currentPage,
    setCurrentPage,
    zoom,
    setZoom,
    isMobile,
    viewerRef,
    pageRefs,
    maxZoom,
    pageWidth,
    goToPage,
    onScrollUpdateCurrentPage,
    handleDirectDownload,
  };
}
