"use client";

import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import { BeritaDetailBackLink, BeritaDetailSidebar, BeritaDetailDateText } from "./components/BeritaDetailLocalized";
import { BeritaDetailNavigation } from "./components/BeritaDetailNavigation";
import BeritaDetailHeader from "./components/BeritaDetailHeader";
import BeritaTextToSpeech from "./components/BeritaTextToSpeech";
import BeritaReactions from "./components/BeritaReactions";
import EmbeddedImageHandler from "./components/EmbeddedImageHandler";
import CoverImageLightbox from "./components/CoverImageLightbox";
import { sanitizeEditorHtml } from "@/lib/berita-utils";

const FALLBACK_IMAGE = "/assets/branding/kemenag.svg";

/**
 * @param {{ berita?: any, relatedItems?: any[], adjacent?: any }} props
 */
export default function BeritaDetailShell({ berita, relatedItems = [], adjacent = {} }) {
  const coverImage = berita?.coverImage || FALLBACK_IMAGE;

  return (
    <Providers>
      <Header />
      <main id="konten-utama" className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <BeritaDetailHeader
          title={berita?.title}
          category={berita?.category}
          isoDate={berita?.isoDate}
        />

        <main className="bg-slate-50 transition-colors dark:bg-slate-950">
          <section className="w-full px-6 py-8 sm:px-10 lg:px-16 xl:px-20">
            <div className="no-print">
              <BeritaDetailBackLink />
            </div>

            <article className="mt-6 space-y-8">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
                <div className="min-w-0">
                  <article
                    className="prose prose-slate max-w-none rounded-4xl border border-slate-200 bg-white p-6 text-slate-800 shadow-sm md:p-8 lg:p-10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:prose-invert dark:prose-headings:text-white dark:prose-p:text-white dark:prose-strong:text-white dark:prose-a:text-emerald-300 dark:prose-a:no-underline hover:dark:prose-a:text-emerald-200 dark:prose-li:text-white dark:prose-blockquote:text-white dark:prose-figcaption:text-slate-200 dark:prose-hr:border-slate-700 dark:prose-code:text-emerald-300 dark:prose-pre:bg-slate-950 **:text-inherit! [&_p]:text-inherit! [&_li]:text-inherit! [&_blockquote]:text-inherit! [&_span]:text-inherit!"
                    style={{ color: "inherit" }}
                  >
                    <div className="not-prose w-full sm:w-[48%] lg:w-[42%] max-w-[460px] sm:float-left mr-0 sm:mr-6 mb-4 sm:mb-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
                      <CoverImageLightbox
                        src={coverImage}
                        alt={berita?.title || ""}
                        width={800}
                        height={450}
                        priority={true}
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 48vw, 460px"
                      />
                      <div className="bg-slate-50 dark:bg-slate-900/60 px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
                        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Foto Berita: {berita?.title}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          <BeritaDetailDateText isoDate={berita?.isoDate} />
                        </span>
                      </div>
                    </div>

                    <img
                      src={coverImage}
                      alt={berita?.title}
                      className="print-cover-image"
                      style={{ display: "none" }}
                    />

                    <div className="not-prose block xl:hidden mb-6 clear-both lg:clear-none">
                      <BeritaTextToSpeech title={berita?.title || ""} content={berita?.content || ""} />
                    </div>

                    <div
                      className="[&_*]:clear-none [&_div]:!w-auto [&_div]:!block [&_div]:!max-w-none break-words"
                      dangerouslySetInnerHTML={{ __html: sanitizeEditorHtml(berita?.content || "") }}
                    />

                    <EmbeddedImageHandler />

                    <div className="not-prose clear-both" />

                    <div className="not-prose clear-both w-full no-print">
                      <BeritaReactions
                        slug={berita?.slug}
                        initialReactions={{
                          reaction_bermanfaat: berita?.reaction_bermanfaat || 0,
                          reaction_inspiratif: berita?.reaction_inspiratif || 0,
                          reaction_informatif: berita?.reaction_informatif || 0,
                        }}
                      />
                    </div>
                  </article>
                </div>

                <BeritaDetailSidebar
                  category={berita?.category}
                  isoDate={berita?.isoDate}
                  views={berita?.views}
                  title={berita?.title}
                  slug={berita?.slug}
                  author={berita?.author}
                  content={berita?.content}
                />
              </div>
            </article>

            <BeritaDetailNavigation adjacent={adjacent} relatedItems={relatedItems} />
          </section>
        </main>
      </main>
      <Footer />
    </Providers>
  );
}