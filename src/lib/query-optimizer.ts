/**
 * Query Optimization Utilities
 * Prevents N+1 queries, implements eager loading, batch operations
 */

import { createClient } from '@supabase/supabase-js';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  fields?: string[];
  relations?: string[];
  filters?: Record<string, any>;
  orderBy?: string;
  ascending?: boolean;
}

/**
 * Optimized trip query with eager loading
 * Single query instead of multiple queries for related data
 */
export async function getTripsOptimized(
  supabase: ReturnType<typeof createClient>,
  options: QueryOptions = {}
) {
  const {
    limit = 20,
    offset = 0,
    fields = ['*'],
    relations = ['profiles', 'trips_media'],
    orderBy = 'created_at',
    ascending = false,
  } = options;

  let query = supabase
    .from('trips')
    .select(`
      ${fields.join(', ')},
      ${relations.includes('profiles') ? 'profiles:user_id(id, name, email, photo_url)' : ''},
      ${relations.includes('trips_media') ? 'trips_media(id, media_type, media_url, position)' : ''},
      ${relations.includes('bookings_count') ? 'bookings(count)' : ''},
      ${relations.includes('reviews') ? 'guide_reviews(count, avg(rating))' : ''}
    `)
    .order(orderBy, { ascending })
    .range(offset, offset + limit - 1);

  // Add filters if provided
  if (options.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      query = query.eq(key, value);
    }
  }

  return query;
}

/**
 * Optimized bookings query with user and trip details
 */
export async function getBookingsOptimized(
  supabase: ReturnType<typeof createClient>,
  options: QueryOptions = {}
) {
  const {
    limit = 20,
    offset = 0,
    orderBy = 'created_at',
    ascending = false,
  } = options;

  let query = supabase
    .from('bookings')
    .select(`
      *,
      profiles:user_id(id, name, email, photo_url),
      trips:trip_id(id, title, location, price, photo_url, user_id)
    `)
    .order(orderBy, { ascending })
    .range(offset, offset + limit - 1);

  if (options.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      query = query.eq(key, value);
    }
  }

  return query;
}

/**
 * Batch fetch with optimized queries
 * Prevents N+1: fetch all related data in one query
 */
export async function batchFetchGuides(
  supabase: ReturnType<typeof createClient>,
  guideIds: string[]
) {
  if (guideIds.length === 0) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      trips(count),
      guide_reviews(count, rating)
    `)
    .in('id', guideIds);

  if (error) throw error;
  return data || [];
}

/**
 * Cursor-based pagination for large datasets
 * More efficient than offset-based for large tables
 */
export async function getCursorPaginated<T>(
  supabase: ReturnType<typeof createClient>,
  table: string,
  cursor?: string,
  pageSize: number = 20
) {
  let query = supabase
    .from(table)
    .select('*')
    .limit(pageSize + 1); // Fetch one extra to detect if more pages exist

  if (cursor) {
    query = query.gt('id', cursor);
  }

  const { data, error } = await query;
  if (error) throw error;

  const items = (data || []).slice(0, pageSize) as T[];
  const hasMore = (data || []).length > pageSize;
  const nextCursor = hasMore ? items[items.length - 1]['id'] : null;

  return {
    items,
    hasMore,
    nextCursor,
  };
}

/**
 * Prefetch strategy: Load frequently accessed data upfront
 * Reduces subsequent query load
 */
export async function prefetchCommonData(supabase: ReturnType<typeof createClient>) {
  const results = await Promise.all([
    // Get featured trips
    supabase
      .from('trips')
      .select('id, title, location, price, photo_url')
      .eq('is_featured', true)
      .limit(10),
    
    // Get top-rated guides
    supabase
      .from('profiles')
      .select('id, name, email, photo_url')
      .eq('is_guide', true)
      .limit(10),
    
    // Get recent reviews
    supabase
      .from('guide_reviews')
      .select('*, profiles:reviewer_id(name), trips:trip_id(title)')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  return {
    featured_trips: results[0].data || [],
    top_guides: results[1].data || [],
    recent_reviews: results[2].data || [],
  };
}

/**
 * SELECT specific fields instead of *
 * Reduces payload size
 */
export function optimizeSelect(table: string, fields: string[]) {
  return fields.length > 0 ? fields.join(', ') : '*';
}

/**
 * Connection pooling indicator
 * For monitoring connection efficiency
 */
export interface QueryMetrics {
  duration_ms: number;
  rows_affected: number;
  cache_hit: boolean;
  timestamp: Date;
}

/**
 * Track query metrics (for monitoring/optimization)
 */
export class QueryMetricsCollector {
  private metrics: QueryMetrics[] = [];
  private maxHistory: number = 1000;

  record(duration: number, rowsAffected: number, cacheHit: boolean = false) {
    this.metrics.push({
      duration_ms: duration,
      rows_affected: rowsAffected,
      cache_hit: cacheHit,
      timestamp: new Date(),
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxHistory) {
      this.metrics = this.metrics.slice(-this.maxHistory);
    }
  }

  getAverageDuration(): number {
    if (this.metrics.length === 0) return 0;
    const sum = this.metrics.reduce((acc, m) => acc + m.duration_ms, 0);
    return sum / this.metrics.length;
  }

  getCacheHitRate(): number {
    if (this.metrics.length === 0) return 0;
    const hits = this.metrics.filter(m => m.cache_hit).length;
    return (hits / this.metrics.length) * 100;
  }

  getSummary() {
    return {
      total_queries: this.metrics.length,
      avg_duration_ms: this.getAverageDuration(),
      cache_hit_rate: `${this.getCacheHitRate().toFixed(2)}%`,
      last_query: this.metrics[this.metrics.length - 1],
    };
  }

  clear() {
    this.metrics = [];
  }
}
