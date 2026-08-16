"use client";

import React, { useState, useEffect, useRef } from "react";
import { User } from "lucide-react";
import { buildLeadershipData } from "@/lib/seksi-normalize";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import PageBanner from "@/components/common/PageBanner";

const ProfileNode = ({ data, variant = "secondary", className = "", delay = 0 }) => {
  if (!data) return null;

  const isPrimary = variant === "primary";

  return (
    <div
      className={`w-[160px] sm:w-[180px] lg:w-[200px] flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 relative z-10 animate-fade-in-up ${className}
      ${isPrimary
          ? "bg-gradient-to-br from-[#052033] via-[#0b3b46] to-[#0e5f55] border-transparent shadow-2xl shadow-emerald-900/30 ring-4 ring-emerald-500/20"
          : "bg-white border-slate-100 shadow-lg shadow-slate-100/80 hover:shadow-xl hover:border-emerald-200 dark:bg-slate-900/80 dark:border-slate-800 dark:hover:border-emerald-800"}
    `}>
      <div className={`relative h-20 w-20 sm:h-24 sm:w-24 mb-4 rounded-full overflow-hidden border-4 shadow-lg flex items-center justify-center shrink-0
        ${isPrimary ? "border-white/20 ring-4 ring-emerald-400/20" : "border-slate-50 ring-4 ring-slate-100 dark:border-slate-800 dark:ring-slate-700/50"}`}>
        {data.image && data.image !== "/assets/branding/kemenag.svg" ? (
          <img
            src={data.image}
            alt={data.name}
            className="h-full w-full object-cover"
            style={{ objectPosition: `50% ${data.imageY ?? 50}%` }}
            loading="lazy"
          />
        ) : (
          <User className={`h-10 w-10 sm:h-12 sm:w-12 ${isPrimary ? "text-white/60" : "text-slate-400"}`} />
        )}
      </div>
      <div className="min-h-[44px] flex flex-col items-center justify-start w-full mb-2">
        <h4 className={`font-black text-[14px] sm:text-[15px] leading-snug text-center ${isPrimary ? "text-white" : "text-slate-900 dark:text-white"}`}>
          {data.name}
        </h4>
        {data.nip && data.nip !== "-" && (
          <div className={`mt-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 border ${isPrimary ? "bg-white/10 border-white/20" : "bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700"}`}>
            <p className={`text-[9px] sm:text-[10px] font-mono tracking-wide ${isPrimary ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
              NIP. {data.nip}
            </p>
          </div>
        )}
      </div>
      <div className={`w-full pt-2.5 border-t flex flex-col items-center ${isPrimary ? "border-white/10" : "border-slate-100 dark:border-slate-800/50"}`}>
        <p className={`text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] leading-relaxed ${isPrimary ? "text-emerald-400" : "text-emerald-700 dark:text-emerald-400"}`}>
          {data.position}
        </p>
      </div>
    </div>
  );
};

export default function StrukturOrganisasiShell({ breadcrumb = [], leadershipData = [] }) {
  const [leadershipList, setLeadershipList] = useState(leadershipData);

  useEffect(() => {
    setLeadershipList(leadershipData);
  }, [leadershipData]);

  const abortRef = useRef(null);

  const fetchLatestData = async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/seksi", { cache: "no-store", signal: controller.signal });
      if (!res.ok) return;
      const data = await res.json();
      const raw = Array.isArray(data) ? data : data?.seksi;
      if (Array.isArray(raw) && raw.length > 0) {
        const mapped = Array.isArray(data) ? data : buildLeadershipData(raw);
        setLeadershipList(mapped);
      }
    } catch (e) {
      if (e?.name === "AbortError") return;
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchLatestData, 30000);
    return () => {
      clearInterval(interval);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const kepalaKantor = leadershipList.find((p) => p.position.includes("Kepala Kantor"));
  const kasubbag = leadershipList.find(
    (p) => p.position.includes("Kepala Subbagian") || p.position.includes("Kasubbag"),
  );
  const kasiList = leadershipList.filter(
    (p) =>
      !p.position.includes("Kepala Kantor") &&
      !p.position.includes("Kepala Subbagian") &&
      !p.position.includes("Kasubbag") &&
      !p.position.toLowerCase().includes("tata usaha"),
  );

  let jabatanFungsional = leadershipList.find(
    (p) =>
      p.position.toLowerCase().includes("fungsional") ||
      (p.name && p.name.toLowerCase().includes("fungsional")),
  );
  if (!jabatanFungsional) {
    jabatanFungsional = {
      name: "Kelompok Jabatan",
      position: "Fungsional",
      image: "",
    };
  }

  const date = new Date();
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const currentMonth = monthNames[date.getMonth()];
  const currentYear = date.getFullYear();

  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <div className="min-h-screen bg-slate-50/50 pb-20 dark:bg-[#050B14]">
          <PageBanner
            title="Struktur Organisasi"
            description="Bagan hierarki kepemimpinan dan struktural Kantor Kementerian Agama Kabupaten Barito Utara."
            breadcrumb={breadcrumb}
            eyebrow="Informasi Publik"
          />

          <div className="w-full px-4 sm:px-6 lg:px-10 mt-8 relative z-10">
            <div className="w-full flex justify-end mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                * Bagan Struktur Organisasi Instansi ini diperbarui per bulan{" "}
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 ml-1">
                  {currentMonth} {currentYear}
                </span>
                .
              </div>
            </div>

            <div className="w-full overflow-x-auto pb-12 pt-2 hide-scrollbar">
              <div className="min-w-[1000px] lg:min-w-[1200px] w-full flex flex-col items-center">
                <div className="relative z-10">
                  <ProfileNode data={kepalaKantor} variant="primary" delay={0.1} />
                </div>

                <div className="relative w-full flex justify-center" style={{ height: "240px" }}>
                  <div className="w-[2px] h-full bg-emerald-500 dark:bg-emerald-600"></div>
                  <div className="absolute top-1/2 left-1/2 w-24 sm:w-32 lg:w-48 h-[2px] bg-emerald-500 dark:bg-emerald-600 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-[calc(50%+6rem)] sm:left-[calc(50%+8rem)] lg:left-[calc(50%+12rem)] -translate-y-[56px] sm:-translate-y-[68px] z-10">
                    <ProfileNode data={kasubbag} delay={0.3} />
                  </div>
                </div>

                <div className="w-full flex flex-row items-stretch justify-between relative">
                  <div className="absolute top-0 left-1/2 -ml-[1px] w-[2px] h-full bg-emerald-500 dark:bg-emerald-600 z-0"></div>

                  {kasiList.map((kasi, idx) => (
                    <div key={idx} className="relative flex flex-col items-center flex-1 px-1">
                      <div className="absolute top-30 left-1/2 -ml-[1px] w-[2px] h-24 bg-emerald-500 dark:bg-emerald-600"></div>
                      <div className={`absolute top-30 h-[2px] bg-emerald-500 dark:bg-emerald-600
                        ${idx === 0 ? "left-1/2 right-0" : idx === kasiList.length - 1 ? "left-0 right-1/2" : "left-0 right-0"}
                      `}></div>
                      <div className="pt-50 w-full flex justify-center relative z-10 grow">
                        <ProfileNode data={kasi} className="h-full flex-1" delay={0.5 + idx * 0.1} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative w-full flex justify-center" style={{ height: "120px" }}>
                  <div className="w-[2px] h-full bg-emerald-500 dark:bg-emerald-600"></div>
                </div>

                <div className="w-full flex justify-center relative z-10 mt-0 pr-3 sm:pr-8 lg:pr-12">
                  <ProfileNode data={jabatanFungsional} delay={0.8} />
                </div>
              </div>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}} />
        </div>
      </main>
      <Footer />
    </Providers>
  );
}