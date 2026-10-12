"use client";

import React, { useEffect, useState } from "react";
import {
  StatCard,
} from "@/components/features/admin/dashboard/DashboardUI";
import AdminVisitorCards from "@/components/features/admin/dashboard/AdminVisitorCards";
import DashboardCharts from "@/components/features/admin/DashboardCharts";
import { getPocketBase } from "@/lib/pocketbase/client";

function numberFmt(n) {
  return new Intl.NumberFormat("id-ID").format(Number(n || 0));
}

const CACHE_KEY = "kemenag_dashboard_stats_v5";

function getCachedData() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.data) {
      return parsed.data;
    }
  } catch {
    return null;
  }
  return null;
}

export default function AdminDashboardClient() {
  const cached = typeof window !== "undefined" ? getCachedData() : null;

  const [data, setData] = useState(cached?.data || null);
  const [visitorStats, setVisitorStats] = useState(cached?.visitors || { total: 0, today: 0 });
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const pb = getPocketBase();
        const [visitorRes, beritaPub, beritaDraft, yt, reports, slides, galeri, allBeritaPub] = await Promise.all([
          fetch("/api/visitors", { signal: controller.signal }).catch(() => null),
          pb.collection("berita").getList(1, 1, { filter: "is_published = true", requestKey: null }).catch(() => ({ totalItems: 0 })),
          pb.collection("berita").getList(1, 1, { filter: "is_published = false", requestKey: null }).catch(() => ({ totalItems: 0 })),
          pb.collection("youtube_videos").getList(1, 1, { requestKey: null }).catch(() => ({ totalItems: 0 })),
          pb.collection("report_documents").getList(1, 1, { requestKey: null }).catch(() => ({ totalItems: 0 })),
          pb.collection("homepage_slides").getList(1, 1, { requestKey: null }).catch(() => ({ totalItems: 0 })),
          pb.collection("galeri").getList(1, 1, { requestKey: null }).catch(() => ({ totalItems: 0 })),
          pb.collection("berita").getFullList({
            filter: "is_published = true",
            fields: "id,title,views,category,published_at",
            sort: "-published_at",
            requestKey: null,
          }).catch(() => []),
        ]);

        const visitors = visitorRes ? await visitorRes.json().catch(() => null) : null;
        const totalPublished = beritaPub.totalItems || 0;
        const totalDraft = beritaDraft.totalItems || 0;
        const totalBerita = totalPublished + totalDraft;

        // Hitung total tayangan berita
        const totalViews = allBeritaPub.reduce((acc, b) => acc + (Number(b.views) || 0), 0);

        // Ambil 5 berita terpopuler
        const topBerita = [...allBeritaPub]
          .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
          .slice(0, 5);

        // Hitung tren publikasi 14 hari terakhir
        const days = [];
        const now = new Date();
        for (let i = 13; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          days.push(d.toISOString().slice(0, 10));
        }

        const countByDate = {};
        for (const b of allBeritaPub) {
          if (b.published_at) {
            const dateStr = b.published_at.slice(0, 10);
            countByDate[dateStr] = (countByDate[dateStr] || 0) + 1;
          }
        }

        const trend = days.map((date) => ({
          date,
          count: countByDate[date] || 0,
        }));

        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);
        const recent7 = allBeritaPub.filter((b) => (b.published_at || "").slice(0, 10) >= sevenDaysAgoStr).length;

        // Hitung distribusi kategori berita
        const catCount = {};
        for (const b of allBeritaPub) {
          const cat = (b.category || "Umum").trim();
          if (cat) catCount[cat] = (catCount[cat] || 0) + 1;
        }
        const totalPubCount = allBeritaPub.length || 1;
        const categoryDistribution = Object.entries(catCount)
          .map(([name, count]) => ({
            name,
            count,
            percentage: Math.round((count / totalPubCount) * 100),
          }))
          .sort((a, b) => b.count - a.count);

        const newData = {
          summary: {
            totalBerita,
            totalPublished,
            totalDraft,
            totalViews,
            recent7: recent7 || totalPublished,
            totalYoutubeVideos: yt.totalItems || 0,
            totalReportDocs: reports.totalItems || 0,
            totalSlides: slides.totalItems || 0,
            totalGallery: galeri.totalItems || 0,
          },
          trend,
          topBerita,
          categoryDistribution,
          responseTimeMs: 12,
          redisActive: false,
        };

        const newVisitors =
          visitors && typeof visitors.total === "number"
            ? visitors
            : { total: 0, today: 0 };

        setData(newData);
        setVisitorStats(newVisitors);

        try {
          sessionStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: newData, visitors: newVisitors, timestamp: Date.now() })
          );
        } catch {
          // ignore storage error
        }
      } catch (err) {
        if (err?.name === "AbortError") return;
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  // If initial load and no cache, show modern instant skeleton
  if (loading && !data) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Skeleton Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          <div className="h-36 rounded-3xl bg-slate-200/70 dark:bg-slate-800/60" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-3xl bg-slate-200/70 dark:bg-slate-800/60" />
          ))}
        </div>

        {/* Skeleton Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          <div className="lg:col-span-2 h-72 rounded-3xl bg-slate-200/70 dark:bg-slate-800/60" />
          <div className="h-72 rounded-3xl bg-slate-200/70 dark:bg-slate-800/60" />
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 2. Main Analytics Grid (Ringkas 3x3 Grid) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        <AdminVisitorCards initialStats={visitorStats} />

        <StatCard
          label="Publikasi Berita"
          value={numberFmt(summary.totalBerita)}
          helper={`${numberFmt(summary.recent7)} berita baru 7 hari terakhir`}
          tone="emerald"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v4a2 2 0 002 2h4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h10M7 16h10" />
            </svg>
          }
        />
        <StatCard
          label="Total Jangkauan"
          value={numberFmt(summary.totalViews)}
          helper="Tayangan seluruh konten berita"
          tone="blue"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
        <StatCard
          label="Galeri Visual"
          value={numberFmt(summary.totalGallery)}
          helper="Dokumentasi foto & video"
          tone="indigo"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Infografis"
          value={numberFmt(summary.totalSlides)}
          helper="Banner promo aktif"
          tone="fuchsia"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Video YouTube"
          value={numberFmt(summary.totalYoutubeVideos)}
          helper="Dokumentasi video YouTube"
          tone="rose"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0-4.418-4.03-8-9-8s-9 3.582-9 8 4.03 8 9 8 9-3.582 9-8z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 9l5 3-5 3V9z" />
            </svg>
          }
        />
        <StatCard
          label="Dokumen Laporan"
          value={numberFmt(summary.totalReportDocs)}
          helper="Dokumen publik terbit"
          tone="violet"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </div>

      {/* 3. Visual Analytics & Charts */}
      <div className="pt-4">
        <DashboardCharts
          trend={data?.trend}
          topBerita={data?.topBerita}
          categoryDistribution={data?.categoryDistribution}
          redisActive={data?.redisActive === true}
          responseTimeMs={data?.responseTimeMs}
        />
      </div>
    </div>
  );
}
