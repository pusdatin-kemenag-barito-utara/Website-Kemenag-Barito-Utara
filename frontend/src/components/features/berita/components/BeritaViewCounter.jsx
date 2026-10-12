import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Eye } from "lucide-react";
import { incrementBeritaViewCount, getPublicBeritaBySlug } from "@/lib/pocketbase/db";
import { getPocketBase } from "@/lib/pocketbase/client";

export default function BeritaViewCounter({ slug, initialViews = 0 }) {
  const { t, locale } = useLanguage();
  const [views, setViews] = useState(Number(initialViews || 0));
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;

    async function recordAndFetchView() {
      try {
        const sessionKey = `viewed_berita_${slug}`;
        const alreadyViewedInSession =
          typeof sessionStorage !== "undefined" &&
          sessionStorage.getItem(sessionKey) === "1";

        if (!alreadyViewedInSession) {
          const updated = await incrementBeritaViewCount(slug);
          try {
            sessionStorage.setItem(sessionKey, "1");
          } catch {}

          if (isMounted && typeof updated?.views === "number") {
            setViews(updated.views);
            setIsUpdating(true);
            setTimeout(() => {
              if (isMounted) setIsUpdating(false);
            }, 800);
          }
        }
      } catch (err) {
        // silent
      }
    }

    recordAndFetchView();

    // Native PocketBase Realtime SSE subscription
    const pb = getPocketBase();
    let unsubscribe = null;
    (async () => {
      try {
        const record = await getPublicBeritaBySlug(slug);
        if (record?.id && isMounted) {
          unsubscribe = await pb.collection("berita").subscribe(record.id, (e) => {
            if (isMounted && e.action === "update" && typeof e.record?.views === "number") {
              setViews(e.record.views);
              setIsUpdating(true);
              setTimeout(() => {
                if (isMounted) setIsUpdating(false);
              }, 800);
            }
          });
        }
      } catch {}
    })();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [slug]);

  return (
    <div className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
      <Eye
        className={`h-4 w-4 text-emerald-600 dark:text-emerald-400 transition-transform duration-300 ${
          isUpdating ? "scale-125 text-emerald-500" : ""
        }`}
      />
      <span
        className={`transition-all duration-300 ${
          isUpdating ? "text-emerald-600 font-bold scale-105" : ""
        }`}
      >
        {views.toLocaleString(locale === "en" ? "en-US" : "id-ID")}{" "}
        {t("berita.readCount") || "kali dibaca"}
      </span>
    </div>
  );
}