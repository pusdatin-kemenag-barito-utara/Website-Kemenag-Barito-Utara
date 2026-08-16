import { formatDate } from "@/lib/date-utils";
import { BeritaDetailBreadcrumb } from "./BeritaDetailLocalized";

export default function BeritaDetailHeader({ title, category, isoDate }) {
  const formattedDate = isoDate ? formatDate(isoDate, "id") : "";
  const formattedTime = isoDate
    ? new Date(isoDate).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    : "";

  return (
    <>
      {/* Official Kop Header (Only Visible When Printing / Exporting to PDF) */}
      <div className="print-only-header">
        <img
          src="/assets/branding/kemenag.svg"
          alt="Logo Kementerian Agama"
        />
        <h1>Kementerian Agama Republik Indonesia</h1>
        <h2 style={{ fontSize: "11pt", margin: "2px 0 0 0", textTransform: "uppercase", color: "#000" }}>
          Kantor Kementerian Agama Kabupaten Barito Utara
        </h2>
        <p>Jalan A. Yani No. 126, Muara Teweh, Kalimantan Tengah | Website Resmi: baritoutara.kemenag.go.id</p>
        
        {/* Judul Berita + Info Waktu & Jam Cetak */}
        <div style={{ marginTop: "16px", textAlign: "left" }}>
          <h3 style={{ fontSize: "14pt", fontWeight: "bold", color: "#000", margin: "0 0 6px 0" }}>
            {title}
          </h3>
          <div className="print-meta-info" style={{ display: "flex", justifyContent: "space-between", fontSize: "9pt", borderBottom: "1px solid #ccc", paddingBottom: "6px", color: "#333" }}>
            <span>Kategori: {category || "Berita"}</span>
            <span>Tanggal Rilis: {formattedDate} {formattedTime ? `(${formattedTime})` : ""}</span>
          </div>
        </div>
      </div>

      <header className="relative bg-emerald-900 dark:bg-slate-900 text-white transition-colors duration-300 py-10 lg:py-14 overflow-hidden no-print">
        <div className="absolute inset-0 bg-linear-to-r from-emerald-950/80 via-emerald-900/60 to-teal-900/80 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/60 pointer-events-none" />
        
        <div className="relative w-full px-6 sm:px-10 lg:px-16 xl:px-20">
          <BeritaDetailBreadcrumb title={title} />
          <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight max-w-4xl">
            {title}
          </h1>
        </div>
      </header>
    </>
  );
}
