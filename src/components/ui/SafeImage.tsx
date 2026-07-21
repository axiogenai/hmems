"use client";

import { useState } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  fill?: boolean;
}

export function SafeImage({ src, alt, fallbackText, fill, ...props }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-full h-full min-h-[150px] img-placeholder bg-gradient-to-br from-primary-light via-secondary to-accent text-white font-bold flex items-center justify-center p-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <span className="relative z-10 text-xs md:text-sm uppercase tracking-widest">{fallbackText || alt}</span>
      </div>
    );
  }

  const fillClasses = fill ? "absolute inset-0 w-full h-full object-cover" : "";

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      loading="lazy"
      {...props}
      className={`${fillClasses} ${props.className || ""}`}
    />
  );
}
