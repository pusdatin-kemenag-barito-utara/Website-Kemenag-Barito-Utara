import { useState, useEffect, useMemo } from "react";

export function useHomepageSlides(slides) {
  const normalizedSlides = useMemo(() => {
    if (!Array.isArray(slides)) return [];
    return slides
      .filter((item) => item?.image_url && item?.title)
      .map((item) => ({
        ...item,
        category: String(item.category || "ipkp").toLowerCase().trim() || "ipkp",
        sort_order: Number(item.sort_order || 0),
      }))
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [slides]);

  // Grouping slides by category
  const katolikSlides = useMemo(
    () => normalizedSlides.filter((s) => s.category === "katolik"),
    [normalizedSlides],
  );
  const kristenSlides = useMemo(
    () => normalizedSlides.filter((s) => s.category === "kristen"),
    [normalizedSlides],
  );
  const islamSlides = useMemo(
    () => normalizedSlides.filter((s) => s.category === "islam"),
    [normalizedSlides],
  );
  const hinduSlides = useMemo(
    () => normalizedSlides.filter((s) => s.category === "hindu"),
    [normalizedSlides],
  );

  // SKM (Survey Kepuasan Masyarakat): IPKP & IPAK
  const ipkpSlides = useMemo(
    () =>
      normalizedSlides.filter(
        (s) =>
          s.category === "ipkp" ||
          (s.category === "utama" && !s.title?.toLowerCase().includes("ipak")),
      ),
    [normalizedSlides],
  );
  const ipakSlides = useMemo(
    () =>
      normalizedSlides.filter(
        (s) =>
          s.category === "ipak" ||
          (s.category === "utama" && s.title?.toLowerCase().includes("ipak")),
      ),
    [normalizedSlides],
  );

  const sliderSlides = useMemo(() => {
    const religiousSlots = new Set(["katolik", "kristen", "islam", "hindu"]);
    return normalizedSlides.filter((s) => !religiousSlots.has(s.category));
  }, [normalizedSlides]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("skm");

  useEffect(() => {
    if (sliderSlides.length <= 1) return undefined;
    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sliderSlides.length);
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [sliderSlides.length]);

  const safeActiveIndex =
    sliderSlides.length > 0 ? activeIndex % sliderSlides.length : 0;
  const current = sliderSlides[safeActiveIndex];

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? sliderSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % sliderSlides.length);
  };

  return {
    normalizedSlides,
    katolikSlides,
    kristenSlides,
    islamSlides,
    hinduSlides,
    ipkpSlides,
    ipakSlides,
    sliderSlides,
    activeIndex,
    setActiveIndex,
    activeTab,
    setActiveTab,
    safeActiveIndex,
    current,
    prevSlide,
    handleNextSlide,
  };
}
