const SLUG_ORDER = [
  "kepala-kantor",
  "sekjen",
  "seksi-pendidikan-madrasah",
  "seksi-pendidikan-agama-islam",
  "seksi-pendidikan-diniyah-dan-pondok-pesantren",
  "seksi-bimas-islam",
  "penyelenggara-zakat-wakaf",
  "penyelenggara-hindu",
  "kua-kantor-urusan-agama",
];

export function toLeadershipProfile(s = {}) {
  return {
    name: s.nama_kepala || "",
    position:
      s.slug === "sekjen" ? "Kepala Subbagian Tata Usaha" : s.judul || "",
    image: s.foto_kepala || "",
    imageY: typeof s.foto_kepala_y === "number" ? s.foto_kepala_y : 50,
    description: s.deskripsi || "",
    nip: s.nip_kepala || "",
  };
}

export function buildLeadershipData(seksiList = []) {
  if (!Array.isArray(seksiList) || seksiList.length === 0) return [];

  const sorted = [...seksiList].sort((a, b) => {
    const indexA = SLUG_ORDER.indexOf(a.slug);
    const indexB = SLUG_ORDER.indexOf(b.slug);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  const kepalaKantorDb = sorted.find((s) => s.slug === "kepala-kantor");
  const kepalaKantor = kepalaKantorDb
    ? toLeadershipProfile(kepalaKantorDb)
    : {
        name: "H. Arbaja, S.Ag.,M.A.P",
        position: "Kepala Kantor Kementerian Agama Kabupaten Barito Utara",
        image: "",
        imageY: 50,
        description:
          "Memimpin arah kebijakan, koordinasi pelayanan, dan penguatan tata kelola kelembagaan di lingkungan Kemenag Barito Utara.",
        nip: "-",
      };

  kepalaKantor.position =
    "Kepala Kantor Kementerian Agama Kabupaten Barito Utara";

  const dynamicLeaders = sorted
    .filter(
      (s) => s.slug !== "kua-kantor-urusan-agama" && s.slug !== "kepala-kantor",
    )
    .map(toLeadershipProfile);

  return [kepalaKantor, ...dynamicLeaders];
}
