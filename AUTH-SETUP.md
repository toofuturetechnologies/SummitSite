# Summit Platform - Authentication Setup

## Overview

Summit now has a complete authentication system that allows guides to sign up, log in, and manage their trips and profile.

## Features Implemented

### 1. **Sign Up (Guides)**
- **Route:** `/auth/signup`
- **Features:**
  - Create Supabase auth user
  - Auto-create profile record linked to auth user
  - Auto-create guide record with display name, tagline, base location
  - Email/password authentication
  - Form validation
  
### 2. **Login**
- **Route:** `/auth/login`
- **Features:**
  - Email/password authentication
  - Error handling
  - Redirect to dashboard on success

### 3. **Guide Dashboard**
- **Route:** `/dashboard` (Protected - requires auth)
- **Features:**
  - View guide profile info (name, tagline, rating)
  - View statistics (rating, active trips, total trips)
  - List all trips created by guide
  - Edit/manage trips
  - Edit profile
  - Logout

### 4. **Auth Context**
- **File:** `src/app/auth-layout.tsx`
- **Hook:** `useAuth()`
- **Features:**
  - Check current user
  - Listen for auth state changes
  - Returns `{ user, loading }`

## File Structure

```
src/app/
├── auth/
│   ├── login/
│   │   └── page.tsx       # Login form
│   └── signup/
│       └── page.tsx       # Sign up form
├── dashboard/
│   └── page.tsx           # Main guide dashboard (protected)
├── page.tsx               # Updated home page with auth links
└── auth-layout.tsx        # Auth context hook
```

## Database Schema

### auth.users
- Created automatically by Supabase when user signs up
- Stores email, password (encrypted), and metadata

### profiles
- **id:** UUID (references auth.users.id)
- **full_name:** User's full name
- **email:** Email address
- **user_type:** 'guide' or 'traveler'
- **avatar_url:** Profile image (optional)

### guides
- **user_id:** UUID (references profiles.id)
- **slug:** URL-friendly name (auto-generated)
- **display_name:** How guide appears to customers
- **tagline:** Professional tagline
- **bio:** Detailed biography (optional)
- **base_location:** Geographic base
- **years_experience:** Years of experience
- **rating:** Average rating (0.0-5.0)
- **review_count:** Total reviews
- **is_active:** Whether guide is visible
- **specialties:** Array of activity types
- **languages:** Array of languages spoken
- **certifications:** JSONB array of certifications

## How It Works

### Sign Up Flow
1. User fills out sign-up form
2. POST to Supabase Auth API with email/password
3. Auth user created in `auth.users`
4. Profile created in `profiles` table (linked to auth user)
5. Guide record created in `guides` table
6. Redirect to `/dashboard`

### Login Flow
1. User enters email/password
2. POST to Supabase Auth API
3. Session token returned
4. Redirect to `/dashboard`

### Protected Routes
- `/dashboard` checks for authenticated user
- If not logged in, redirects to `/auth/login`
- Uses `supabase.auth.getUser()` to verify

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://nqczucpdkccbkydbzytl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_XhonuiAxissjlevcywCymg_AeGOgyhK
```

## Testing

### Test Sign Up
1. Go to `https://summit-site-seven.vercel.app/auth/signup`
2. Fill in form with:
   - Full Name: "John Climber"
   - Display Name: "John C"
   - Tagline: "Rock climbing expert"
   - Base Location: "Colorado"
   - Email: unique email
   - Password: strong password
3. Click "Create Account"
4. Should redirect to `/dashboard`

### Test Login
1. Go to `https://summit-site-seven.vercel.app/auth/login`
2. Enter email and password from sign-up
3. Click "Sign In"
4. Should redirect to `/dashboard`

## Next Steps

1. **Update Navigation** - Add user menu with logout in main nav
2. **Profile Editor** - Build `/dashboard/profile` to edit guide info
3. **Trip Creator** - Build `/dashboard/create-trip` form
4. **Trip Editor** - Build `/dashboard/trip/[id]` for editing trips
5. **Email Verification** - Add email confirmation flow
6. **Password Reset** - Add forgot password functionality
7. **Booking Dashboard** - Show incoming bookings on guide dashboard
8. **Payout Settings** - Add Stripe Connect setup

## Known Limitations

- Email verification not yet enabled (auto-confirms)
- No password reset flow yet
- No profile picture upload yet
- No guide verification system yet
- No email notifications yet

## Dependencies

- `@supabase/supabase-js` - Supabase client library
- `@supabase/ssr` - Server-side rendering support
- `next` - Next.js framework
- `react` - React library

## Security Notes

- Passwords are hashed and encrypted by Supabase
- Auth tokens stored in secure HttpOnly cookies
- Row-level security (RLS) policies protect database
- Anon key has limited permissions (guides can only read/write their own data)
