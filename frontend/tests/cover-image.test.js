import { describe, it, expect } from "vitest";
import {
  normalizeCoverImageUrl,
  toCoverPreviewUrl,
} from "@/lib/cover-image";

// ─── normalizeCoverImageUrl ───────────────────────────────────────────────────

describe("normalizeCoverImageUrl", () => {
  it("returns empty string for empty/falsy input", () => {
    expect(normalizeCoverImageUrl("")).toBe("");
    expect(normalizeCoverImageUrl(null)).toBe("");
    expect(normalizeCoverImageUrl(undefined)).toBe("");
  });

  it("preserves local paths starting with /", () => {
    expect(normalizeCoverImageUrl("/assets/images/foto.jpg")).toBe(
      "/assets/images/foto.jpg"
    );
    expect(normalizeCoverImageUrl("/uploads/cover.webp")).toBe(
      "/uploads/cover.webp"
    );
  });

  it("resolves /storage/ paths to Supabase storage URL", () => {
    const localPath = "/storage/berita/foto.webp";
    const result = normalizeCoverImageUrl(localPath);
    expect(result).toContain("/storage/v1/object/public/cms-media/berita/foto.webp");
  });

  it("resolves /api/storage/media/ paths to Supabase storage URL", () => {
    const apiPath = "/api/storage/media/galeri/foto.webp";
    const result = normalizeCoverImageUrl(apiPath);
    expect(result).toContain("/storage/v1/object/public/cms-media/galeri/foto.webp");
  });

  it("preserves valid HTTPS URLs (Supabase storage)", () => {
    const supabaseUrl =
      "https://abc.supabase.co/storage/v1/object/public/cms-media/foto.webp";
    const result = normalizeCoverImageUrl(supabaseUrl);
    expect(result).toBe(supabaseUrl);
  });

  it("preserves other valid HTTPS URLs", () => {
    const url = "https://example.com/image.jpg";
    expect(normalizeCoverImageUrl(url)).toBe(url);
  });

  it("returns raw value for non-URL strings", () => {
    // Not a URL, not a path — returned as-is
    expect(normalizeCoverImageUrl("some-random-string")).toBe("some-random-string");
  });
});

// ─── toCoverPreviewUrl ────────────────────────────────────────────────────────

describe("toCoverPreviewUrl", () => {
  it("returns empty string for empty input", () => {
    expect(toCoverPreviewUrl("")).toBe("");
    expect(toCoverPreviewUrl(null)).toBe("");
  });

  it("preserves local paths (no proxy needed)", () => {
    expect(toCoverPreviewUrl("/assets/icon.png")).toBe("/assets/icon.png");
  });

  it("normalizes storage paths in toCoverPreviewUrl", () => {
    const localPath = "/storage/berita/sample.webp";
    const result = toCoverPreviewUrl(localPath);
    expect(result).toContain("/storage/v1/object/public/cms-media/berita/sample.webp");
  });

  it("does not proxy Supabase storage URLs", () => {
    const supabaseUrl =
      "https://abc.supabase.co/storage/v1/object/public/cms-media/foto.webp";
    const result = toCoverPreviewUrl(supabaseUrl);
    expect(result).toBe(supabaseUrl);
    expect(result).not.toContain("image-proxy");
  });

  it("does not proxy other generic HTTPS URLs", () => {
    const url = "https://example.com/cover.jpg";
    const result = toCoverPreviewUrl(url);
    expect(result).toBe(url);
    expect(result).not.toContain("image-proxy");
  });
});
