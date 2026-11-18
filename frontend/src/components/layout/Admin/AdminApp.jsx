"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import AdminShell from "./AdminShell";
import { useAdminShell } from "@/hooks/useAdminShell";
import AdminDashboardClient from "@/components/features/admin/AdminDashboardClient";
import AdminBeritaManager from "@/components/features/admin/AdminBeritaManager";
import AdminGaleriManager from "@/components/features/admin/AdminGaleriManager";
import AdminHomepageSlidesManager from "@/components/features/admin/AdminHomepageSlidesManager";
import AdminLaporanPageClient from "@/components/features/admin/AdminLaporanPageClient";
import AdminSeksiListManager from "@/components/features/admin/AdminSeksiListManager";
import AdminSeksiDetailManager from "@/components/features/admin/AdminSeksiDetailManager";
import YoutubeManager from "@/components/features/admin/youtube/YoutubeManager";
import AdminUsersManager from "@/components/features/admin/users/AdminUsersManager";
import PengaturanForm from "@/components/features/admin/pengaturan/PengaturanForm";
import Link from "@/components/common/NextLink";
import { PERMISSIONS } from "@/lib/permissions";

function hasPermAccess(ctx, permission) {
  if (!ctx) return false;
  if (ctx.isSuperAdmin || ctx.role === "super_admin") return true;
  if (!Array.isArray(ctx.permissions)) return false;
  if (ctx.permissions.includes(permission)) return true;
  const prefix = permission.split(":")[0];
  return ctx.permissions.includes(prefix);
}

function hasPageAccess(ctx, role, page) {
  if (!ctx && !role) return false;
  if (ctx?.isSuperAdmin || role === "super_admin") return true;

  switch (page) {
    case "dashboard":
      return hasPermAccess(ctx, PERMISSIONS.DASHBOARD_VIEW);
    case "berita":
      return hasPermAccess(ctx, PERMISSIONS.BERITA_VIEW);
    case "seksi":
    case "seksi-detail":
      return hasPermAccess(ctx, PERMISSIONS.SEKSI_MANAGE);
    case "galeri":
      return hasPermAccess(ctx, PERMISSIONS.GALERI_VIEW);
    case "laporan":
      return hasPermAccess(ctx, PERMISSIONS.LAPORAN_VIEW);
    case "homepage-slides":
      return hasPermAccess(ctx, PERMISSIONS.HOMEPAGE_SLIDES_VIEW) || hasPermAccess(ctx, "slides");
    case "youtube":
      return hasPermAccess(ctx, PERMISSIONS.HOMEPAGE_SLIDES_VIEW) || hasPermAccess(ctx, "youtube:manage");
    case "users":
      return hasPermAccess(ctx, PERMISSIONS.USER_VIEW);
    case "pengaturan":
      return hasPermAccess(ctx, PERMISSIONS.SETTINGS_MANAGE) || hasPermAccess(ctx, "pengaturan:manage");
    default:
      return true;
  }
}

// Pengganti halaman-halaman App Router admin (layout + page) + proxy guard.
// Prop `page` memilih konten; guard menampilkan 404 bila tidak terautentikasi.
/**
 * @param {{ page: string; id?: any; [key: string]: any }} props
 */
export default function AdminApp({ page, id = null }) {
  return (
    <ThemeProvider>
      <Guard page={page} id={id} />
    </ThemeProvider>
  );
}

function Guard({ page, id = null }) {
  const a = useAdminShell();

  if (a.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600 dark:border-slate-800 dark:border-t-emerald-500" />
      </div>
    );
  }

  const hasAccess =
    !!a.role ||
    !!a.sessionData?.authenticated ||
    !!a.sessionData?.permissions?.hasAdminPanelAccess ||
    !!a.sessionData?.permissions?.isAdmin ||
    !!a.sessionData?.permissions?.isEditor;

  if (!hasAccess) {
    if (typeof window !== "undefined") {
      window.location.replace("/pusdatin/auth");
    }
    return null;
  }

  let content = null;

  if (!hasPageAccess(a.permissionContext, a.role, page)) {
    content = (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm dark:border-rose-900/50 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Akses Dibatasi
          </h2>
          <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            Akun Anda tidak memiliki izin untuk membuka modul ini. Hubungi Super Admin jika Anda memerlukan akses tambahan.
          </p>
          <Link
            href="/admin"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  } else {
    switch (page) {
      case "dashboard":
        content = <AdminDashboardClient />;
        break;
      case "berita":
        content = <AdminBeritaManager />;
        break;
      case "galeri":
        content = <AdminGaleriManager />;
        break;
      case "homepage-slides":
        content = <AdminHomepageSlidesManager />;
        break;
      case "laporan":
        content = <AdminLaporanPageClient />;
        break;
      case "seksi":
        content = <AdminSeksiListManager />;
        break;
      case "seksi-detail":
        content = <AdminSeksiDetailManager id={id} />;
        break;
      case "youtube":
        content = (
          <div className="p-4 sm:p-6 lg:p-8">
            <YoutubeManager />
          </div>
        );
        break;
      case "users":
        content = <AdminUsersManager />;
        break;
      case "pengaturan":
        content = <PengaturanForm initialSettings={null} />;
        break;
      default:
        content = null;
    }
  }

  return <AdminShell>{content}</AdminShell>;
}
