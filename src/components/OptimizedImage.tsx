/**
 * OptimizedImage Component
 * Replaces raw <img> tags with Next.js Image for automatic optimization
 * 
 * Benefits:
 * - Automatic format optimization (WebP, AVIF)
 * - Responsive image sizing
 * - Lazy loading by default
 * - Blur placeholder support
 * - LQIP (Low Quality Image Placeholder)
 */

'use client';

import Image from 'next/image';
import { useState } from 'react';
import clsx from 'clsx';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  blurDataURL?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'scale-down';
  objectPosition?: string;
  onLoad?: () => void;
}

/**
 * OptimizedImage - Drop-in replacement for <img> tags
 * Handles loading states, errors, and responsive sizing
 */
export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  fill = false,
  sizes,
  priority = false,
  className = '',
  containerClassName = '',
  blurDataURL,
  objectFit = 'cover',
  objectPosition = 'center',
  onLoad,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    onLoad?.();
  };

  if (error) {
    return (
      <div
        className={clsx(
          'bg-gray-200 dark:bg-gray-700 flex items-center justify-center',
          containerClassName,
          !fill && `w-${width} h-${height}`
        )}
      >
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'relative overflow-hidden',
        containerClassName,
        isLoading && 'animate-pulse'
      )}
      style={!fill ? { width, height } : undefined}
    >
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={
          sizes ||
          '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
        }
        priority={priority}
        quality={75} // Optimize JPEG/WebP quality
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        className={clsx(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        style={
          fill
            ? {
                objectFit,
                objectPosition,
              }
            : undefined
        }
        onLoadingComplete={handleLoadingComplete}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
      />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer" />
      )}
    </div>
  );
}

/**
 * OptimizedBackgroundImage - For CSS background-image replacements
 * Uses Next.js Image with object-fit positioning
 */
export function OptimizedBackgroundImage({
  src,
  alt,
  children,
  className = '',
  blurDataURL,
  priority = false,
}: {
  src: string;
  alt: string;
  children: React.ReactNode;
  className?: string;
  blurDataURL?: string;
  priority?: boolean;
}) {
  return (
    <div className={clsx('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="absolute inset-0 object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
        priority={priority}
        quality={75}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * ResponsiveImage - Responsive sizing with Next.js Image
 * Automatically generates srcSet and serves responsive sizes
 */
export function ResponsiveImage({
  src: baseSrc,
  alt,
  sizes,
  priority = false,
  className = '',
  containerClassName = '',
}: {
  src: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={containerClassName}>
      <Image
        src={baseSrc}
        alt={alt}
        fill
        sizes={
          sizes ||
          '(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw'
        }
        priority={priority}
        quality={75}
        className={clsx(
          className,
          isLoading && 'animate-pulse'
        )}
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  );
}

/**
 * ImageGallery - Optimized gallery with lazy loading
 */
export function ImageGallery({
  images,
  alt,
  className = '',
}: {
  images: string[];
  alt: string;
  className?: string;
}) {
  return (
    <div className={clsx('grid grid-cols-2 md:grid-cols-3 gap-4', className)}>
      {images.map((src, idx) => (
        <OptimizedImage
          key={src}
          src={src}
          alt={`${alt} ${idx + 1}`}
          width={300}
          height={300}
          objectFit="cover"
          priority={idx === 0} // Load first image immediately
        />
      ))}
    </div>
  );
}
