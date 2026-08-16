import { toCoverPreviewUrl } from "@/lib/cover-image";
import { formatDate } from "@/lib/date-utils";

export function normalizeBerita(item = {}) {
  if (!item) return null;

  const publishedAt = item.published_at || null;
  const createdAt = item.created_at || null;
  const updatedAt = item.updated_at || null;
  const isoDate = publishedAt || createdAt;
  const rawCoverImage = item.cover_image || "";

  const isPublished = Boolean(item.is_published);

  return {
    id: item.id,
    slug: item.slug,
    title: item.title || "",
    excerpt: item.excerpt || "",
    category: item.category || "Umum",
    date: formatDate(isoDate),
    isoDate,
    coverImage: toCoverPreviewUrl(rawCoverImage),
    cover_image: rawCoverImage,
    content: item.content || "",
    isPublished,
    is_published: isPublished,
    publishedAt,
    published_at: publishedAt,
    createdAt,
    created_at: createdAt,
    updatedAt,
    updated_at: updatedAt,
    views: Number(item.views || 0),
    reaction_bermanfaat: Number(item.reaction_bermanfaat || item.bermanfaat || 0),
    reaction_inspiratif: Number(item.reaction_inspiratif || item.inspiratif || 0),
    reaction_informatif: Number(item.reaction_informatif || item.informatif || 0),
    bermanfaat: Number(item.reaction_bermanfaat || item.bermanfaat || 0),
    inspiratif: Number(item.reaction_inspiratif || item.inspiratif || 0),
    informatif: Number(item.reaction_informatif || item.informatif || 0),
    author: item.profiles?.full_name || item.author || "Admin Kemenag",
  };
}

export function normalizeHomepageSlide(item = {}) {
  if (!item) return null;
  const rawImage = item.image_url || "";
  const imageUrl = toCoverPreviewUrl(rawImage);
  return {
    id: item.id,
    title: item.title || "",
    caption: item.caption || "",
    image_url: imageUrl,
    imageUrl: imageUrl,
    category: item.category || "utama",
    is_published: Boolean(item.is_published),
    sort_order: Number(item.sort_order || 0),
    updated_at: item.updated_at || null,
  };
}

export function normalizeGaleriItem(item = {}) {
  if (!item) return null;
  const rawImage = item.image_url || "";
  const imageUrl = toCoverPreviewUrl(rawImage);
  return {
    id: item.id,
    title: item.title || "",
    image_url: imageUrl,
    imageUrl: imageUrl,
    link_url: item.link_url || "",
    linkUrl: item.link_url || "",
    published_at: item.published_at || null,
    publishedAt: item.published_at || null,
  };
}
