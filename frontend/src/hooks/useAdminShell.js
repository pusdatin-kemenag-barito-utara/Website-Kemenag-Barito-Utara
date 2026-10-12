import { useEffect, useState, useMemo } from "react";
import { useRouter } from "@/hooks/useNextNavigation";
import { getPocketBase } from "@/lib/pocketbase/client";

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
    const pb = getPocketBase();

    async function loadSession() {
      try {
        if (!pb.authStore.isValid || !pb.authStore.record) {
          try {
            await pb.collection("users").authRefresh();
          } catch {
            if (!active) return;
            try { sessionStorage.removeItem(SHELL_CACHE_KEY); } catch {}
            setSessionData(null);
            setPermissionContext(null);
            setLoading(false);
            if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
              window.location.replace("/pusdatin/auth");
            }
            return;
          }
        }

        if (!active) return;

        const user = pb.authStore.record;
        if (!user) {
          throw new Error("No user record");
        }

        const role = user.role || "super_admin";
        const session = {
          authenticated: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name || "Admin",
            full_name: user.name || "Admin",
            role: role,
            avatar_url: user.avatar ? pb.files.getURL(user, user.avatar) : "",
          },
          permissions: {
            isAdmin: role === "super_admin" || role === "admin",
            isEditor: role === "editor",
            hasAdminPanelAccess: true,
            role: role,
          },
        };

        const perm = {
          role: role,
          email: user.email,
          isSuperAdmin: role === "super_admin",
          isAdmin: role === "super_admin" || role === "admin",
          isEditor: role === "editor",
          isActive: true,
          approved: true,
        };

        setSessionData(session);
        setPermissionContext(perm);

        try {
          sessionStorage.setItem(
            SHELL_CACHE_KEY,
            JSON.stringify({ session, perm })
          );
        } catch {}
      } catch {
        if (active) {
          try { sessionStorage.removeItem(SHELL_CACHE_KEY); } catch {}
          setSessionData(null);
          setPermissionContext(null);
          if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
            window.location.replace("/pusdatin/auth");
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSession();

    return () => {
      active = false;
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

  useEffect(() => {
    function handleProfileUpdated(e) {
      const { full_name, avatar_url } = e.detail || {};
      setSessionData((prev) => {
        if (!prev || !prev.user) return prev;
        const updatedUser = {
          ...prev.user,
          ...(full_name ? { full_name } : {}),
          ...(avatar_url !== undefined ? { avatar_url } : {}),
        };
        const updated = { ...prev, user: updatedUser };
        try {
          const raw = sessionStorage.getItem(SHELL_CACHE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.session?.user) {
              parsed.session.user = updatedUser;
              sessionStorage.setItem(SHELL_CACHE_KEY, JSON.stringify(parsed));
            }
          }
        } catch (_) {}
        return updated;
      });
    }

    window.addEventListener("admin_profile_updated", handleProfileUpdated);
    return () => window.removeEventListener("admin_profile_updated", handleProfileUpdated);
  }, []);

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
