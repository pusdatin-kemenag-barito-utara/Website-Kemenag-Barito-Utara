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

  it("resolves /storage/ paths to PocketBase storage URL", () => {
    const localPath = "/storage/berita/foto.webp";
    const result = normalizeCoverImageUrl(localPath);
    expect(result).toContain("/api/files/berita/foto.webp");
  });

  it("resolves /api/storage/media/ paths to PocketBase storage URL", () => {
    const apiPath = "/api/storage/media/galeri/foto.webp";
    const result = normalizeCoverImageUrl(apiPath);
    expect(result).toContain("/api/files/galeri/foto.webp");
  });

  it("resolves full domain URLs containing /api/storage/media/ to PocketBase storage URL", () => {
    const fullApiPath =
      "https://baritoutara.kemenag.go.id/api/storage/media/berita/2026/08/cover-sample.webp";
    const result = normalizeCoverImageUrl(fullApiPath);
    expect(result).toContain(
      "/api/files/berita/2026/08/cover-sample.webp"
    );
  });

  it("preserves valid HTTPS URLs (PocketBase storage)", () => {
    const pbUrl =
      "https://pb.example.test/api/files/berita/xyz123/foto.webp";
    const result = normalizeCoverImageUrl(pbUrl);
    expect(result).toBe(pbUrl);
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
    expect(result).toContain("/api/files/berita/sample.webp");
  });

  it("does not proxy PocketBase storage URLs", () => {
    const pbUrl =
      "https://pb.example.test/api/files/berita/xyz123/foto.webp";
    const result = toCoverPreviewUrl(pbUrl);
    expect(result).toBe(pbUrl);
    expect(result).not.toContain("image-proxy");
  });

  it("does not proxy other generic HTTPS URLs", () => {
    const url = "https://example.com/cover.jpg";
    const result = toCoverPreviewUrl(url);
    expect(result).toBe(url);
    expect(result).not.toContain("image-proxy");
  });
});
