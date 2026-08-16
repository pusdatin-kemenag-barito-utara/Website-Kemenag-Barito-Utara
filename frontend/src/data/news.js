export const newsItems = [
  {
    slug: "kepala-kantor-kemenag-lakukan-monitoring-pelaksanaan-ujian-madrasah",
    title:
      "Kepala Kantor Kemenag Lakukan Monitoring Pelaksanaan Ujian Madrasah",
    desc: "Monitoring dilakukan sebagai bentuk penguatan mutu layanan pendidikan madrasah.",
    category: "Keagamaan",
    date: "2026-04-11",
    cover: "/berita/berita-1.jpg",
  },
  {
    slug: "penguatan-layanan-publik-kemenag-barito-utara-terus-ditingkatkan",
    title: "Penguatan Layanan Publik Kemenag Barito Utara Terus Ditingkatkan",
    desc: "Peningkatan layanan diarahkan agar masyarakat memperoleh akses yang lebih cepat dan mudah.",
    category: "Layanan",
    date: "2026-04-09",
    cover: "/berita/berita-2.jpg",
  },
  {
    slug: "kemenag-barito-utara-perkuat-keterbukaan-informasi-publik",
    title: "Kemenag Barito Utara Perkuat Keterbukaan Informasi Publik",
    desc: "Informasi kelembagaan disusun agar lebih transparan, rapi, dan mudah dipahami masyarakat.",
    category: "Informasi",
    date: "2026-04-07",
    cover: "/berita/berita-3.jpg",
  },
];

export function formatNewsDate(date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function getLatestNews(limit = 3) {
  return [...newsItems]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}
