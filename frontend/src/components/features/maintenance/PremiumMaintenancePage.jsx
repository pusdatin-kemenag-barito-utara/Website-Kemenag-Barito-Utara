"use client";

import React from "react";
import { MaintenanceContent } from "./MaintenanceContent";
import { MaintenanceSidebar } from "./MaintenanceSidebar";
import PageBanner from "@/components/common/PageBanner";
import { useLanguage } from "@/context/LanguageContext";

export default function PremiumMaintenancePage({
  title = "Halaman Dalam Maintenance",
  featureName = "Fitur",
  description = "Halaman ini sedang dalam proses pengembangan dan penyesuaian.",
  breadcrumb,
}) {
  const { t } = useLanguage();

  const defaultBreadcrumb = [
    { label: t("nav.home"), href: "/beranda" },
    { label: t("nav.zonaIntegritas"), href: "/zona-integritas" },
    { label: featureName },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 transition-colors dark:bg-slate-950">
      <PageBanner
        title={featureName}
        description={description}
        breadcrumb={breadcrumb || defaultBreadcrumb}
      />

      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-size-[24px_24px] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]" />

      <section className="flex w-full items-center px-6 py-10 sm:px-10 lg:px-16 xl:px-20">
        <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <MaintenanceContent
            title={title}
            featureName={featureName}
            description={description}
          />
          <MaintenanceSidebar />
        </div>
      </section>
    </main>
  );
}

