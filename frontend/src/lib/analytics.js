/**
 * Sistem Telemetri & Analitik Enterprise untuk Google Analytics 4 (GA4) dan Google Tag Manager (GTM).
 *
 * Mengirimkan event terstruktur secara simultan ke:
 * 1. window.dataLayer (untuk Google Tag Manager)
 * 2. window.gtag (untuk Google Analytics 4)
 */

/**
 * Mengirim event ke dataLayer dan gtag secara aman.
 * @param {string} eventName - Nama event standar GA4/GTM
 * @param {Record<string, any>} params - Parameter payload event
 */
export function pushAnalyticsEvent(eventName, params = {}) {
  if (typeof window === "undefined") return;

  const enrichedPayload = {
    event: eventName,
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
    timestamp: new Date().toISOString(),
    ...params,
  };

  // 1. Push ke Google Tag Manager dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(enrichedPayload);

  // 2. Kirim ke Google Analytics 4 via gtag jika aktif
  if (typeof window.gtag === "function") {
    try {
      window.gtag("event", eventName, params);
    } catch {
      /* silent */
    }
  }

  // Debug log jika diaktifkan (misal via localStorage.setItem('debug_analytics', 'true'))
  if (
    typeof localStorage !== "undefined" &&
    localStorage.getItem("debug_analytics") === "true"
  ) {
    console.groupCollapsed(
      `%c[Analytics Event] ${eventName}`,
      "color: #10b981; font-weight: bold;"
    );
    console.table(enrichedPayload);
    console.groupEnd();
  }
}

/**
 * Tracking Navigasi Halaman (Page View)
 */
export function trackPageView({ path, title, referrer } = {}) {
  pushAnalyticsEvent("page_view", {
    page_path: path || window.location.pathname,
    page_title: title || document.title,
    page_location: window.location.href,
    page_referrer: referrer || document.referrer || "",
  });
}

/**
 * Tracking Klik Menu (Header Nav, Mobile Nav, Dropdown, Footer, Breadcrumb)
 */
export function trackMenuClick({ menuName, menuType, menuUrl, section = "navigation" }) {
  pushAnalyticsEvent("menu_click", {
    menu_name: menuName || "unnamed_menu",
    menu_type: menuType || "header_nav", // "header_nav" | "mobile_nav" | "dropdown" | "footer_nav" | "breadcrumb"
    menu_url: menuUrl || "",
    section,
  });
}

/**
 * Tracking Klik Tombol Interaktif & CTA
 */
export function trackButtonClick({
  buttonText,
  buttonId,
  buttonType = "button",
  section = "content",
  destination = "",
}) {
  pushAnalyticsEvent("button_click", {
    button_text: buttonText || "unnamed_button",
    button_id: buttonId || "",
    button_type: buttonType,
    button_section: section,
    destination_url: destination,
  });
}

/**
 * Tracking Interaksi Dokumen & PDF (Pratinjau)
 */
export function trackDocumentPreview({ title, url, category = "dokumen" }) {
  pushAnalyticsEvent("document_preview", {
    document_title: title || "Dokumen PDF",
    document_url: url || "",
    document_category: category,
    content_type: "pdf",
  });

  // GA4 Recommended Event: select_content
  pushAnalyticsEvent("select_content", {
    content_type: "pdf_document",
    item_id: url || title,
    item_name: title,
  });
}

/**
 * Tracking Unduh Dokumen / Berkas
 */
export function trackDocumentDownload({ title, url, category = "dokumen" }) {
  pushAnalyticsEvent("file_download", {
    file_name: title || url,
    file_url: url || "",
    file_extension: "pdf",
    file_category: category,
  });
}

/**
 * Tracking Klik Tautan Eksternal (Outbound Link: WhatsApp, Sosmed, Portal Pusat)
 */
export function trackOutboundClick({ url, domain, label, category = "external" }) {
  pushAnalyticsEvent("outbound_click", {
    outbound_url: url,
    outbound_domain: domain,
    link_text: label || url,
    outbound_category: category, // "whatsapp" | "social" | "government" | "external"
  });
}

/**
 * Tracking Pencarian Kata Kunci
 */
export function trackSearchQuery({ query, category = "global", resultCount = 0 }) {
  pushAnalyticsEvent("search", {
    search_term: query,
    search_category: category,
    result_count: resultCount,
  });
}

/**
 * Tracking Perubahan Filter (Kategori, Tahun, Status)
 */
export function trackFilterChange({ filterType, filterValue }) {
  pushAnalyticsEvent("filter_change", {
    filter_type: filterType,
    filter_value: String(filterValue),
  });
}

/**
 * Tracking Pengaturan Pengguna (Tema Dark/Light Mode)
 */
export function trackThemeChange(theme) {
  pushAnalyticsEvent("user_preference", {
    preference_type: "theme",
    preference_value: theme, // "dark" | "light"
  });
}

/**
 * Tracking Fitur Aksesibilitas (Ukuran Huruf, Kontras, Dyslexia, Suara)
 */
export function trackAccessibilityAction({ action, value }) {
  pushAnalyticsEvent("accessibility_use", {
    accessibility_action: action,
    accessibility_value: String(value),
  });
}

/**
 * Tracking Interaksi AI Chatbot
 */
export function trackChatInteraction({ action, details = "" }) {
  pushAnalyticsEvent("chat_interaction", {
    chat_action: action, // "open" | "close" | "send_message" | "preset_click"
    chat_details: details,
  });
}

/**
 * Tracking Sesi & Interaksi PWA (Standalone vs Browser)
 */
export function trackPwaInteraction({ action, displayMode }) {
  pushAnalyticsEvent("pwa_interaction", {
    pwa_action: action, // "session_start" | "install_prompt_shown" | "install_accepted"
    display_mode: displayMode || (window.navigator.standalone ? "standalone" : "browser"),
  });
}

/**
 * Tracking Scroll Depth Halaman (25%, 50%, 75%, 90%)
 */
export function trackScrollDepth(percentage, path) {
  pushAnalyticsEvent("scroll_depth", {
    depth_percent: percentage,
    page_path: path || window.location.pathname,
  });
}
