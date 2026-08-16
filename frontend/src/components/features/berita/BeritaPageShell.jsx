"use client";

import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import BeritaPageClient from "./BeritaPageClient";

export default function BeritaPageShell(props) {
  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <BeritaPageClient {...props} />
      </main>
      <Footer />
    </Providers>
  );
}
