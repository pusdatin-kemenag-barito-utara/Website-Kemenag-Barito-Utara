import Image from "@/components/common/NextImage";

export default function HeroBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden w-full h-full pointer-events-none select-none">
      <Image
        src="/assets/images/portal-3d-bg.jpg?v=3"
        alt="Visualisasi 3D Gedung Kantor Kemenag Barito Utara"
        fill
        sizes="100vw"
        className="object-cover object-center transition-transform duration-1000 opacity-90 filter saturate-[1.04] contrast-[1.02]"
        priority
        aria-hidden="true"
      />
      {/* Soft vertical atmosphere: subtle header clarity on top and grounded base below, keeping 3D building clear in middle */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f4f8f5]/80 via-transparent to-[#dbe8df]/75" />
      
      {/* Realistic inner depth gradient (vignette cinematic lens effect that draws visual depth inward) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(15,23,42,0.12)_70%,_rgba(6,78,59,0.25)_100%)]" />
      
      {/* Soft inner edge framing for grounded realism */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/15 via-transparent to-slate-900/10" />
    </div>
  );
}
