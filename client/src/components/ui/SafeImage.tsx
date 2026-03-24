'use client';
import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Safe image component with error handling and fallback support
 * Prevents broken image icons and provides graceful degradation
 */
export function SafeImage({ 
  src, 
  alt, 
  fallback, 
  className = '',
  width,
  height 
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  if (hasError && !fallback) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
        style={{ width, height }}
      >
        <ImageOff className="w-8 h-8" />
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
      onError={() => {
        if (!hasError) {
          setHasError(true);
          if (fallback) {
            setImgSrc(fallback);
          }
        }
      }}
    />
  );
}
