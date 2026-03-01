/**
 * Caching Utilities for Summit Platform
 * Implements server-side caching strategies for API responses
 * 
 * Strategy: 
 * - Short-lived cache (1-5 min) for user lists, trips, analytics
 * - Long-lived cache (1 hour) for static content (guides, FAQs)
 * - Revalidate tags for targeted cache invalidation
 */

import { revalidateTag } from 'next/cache';

// Cache duration constants (in seconds)
export const CACHE_DURATIONS = {
  SHORT: 60,        // 1 minute - user lists, real-time data
  MEDIUM: 300,      // 5 minutes - trips, bookings, reviews
  LONG: 3600,       // 1 hour - guides, static content
  VERY_LONG: 86400, // 24 hours - FAQ, terms, policies
};

// Cache tags for revalidation
export const CACHE_TAGS = {
  TRIPS: 'trips',
  GUIDES: 'guides',
  BOOKINGS: 'bookings',
  REVIEWS: 'reviews',
  USERS: 'users',
  ANALYTICS: 'analytics',
  ADMIN: 'admin',
  UGC: 'ugc',
  DISPUTES: 'disputes',
  REPORTS: 'reports',
};

/**
 * Generate cache headers for API responses
 */
export function getCacheHeaders(duration: number, tags?: string[]) {
  const headers = new Headers();
  
  // Set Cache-Control header
  headers.set('Cache-Control', `public, s-maxage=${duration}, stale-while-revalidate=${duration * 2}`);
  
  // Add CDN-Cache-Control for Vercel
  headers.set('CDN-Cache-Control', `public, s-maxage=${duration}, stale-while-revalidate=${duration * 2}`);
  
  // Enable compression
  headers.set('Accept-Encoding', 'gzip, deflate, br');
  
  return headers;
}

/**
 * Add cache tags to response for revalidation
 */
export function addCacheTags(tags: string[]) {
  // This would use the native revalidateTag() in server functions
  // Called explicitly in API routes that modify data
  return tags;
}

/**
 * Revalidate specific cache tag (call on data mutation)
 */
export async function invalidateCache(tag: string) {
  try {
    revalidateTag(tag);
  } catch (error) {
    console.warn(`Failed to revalidate cache tag: ${tag}`, error);
  }
}

/**
 * Revalidate multiple cache tags
 */
export async function invalidateCacheTags(tags: string[]) {
  for (const tag of tags) {
    await invalidateCache(tag);
  }
}

/**
 * In-memory cache for frequently accessed data (client-side)
 * Useful for static lists, enums, configurations
 */
export class LocalCache<T> {
  private cache: Map<string, { data: T; timestamp: number }> = new Map();
  private ttl: number;

  constructor(ttlSeconds: number = 300) {
    this.ttl = ttlSeconds * 1000; // Convert to ms
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

/**
 * Example usage in API routes:
 * 
 * import { getCacheHeaders, CACHE_DURATIONS, CACHE_TAGS } from '@/lib/cache';
 * 
 * export async function GET(request: Request) {
 *   const data = await fetchData();
 *   return new NextResponse(JSON.stringify(data), {
 *     headers: getCacheHeaders(CACHE_DURATIONS.MEDIUM, [CACHE_TAGS.TRIPS]),
 *   });
 * }
 * 
 * export async function POST(request: Request) {
 *   // Modify data
 *   await updateData();
 *   // Revalidate related cache
 *   await invalidateCache(CACHE_TAGS.TRIPS);
 *   return NextResponse.json({ success: true });
 * }
 */
