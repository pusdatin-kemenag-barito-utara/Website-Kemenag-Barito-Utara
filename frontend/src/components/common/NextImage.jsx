import React from 'react';

const NextImage = ({
  src,
  alt = "",
  width,
  height,
  fill,
  priority,
  quality,
  placeholder,
  blurDataURL,
  loader,
  sizes,
  unoptimized,
  objectFit,
  objectPosition,
  className,
  style,
  loading,
  ...props
}) => {
  // Extract Next.js specific props that standard img doesn't understand well or needs translating
  let baseStyle = {};
  if (fill) {
    let fit = 'cover';
    if (className && className.includes('object-contain')) {
      fit = 'contain';
    } else if (className && className.includes('object-fill')) {
      fit = 'fill';
    } else if (className && className.includes('object-none')) {
      fit = 'none';
    } else if (className && className.includes('object-scale-down')) {
      fit = 'scale-down';
    }

    baseStyle = {
      position: 'absolute',
      height: '100%',
      width: '100%',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      objectFit: fit,
      color: 'transparent'
    };
  }

  if (objectFit) baseStyle.objectFit = objectFit;
  if (objectPosition) baseStyle.objectPosition = objectPosition;
  
  // Merge incoming style
  const finalStyle = { ...baseStyle, ...(style || {}) };

  // Note: Astro static image imports return an object like { src: '/_astro/...', width: ..., height: ... }
  const actualSrc = typeof src === 'object' && src !== null ? src.src : src;
  
  // For static imported images, they might not have width/height passed explicitly if `fill` is true
  const actualWidth = width || (typeof src === 'object' ? src.width : undefined);
  const actualHeight = height || (typeof src === 'object' ? src.height : undefined);

  return (
    <img
      src={actualSrc}
      alt={alt || ""}
      width={actualWidth}
      height={actualHeight}
      className={className}
      sizes={sizes}
      style={finalStyle}
      loading={loading || (priority ? "eager" : "lazy")}
      {...props}
    />
  );
};

export default NextImage;
