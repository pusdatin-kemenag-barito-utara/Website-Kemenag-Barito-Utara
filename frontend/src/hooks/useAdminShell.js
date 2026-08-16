import { useEffect, useState, useMemo } from "react";
import { useRouter } from "@/hooks/useNextNavigation";

const SHELL_CACHE_KEY = "kemenag_admin_shell_session";

function getCachedShellSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SHELL_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useAdminShell() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const cached = getCachedShellSession();
  const [sessionData, setSessionData] = useState(cached?.session || null);
  const [permissionContext, setPermissionContext] = useState(cached?.perm || null);
  const [loading, setLoading] = useState(!cached?.session);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      if (active) setLoading(false);
      controller.abort();
    }, 10000);

    async function loadSession() {
      try {
        const [sessionRes, permRes] = await Promise.all([
          fetch("/api/admin/session", { signal: controller.signal }).catch(() => null),
          fetch("/api/admin/my-permissions", { signal: controller.signal }).catch(() => null),
        ]);

        if (!active) return;

        if (!sessionRes || !sessionRes.ok) {
          try { sessionStorage.removeItem(SHELL_CACHE_KEY); } catch {}
          setSessionData(null);
          setPermissionContext(null);
          setLoading(false);
          return;
        }

        const session = await sessionRes.json().catch(() => null);
        const perm = permRes && permRes.ok ? await permRes.json().catch(() => null) : null;

        const hasAdminPanelAccess =
          session?.authenticated === true ||
          session?.permissions?.isAdmin ||
          session?.permissions?.isEditor ||
          session?.permissions?.hasAdminPanelAccess;

        if (!hasAdminPanelAccess) {
          try { sessionStorage.removeItem(SHELL_CACHE_KEY); } catch {}
          setSessionData(null);
          setPermissionContext(null);
          setLoading(false);
          return;
        }

        setSessionData(session);
        setPermissionContext(perm?.permissionContext || null);

        try {
          sessionStorage.setItem(
            SHELL_CACHE_KEY,
            JSON.stringify({ session, perm: perm?.permissionContext || null })
          );
        } catch {}
      } catch {
        if (active && !cached?.session) {
          setSessionData(null);
          setPermissionContext(null);
        }
      } finally {
        clearTimeout(timeoutId);
        if (active) setLoading(false);
      }
    }

    loadSession();

    return () => {
      active = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  const compactName = useMemo(() => {
    const name = String(sessionData?.user?.full_name || "").trim();
    if (name) return name;
    const email = String(sessionData?.user?.email || "").trim();
    return email ? email.split("@")[0] : "Admin";
  }, [sessionData?.user]);

  return {
    sidebarOpen,
    setSidebarOpen,
    sessionData,
    permissionContext,
    loading,
    compactName,
    profile: sessionData?.user || null,
    role:
      sessionData?.permissions?.role ||
      sessionData?.user?.role ||
      permissionContext?.role ||
      (sessionData?.permissions?.isAdmin ? "admin" : (sessionData?.permissions?.isEditor ? "editor" : null)),
  };
}
