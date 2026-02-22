# Summit - Adventure Guide Marketplace

## Project Overview

Summit is a two-sided marketplace connecting adventure travelers with certified outdoor guides. Think "Airbnb for guided outdoor adventures."

**Target Market:** Colorado & US Mountain West (initial launch)

**Business Model:** 12% commission on bookings (lowest in industry)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend/API | Next.js 14 (App Router, Server Components) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Storage | Cloudflare R2 (S3-compatible, zero egress) |
| Payments | Stripe Connect (marketplace payouts) |
| Email | Resend |
| Hosting | Vercel |

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── api/               # API routes (webhooks, uploads)
│   ├── guide/[slug]/      # Public guide profile
│   └── trip/[id]/         # Trip detail page
├── components/
│   ├── ui/                # Reusable primitives (Button, Card, Input)
│   ├── forms/             # Form components
│   └── layout/            # Header, Footer, Sidebar
├── lib/
│   ├── supabase/          # Supabase clients (client.ts, server.ts)
│   ├── stripe.ts          # Stripe utilities
│   ├── r2.ts              # R2 upload utilities
│   └── utils.ts           # General utilities
└── types/
    └── database.ts        # TypeScript types
```

## Key Entities

- **Profile** - User data (extends Supabase auth.users)
- **Guide** - Guide profile with bio, certs, Stripe account
- **Trip** - Listing with dates, pricing, description
- **TripDate** - Available dates with spot counts
- **Booking** - Reservation with payment info
- **Review** - Post-trip reviews (verified only)
- **Media** - Photos/videos for trips and guides

## Core Patterns

### Server Components (Default)
```tsx
// app/trips/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function TripsPage() {
  const supabase = createClient()
  const { data: trips } = await supabase
    .from('trips')
    .select('*, guide:guides(*)')
    .eq('is_active', true)
  
  return <TripList trips={trips} />
}
```

### Client Components (When Needed)
```tsx
'use client'
import { createClient } from '@/lib/supabase/client'

export function BookingButton({ tripId }: { tripId: string }) {
  const supabase = createClient()
  // Use for real-time, mutations, or browser APIs
}
```

### Server Actions
```tsx
// app/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createBooking(formData: FormData) {
  const supabase = createClient()
  // Insert booking, return result
  revalidatePath('/dashboard/bookings')
}
```

### Stripe Connect Flow
1. Guide onboards → Create Connect account
2. Traveler pays → PaymentIntent with application_fee_amount (12%)
3. Webhook confirms → Update booking status
4. Trip completes → Funds transferred to guide

### R2 Upload Flow
1. Request presigned URL from `/api/upload`
2. Upload directly to R2 from client
3. Save public URL to database

## Activity Types
```
mountaineering | rock_climbing | ice_climbing | ski_touring |
backcountry_skiing | hiking | via_ferrata | alpine_climbing |
glacier_travel | canyoneering | other
```

## Difficulty Levels
```
beginner | intermediate | advanced | expert
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `R2_*` - Cloudflare R2 credentials
- `STRIPE_*` - Stripe API keys
- `RESEND_API_KEY` - Resend API key

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run db:types     # Generate Supabase types
```

## Coding Guidelines

1. **Server Components first** - Only use 'use client' when needed
2. **Use Server Actions** - For form submissions and mutations
3. **Type everything** - Leverage generated Supabase types
4. **Mobile-first** - Design for mobile, scale up
5. **Handle states** - Loading, error, empty states for all data fetching
6. **Use existing components** - Check /components/ui before creating new ones

## Current Status

- [x] Project scaffold
- [x] Supabase client setup
- [x] Basic components (Button, Input, Card)
- [x] Homepage
- [ ] Auth (login, register, OAuth)
- [ ] Guide profiles
- [ ] Trip listings
- [ ] Booking flow
- [ ] Payments
- [ ] Reviews
