import { FooterBrand, FooterMenu, FooterContact, FooterSocial } from "./FooterSections";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SettingsContext";

export default function Footer() {
  const { t } = useLanguage();
  const { siteInfo } = useSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="theme-footer relative overflow-hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="relative w-full px-6 pt-10 pb-20 sm:px-10 sm:pb-24 lg:px-16 xl:px-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.6fr_1fr_0.8fr]">
          <FooterBrand />
          <FooterMenu />
          <FooterContact />
          <FooterSocial />
        </div>

        <div className="mt-8 border-t border-slate-200/60 dark:border-slate-800/60 pt-5">
          <div className="flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
            <p className="theme-footer-muted text-center text-xs sm:text-left">© {year} {siteInfo.shortName}. {t("footer.copyright")}.</p>
            <FooterBadges t={t} />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterBadges({ t }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="theme-footer-badge-accent inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold">{t("home.focus.statusValue")}</span>
      <span className="theme-footer-badge inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold">{t("home.focus.accessValue")}</span>
    </div>
  );
}
