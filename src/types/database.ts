// ===========================================
// SUMMIT DATABASE TYPES
// ===========================================
// Generate actual types from Supabase with:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserType = 'traveler' | 'guide' | 'admin'

export type ActivityType =
  | 'mountaineering'
  | 'rock_climbing'
  | 'ice_climbing'
  | 'ski_touring'
  | 'backcountry_skiing'
  | 'hiking'
  | 'via_ferrata'
  | 'alpine_climbing'
  | 'glacier_travel'
  | 'canyoneering'
  | 'other'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'disputed'

// ===========================================
// TABLE TYPES
// ===========================================

export interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  user_type: UserType
  phone: string | null
  location: string | null
  created_at: string
  updated_at: string
}

export interface Guide {
  id: string
  user_id: string
  slug: string
  display_name: string
  bio: string | null
  tagline: string | null
  profile_video_url: string | null
  certifications: Certification[]
  languages: string[]
  specialties: ActivityType[]
  base_location: string | null
  years_experience: number | null
  rating: number
  review_count: number
  response_rate: number
  is_verified: boolean
  is_active: boolean
  stripe_account_id: string | null
  stripe_onboarding_complete: boolean
  commission_rate: number
  created_at: string
  updated_at: string
}

export interface Certification {
  name: string
  issuer: string
  year: number
  expiry_year?: number
}

export interface Trip {
  id: string
  guide_id: string
  title: string
  slug: string
  activity: ActivityType
  difficulty: DifficultyLevel
  description: string
  highlights: string[] | null
  itinerary: ItineraryDay[] | null
  inclusions: string[]
  exclusions: string[]
  gear_list: string[]
  meeting_point: string | null
  duration_days: number
  price_per_person: number
  currency: string
  max_group_size: number
  min_group_size: number
  country: string
  region: string
  latitude: number | null
  longitude: number | null
  is_instant_book: boolean
  is_active: boolean
  is_featured: boolean
  view_count: number
  booking_count: number
  created_at: string
  updated_at: string
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
}

export interface TripDate {
  id: string
  trip_id: string
  start_date: string
  end_date: string
  spots_total: number
  spots_available: number
  price_override: number | null
  is_available: boolean
  created_at: string
}

export interface Booking {
  id: string
  trip_id: string
  trip_date_id: string
  user_id: string
  guide_id: string
  status: BookingStatus
  participant_count: number
  total_price: number
  commission_amount: number
  guide_payout: number
  currency: string
  special_requests: string | null
  stripe_payment_intent_id: string | null
  stripe_transfer_id: string | null
  confirmed_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  booking_id: string
  trip_id: string
  guide_id: string
  reviewer_id: string
  rating: number
  title: string | null
  body: string
  guide_response: string | null
  guide_responded_at: string | null
  is_featured: boolean
  created_at: string
}

export interface Media {
  id: string
  entity_type: 'trip' | 'guide' | 'review'
  entity_id: string
  url: string
  thumbnail_url: string | null
  media_type: 'image' | 'video'
  display_order: number
  alt_text: string | null
  created_at: string
}

export interface Message {
  id: string
  booking_id: string | null
  trip_id: string | null
  sender_id: string
  recipient_id: string
  content: string
  read_at: string | null
  created_at: string
}

// ===========================================
// JOINED/COMPUTED TYPES
// ===========================================

export interface GuideWithProfile extends Guide {
  profile: Profile
}

export interface TripWithGuide extends Trip {
  guide: Guide & { profile: Profile }
  media: Media[]
  dates: TripDate[]
}

export interface BookingWithDetails extends Booking {
  trip: Trip
  guide: Guide & { profile: Profile }
  user: Profile
  trip_date: TripDate
}

export interface ReviewWithReviewer extends Review {
  reviewer: Profile
}

// ===========================================
// SUPABASE DATABASE TYPE (for client)
// ===========================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      guides: {
        Row: Guide
        Insert: Omit<Guide, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count'>
        Update: Partial<Omit<Guide, 'id' | 'created_at'>>
      }
      trips: {
        Row: Trip
        Insert: Omit<Trip, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'booking_count'>
        Update: Partial<Omit<Trip, 'id' | 'created_at'>>
      }
      trip_dates: {
        Row: TripDate
        Insert: Omit<TripDate, 'id' | 'created_at'>
        Update: Partial<Omit<TripDate, 'id' | 'created_at'>>
      }
      bookings: {
        Row: Booking
        Insert: Omit<Booking, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Booking, 'id' | 'created_at'>>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at'>
        Update: Partial<Omit<Review, 'id' | 'created_at'>>
      }
      media: {
        Row: Media
        Insert: Omit<Media, 'id' | 'created_at'>
        Update: Partial<Omit<Media, 'id' | 'created_at'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'>
        Update: Partial<Omit<Message, 'id' | 'created_at'>>
      }
    }
  }
}
