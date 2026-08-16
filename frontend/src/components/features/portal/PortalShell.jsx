"use client";

import React from "react";
import Providers from "@/components/layout/Providers";
import PortalPage from "@/components/features/portal/PortalPage";

export default function PortalShell({ initialData }) {
  return (
    <Providers initialSettings={initialData?.settings}>
      <PortalPage initialData={initialData} />
    </Providers>
  );
}