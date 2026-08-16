// Chart & Visual Analytics Dashboard Kemenag Barito Utara

function TrendBarChart({ trend = [] }) {
  if (!trend || trend.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Belum ada data publikasi pada periode ini.
      </p>
    );
  }

  const max = Math.max(...trend.map((t) => t.count), 1);
  const barWidth = 100 / trend.length;

  return (
    <div className="w-full">
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="h-44 w-full"
      >
        {trend.map((t, i) => {
          const h = (t.count / max) * 34;
          const x = i * barWidth + 0.5;
          const y = 38 - h;
          const w = barWidth - 1;
          return (
            <g key={t.date} className="group cursor-pointer">
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={1}
                fill="url(#emerald-gradient)"
                className="transition-all duration-300 group-hover:opacity-100 opacity-90"
              />
              {t.count > 0 ? (
                <text
                  x={x + w / 2}
                  y={y - 1}
                  textAnchor="middle"
                  fontSize={2.5}
                  fill="currentColor"
                  className="fill-slate-700 dark:fill-slate-300 font-bold"
                >
                  {t.count}
                </text>
              ) : null}
            </g>
          );
        })}
        <defs>
          <linearGradient id="emerald-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
        <line
          x1={0}
          x2={100}
          y1={38}
          y2={38}
          stroke="#cbd5e1"
          strokeWidth={0.3}
        />
      </svg>

      <div className="mt-3 grid grid-cols-7 gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 md:grid-cols-14">
        {trend.map((t) => (
          <span key={t.date} className="truncate text-center">
            {t.date.slice(5)}
          </span>
        ))}
      </div>
    </div>
  );
}

function TopBeritaList({ items = [] }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada data berita.</p>;
  }

  const max = Math.max(...items.map((i) => i.views), 1);
  const formatter = new Intl.NumberFormat("id-ID");

  return (
    <ol className="space-y-3.5">
      {items.map((item, i) => {
        const pct = Math.max(6, (item.views / max) * 100);
        return (
          <li key={item.id} className="text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="line-clamp-1 text-xs font-bold text-slate-800 dark:text-slate-100">
                <span className="text-emerald-600 dark:text-emerald-400 font-black mr-1">{i + 1}.</span> {item.title}
              </span>
              <span className="shrink-0 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-black text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                {formatter.format(item.views)}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function DashboardCharts({
  trend,
  topBerita,
  categoryDistribution = [],
  redisActive = false,
  responseTimeMs = 42,
}) {
  const categoryColors = [
    { bar: "bg-emerald-500", text: "text-emerald-600 font-black" },
    { bar: "bg-teal-500", text: "text-teal-600 font-black" },
    { bar: "bg-blue-500", text: "text-blue-600 font-black" },
    { bar: "bg-indigo-500", text: "text-indigo-600 font-black" },
  ];

  return (
    <div className="space-y-6">
      {/* Row 1: Tren Publikasi 14 Hari & Berita Terpopuler */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tren Publikasi Bar Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Tren Publikasi 14 Hari
                </h2>
                <p className="text-xs font-medium text-slate-400">Statistik Rilis Konten Harian</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
              Harian
            </span>
          </div>
          <div className="mt-5">
            <TrendBarChart trend={trend} />
          </div>
        </div>

        {/* Berita Terpopuler */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9.879z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Berita Terpopuler
              </h2>
              <p className="text-xs font-medium text-slate-400">Konten Paling Banyak Dibaca</p>
            </div>
          </div>
          <div className="mt-4">
            <TopBeritaList items={topBerita} />
          </div>
        </div>
      </div>

      {/* Row 2: Kartu Analisis Tambahan & Status Performa Sistem */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Kartu Distribusi Konten & Kategori (DATABASE REAL) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Distribusi Kategori Konten
                </h2>
                <p className="text-xs font-medium text-slate-400">Persentase Rilis dari Database PostgreSQL</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-200/40">
              Live DB
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {categoryDistribution && categoryDistribution.length > 0 ? (
              categoryDistribution.map((cat, idx) => {
                const color = categoryColors[idx % categoryColors.length];
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">
                        {cat.name} <span className="text-slate-400 font-medium">({cat.count} berita)</span>
                      </span>
                      <span className={color.text}>{cat.percentage}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${color.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400">Belum ada data kategori terdeteksi.</p>
            )}
          </div>
        </div>

        {/* Kartu Status Performa & Keamanan Server (SYSTEM DYNAMIC) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Status Performa & Keamanan
              </h2>
              <p className="text-xs font-medium text-slate-400">Kesehatan Infrastruktur Server</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Respon Server</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-lg font-black text-slate-900 dark:text-white">~{responseTimeMs} ms</span>
                <span className={`flex h-2 w-2 rounded-full ${responseTimeMs < 800 ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              </div>
              <p className={`mt-1 text-[10px] font-semibold ${responseTimeMs < 200 ? "text-emerald-600 dark:text-emerald-400" : responseTimeMs < 800 ? "text-teal-600 dark:text-teal-400" : "text-amber-600 dark:text-amber-400"}`}>
                {responseTimeMs < 200 ? "Sangat Cepat" : responseTimeMs < 800 ? "Optimal & Aman" : "Trafik Tinggi"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sistem Caching</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {redisActive ? "Redis Active" : "In-Memory Map"}
                </span>
                <span className={`flex h-2 w-2 rounded-full ${redisActive ? "bg-emerald-500" : "bg-amber-500"}`} />
              </div>
              <p className="mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                {redisActive ? "Redis Speed" : "Memory Fallback"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Proteksi Rate Limit</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-lg font-black text-slate-900 dark:text-white">Aktif</span>
                <span className="flex h-2 w-2 rounded-full bg-blue-500" />
              </div>
              <p className="mt-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400">Anti-DDoS On</p>
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-3.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Keamanan Akses</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-lg font-black text-slate-900 dark:text-white">Terproteksi</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Hidden Login Path</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

