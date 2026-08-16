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
import PengaturanForm from "@/components/features/admin/pengaturan/PengaturanForm";
import NotFoundView from "@/components/common/NotFoundView";

// Pengganti halaman-halaman App Router admin (layout + page) + proxy guard.
// Prop `page` memilih konten; guard menampilkan 404 bila tidak terautentikasi.
export default function AdminApp({ page, id }) {
  return (
    <ThemeProvider>
      <Guard page={page} id={id} />
    </ThemeProvider>
  );
}

function Guard({ page, id }) {
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
    return <NotFoundView />;
  }

  let content = null;

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
    case "pengaturan":
      content = <PengaturanForm initialSettings={null} />;
      break;
    default:
      content = null;
  }

  return <AdminShell>{content}</AdminShell>;
}
