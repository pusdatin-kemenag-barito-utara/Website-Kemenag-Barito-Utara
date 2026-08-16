// Shim next/image → <img> (tanpa optimizer; proyek baru pakai <img>/picture).
import React from "react";

export default function Image({
  src,
  alt = "",
  width,
  height,
  sizes,
  quality,
  priority,
  fill,
  className,
  style,
  objectFit,
  objectPosition,
  unoptimized,
  loading,
  onError,
  ...rest
}) {
  const baseStyle = { ...(style || {}) };
  if (fill) {
    baseStyle.position = "absolute";
    baseStyle.inset = "0";
    baseStyle.width = "100%";
    baseStyle.height = "100%";
  }
  if (objectFit) baseStyle.objectFit = objectFit;
  if (objectPosition) baseStyle.objectPosition = objectPosition;

  const attrs = { src, alt, className, style: baseStyle, loading };
  if (width && !fill) attrs.width = width;
  if (height && !fill) attrs.height = height;
  if (onError) attrs.onError = onError;
  if (sizes) attrs.sizes = sizes;

  return React.createElement("img", attrs);
}

export const getImageProps = ({ src, alt, ...rest }) => ({
  props: { src, alt, ...rest },
  img: { src, alt, ...rest },
});

export const experimental_optimize = [];
