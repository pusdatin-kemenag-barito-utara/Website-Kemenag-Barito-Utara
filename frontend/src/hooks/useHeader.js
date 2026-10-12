import { useState, useEffect, useMemo, useRef, useDeferredValue } from "react";
import { usePathname, useRouter } from "@/hooks/useNextNavigation";
import { getNavigationItems } from "../data/navigation";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { searchSite } from "../lib/search";
import { getPocketBase } from "@/lib/pocketbase/client";

export function useHeader(options = {}) {
  const currentPathname = usePathname();
  const pathname = currentPathname || options.initialPathname || "";
  const router = useRouter();
  const { locale, setLocale, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const navigationItems = useMemo(() => getNavigationItems(locale), [locale]);

  const [adminState, setAdminState] = useState({
    loaded: false,
    isAdmin: false,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [liveSuggestions, setLiveSuggestions] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const deferredQuery = useDeferredValue(searchQuery);

  const desktopDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = Boolean(options.isHomePage || pathname === "/" || pathname === "/beranda");
  const isTransparent = isHome && !isScrolled && !isMobileMenuOpen;

  useEffect(() => {
    const query = deferredQuery.trim();
    if (!query || query.length < 2) {
      setLiveSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`, {
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : { results: [] }))
        .then((data) => {
          const items = Array.isArray(data?.results)
            ? data.results
            : Array.isArray(data?.items)
              ? data.items
              : [];
          setLiveSuggestions(items);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setLiveSuggestions([]);
          }
        });
    }, 120);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [deferredQuery]);

  const suggestions = useMemo(() => {
    const query = deferredQuery.trim();
    if (!query) return [];

    if (liveSuggestions.length > 0) {
      return liveSuggestions.slice(0, 6);
    }
    return searchSite(query).slice(0, 5);
  }, [deferredQuery, liveSuggestions]);

  const showSuggestions =
    deferredQuery.trim().length > 0 && suggestions.length > 0;

  function setLightTheme() {
    if (theme === "dark") toggleTheme();
  }

  function setDarkTheme() {
    if (theme !== "dark") toggleTheme();
  }

  useEffect(() => {
    const cached = sessionStorage.getItem("admin_session");
    const cachedTime = sessionStorage.getItem("admin_session_time");
    if (cached && cachedTime && Date.now() - Number(cachedTime) < 300000) {
      try {
        setAdminState({ loaded: true, ...JSON.parse(cached) });
        return;
      } catch {}
    }

    function checkAdminSession() {
      try {
        const pb = getPocketBase();
        const isValid = Boolean(pb?.authStore?.isValid);
        const record = pb?.authStore?.record;
        const role = record?.role || "";
        const isAdmin = isValid && (role === "admin" || role === "superadmin" || role === "editor");

        const state = { loaded: true, isAdmin };
        setAdminState(state);

        try {
          sessionStorage.setItem("admin_session", JSON.stringify(state));
          sessionStorage.setItem("admin_session_time", String(Date.now()));
        } catch {}
      } catch {
        setAdminState({ loaded: true, isAdmin: false });
      }
    }

    checkAdminSession();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenMobileDropdown({});
    setOpenDesktopDropdown(null);
    setSearchQuery("");
    setActiveSuggestionIndex(-1);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target)
      ) {
        setOpenDesktopDropdown(null);
        setActiveSuggestionIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
    setOpenMobileDropdown({});
  }

  function toggleMobileMenu() {
    setIsMobileMenuOpen((prev) => !prev);
  }

  function toggleMobileDropdown(label) {
    setOpenMobileDropdown((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  }

  function toggleDesktopDropdown(label) {
    setOpenDesktopDropdown((prev) => (prev === label ? null : label));
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    const activeSuggestion =
      activeSuggestionIndex >= 0 ? suggestions[activeSuggestionIndex] : null;

    if (activeSuggestion?.href) {
      closeMobileMenu();
      setSearchQuery("");
      setActiveSuggestionIndex(-1);
      router.push(activeSuggestion.href);
      return;
    }

    const query = searchQuery.trim();
    closeMobileMenu();
    setSearchQuery("");
    setActiveSuggestionIndex(-1);

    if (!query) {
      router.push("/pencarian");
      return;
    }

    router.push(`/pencarian?q=${encodeURIComponent(query)}`);
  }

  function handleSuggestionSelect(item) {
    closeMobileMenu();
    setSearchQuery("");
    setActiveSuggestionIndex(-1);
    router.push(item.href);
  }

  function handleSearchKeyDown(event) {
    if (!showSuggestions) {
      if (event.key === "Escape") {
        setActiveSuggestionIndex(-1);
        setSearchQuery("");
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev + 1 >= suggestions.length ? 0 : prev + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((prev) =>
        prev - 1 < 0 ? suggestions.length - 1 : prev - 1,
      );
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setSearchQuery("");
      setActiveSuggestionIndex(-1);
    }
  }

  function handleSearchBlur() {
    setTimeout(() => setActiveSuggestionIndex(-1), 150);
  }

  return {
    pathname,
    isHome,
    isScrolled,
    isTransparent,
    locale,
    setLocale,
    t,
    theme,
    toggleTheme,
    navigationItems,
    adminState,
    isMobileMenuOpen,
    openDesktopDropdown,
    setOpenDesktopDropdown,
    openMobileDropdown,
    searchQuery,
    setSearchQuery,
    activeSuggestionIndex,
    desktopDropdownRef,
    suggestions,
    showSuggestions,
    setLightTheme,
    setDarkTheme,
    closeMobileMenu,
    toggleMobileMenu,
    toggleMobileDropdown,
    toggleDesktopDropdown,
    handleSearchSubmit,
    handleSuggestionSelect,
    handleSearchKeyDown,
    handleSearchBlur,
  };
}
