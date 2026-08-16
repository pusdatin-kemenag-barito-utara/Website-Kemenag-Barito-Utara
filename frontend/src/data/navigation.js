// src/data/navigation.js

import { messages } from "./i18n";

export function getNavigationItems(locale = "id") {
  const m = messages[locale]?.nav || messages.id.nav;

  return [
    { label: m.home, href: "/beranda" },
    {
      label: m.profil,
      href: "/profil/sejarah",
      children: [
        { label: m.sejarah, href: "/profil/sejarah" },
        { label: m.visiMisi, href: "/profil/visi-misi" },
        { label: m.motto, href: "/profil/motto" },
        { label: m.tugasFungsi, href: "/profil/tugas-fungsi" },
        { label: m.tujuan, href: "/profil/tujuan" },
        { label: m.nilaiBudaya, href: "/profil/nilai-budaya-kerja" },
        { label: m.standarPelayanan, href: "/profil/standar-pelayanan" },
        { label: m.maklumatPelayanan, href: "/profil/maklumat-pelayanan" },
        { label: m.kodeEtik, href: "/profil/kode-etik" },
      ],
    },

    {
      label: m.mediaCenter,
      href: "/berita", // default to berita
      children: [
        { label: m.berita, href: "/berita" },
        { label: m.galeri, href: "/galeri" },
        { label: m.videoYoutube, href: "/video" },
        {
          label: m.dokumenLaporan || "Dokumen Laporan",
          href: "/laporan",
          children: [
            { label: m.laporanSop, href: "/laporan/sop" },
            { label: m.laporanRenstra, href: "/laporan/renstra" },
            { label: m.laporanPj, href: "/laporan/perjanjian-kinerja" },
            { label: m.laporanRk, href: "/laporan/rencana-kinerja" },
            { label: m.laporanCk, href: "/laporan/capaian-kinerja" },
            { label: m.laporanLkj, href: "/laporan/laporan-kinerja" },
            { label: m.laporanRkt, href: "/laporan/rencana-kerja-tahunan" },
          ],
        },
      ],
    },
    { label: m.ppid, href: "https://ppid.kemenag-baritoutara.com" },

    {
      label: m.layanan,
      href: "https://skm.go.id/share/instansi/a461fae7-6b20-40f2-b82d-238c5adf4c01/2",
      children: [
        { label: m.layananPtsp, href: "https://ptsp.kemenag-baritoutara.com/" },
        {
          label: m.layananInovasi,
          href: "#",
          children: [
            {
              label: m.layananInklusi,
              href: "https://inklusi.kemenag-baritoutara.com/",
            },
            {
              label: m.layananArsip,
              href: "https://arsip.kemenag-baritoutara.com/",
            },
            {
              label: m.layananSurat,
              href: "https://surat.kemenag-baritoutara.com/",
            },
            {
              label: m.layananSop,
              href: "https://sop.kemenag-baritoutara.com/",
            },
            { label: m.layananKalkulator, href: "/layanan/kalkulator" },
          ],
        },
        {
          label: m.survey,
          href: "#",
          children: [
            {
              label: m.surveySkm,
              href: "https://skm.go.id/share/instansi/a461fae7-6b20-40f2-b82d-238c5adf4c01/2",
            },
            {
              label: m.surveySiarus,
              href: "https://survei.kemenag-baritoutara.com",
            },
          ],
        },
        {
          label: m.layananPusdatin,
          href: "https://pusdatin.kemenag-baritoutara.com/",
        },
        {
          label: m?.downloadPwa ? m.downloadPwa : "Download Aplikasi Portal (PWA)",
          href: "/layanan/download-app",
        },
      ],
    },

    {
      label: m.informasi,
      href: "/informasi",
      children: [
        { label: m.pejabat, href: "/informasi/profil-pejabat" },
        { label: m.struktur, href: "/informasi/struktur-organisasi" },
        { label: m.regulasi, href: "/informasi/regulasi" },
        { label: m.dasarHukum, href: "/informasi/dasar-hukum" },
      ],
    },

    {
      label: m.zi,
      href: "/zona-integritas/area-perubahan-zi",
      children: [
        { label: m.ziArea, href: "/zona-integritas/area-perubahan-zi" },
        { label: m.ziBerita, href: "/zona-integritas/berita-zona-integritas" },
        { label: m.ziVideo, href: "/zona-integritas/video-pembangunan-zi" },
      ],
    },

    { label: m.ePengaduan, href: "/e-pengaduan" },
    { label: m.kontak, href: "/kontak" },
  ];
}
