# Summit Development Guide

Quick reference for developing and contributing to the Summit platform.

---

## Project Setup

### Prerequisites
- Node.js 18+ (`node -v`)
- npm or yarn
- Git
- Supabase account

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/toofuturetechnologies/SummitSite.git
cd SummitSite

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase keys and Stripe keys

# 4. Start dev server
npm run dev
# Opens http://localhost:3000

# 5. Generate types (if DB schema changed)
npm run db:types
```

### Environment Variables

**Required for local development:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx

NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 14.1.0 |
| **Language** | TypeScript | 5.3.3 |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Styling** | Tailwind CSS | 3.4.1 |
| **UI Library** | Radix UI | Latest |
| **Forms** | React Hook Form | 7.50.1 |
| **Validation** | Zod | 3.22.4 |
| **Payment** | Stripe | 14.18.0 |
| **Email** | Resend | 3.2.0 |
| **Icons** | Lucide React | 0.344.0 |
| **Auth** | Supabase Auth + NextAuth.js (partial) | - |

---

## Project Structure

```
SummitSite/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── admin/        # Admin endpoints
│   │   │   ├── bookings/
│   │   │   ├── guide-reviews/
│   │   │   ├── payments/
│   │   │   └── stripe-webhook/
│   │   ├── admin/            # Admin pages
│   │   ├── blog/             # Blog page
│   │   ├── dashboard/        # User dashboard
│   │   ├── trips/            # Trip listing
│   │   ├── guides/           # Guide listing
│   │   ├── faq/              # FAQ page
│   │   ├── help/             # Help page
│   │   ├── terms/            # Terms of Service
│   │   ├── privacy/          # Privacy Policy
│   │   ├── auth/             # Auth pages
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/
│   │   ├── ui/               # Radix UI components
│   │   ├── admin/            # Admin components
│   │   └── OptimizedImage.tsx # Image optimization
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client
│   │   ├── cache.ts          # Caching utilities
│   │   ├── query-optimizer.ts # Query optimization
│   │   └── api-utils.ts      # API error handling
│   └── types/
│       └── database.ts       # Auto-generated DB types
├── supabase/
│   └── migrations/           # Database migrations
├── public/
│   └── images/               # Static assets
├── .env.local               # Local env (git-ignored)
├── .env.example             # Env template
├── API-REFERENCE.md         # API documentation
├── COMPONENT-GUIDE.md       # Component documentation
├── DEVELOPMENT-GUIDE.md     # This file
└── README.md
```

---

## Common Tasks

### Add a New Page

```bash
# Create route file
mkdir -p src/app/new-page
touch src/app/new-page/page.tsx

# Create component
cat > src/app/new-page/page.tsx << 'EOF'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title | Summit',
  description: 'Page description',
};

export default function NewPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Content */}
    </div>
  );
}
EOF
```

### Add an API Endpoint

```bash
# Create route file
mkdir -p src/app/api/new-endpoint
touch src/app/api/new-endpoint/route.ts

# Create endpoint
cat > src/app/api/new-endpoint/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Logic here
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    // Logic here
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
EOF
```

### Add a Database Table

```bash
# 1. Create migration
touch supabase/migrations/XXX_add_new_table.sql

# 2. Edit migration file with schema
cat > supabase/migrations/XXX_add_new_table.sql << 'EOF'
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_new_table_name ON new_table(name);
EOF

# 3. Apply migration
supabase migration up

# 4. Generate TypeScript types
npm run db:types
```

### Update Component

```tsx
// Example: Add dark mode support to component
export function MyComponent() {
  return (
    <div className="bg-white dark:bg-slate-950 text-gray-900 dark:text-white">
      {/* Content */}
    </div>
  );
}
```

---

## Debugging

### Server Logs
```bash
# View logs in dev mode (npm run dev terminal shows errors)
# Or check Vercel dashboard: https://vercel.com/projects
```

### Database Debugging
```bash
# View Supabase logs
# 1. Go to https://app.supabase.com
# 2. Select project → Logs → Function logs / Database logs
```

### Client-side Debugging
```tsx
// Use React DevTools (browser extension)
// Use Next.js DevTools (next/dev)

console.log('Debug:', variable); // Don't forget to remove!
```

### API Testing
```bash
# Test endpoint with curl
curl -X GET http://localhost:3000/api/endpoint \
  -H "Authorization: Bearer $JWT_TOKEN"

# Or use Postman / Insomnia
```

---

## Code Quality

### Linting
```bash
npm run lint
# Auto-fix issues:
npm run lint -- --fix
```

### TypeScript Checking
```bash
npx tsc --noEmit
```

### Formatting (Prettier is configured)
```bash
# Format all files
npx prettier --write "src/**/*.{ts,tsx}"
```

### Pre-commit Checks (Recommended)
```bash
# Before pushing, run:
npm run lint
npm run build
npx tsc --noEmit
```

---

## Testing

### Manual Testing Checklist

- [ ] Create account (email + password)
- [ ] Login/logout
- [ ] Browse trips
- [ ] Book a trip (test Stripe with `4242 4242 4242 4242`)
- [ ] View bookings
- [ ] Submit review
- [ ] User profile edit
- [ ] Dark mode toggle
- [ ] Mobile responsiveness (DevTools)
- [ ] Accessibility (use screen reader or axe DevTools)

### Test Cases by Feature

**Authentication:**
- [ ] Sign up with email
- [ ] Login with email
- [ ] Forgot password flow
- [ ] Logout
- [ ] Session persistence

**Bookings:**
- [ ] Browse trips without login
- [ ] Book trip (authenticated)
- [ ] View booking details
- [ ] Cancel booking
- [ ] Receive confirmation email

**Reviews:**
- [ ] Submit review after booking
- [ ] View guide's reviews
- [ ] Edit own review (if allowed)
- [ ] Delete own review

**Admin:**
- [ ] Access admin panel (with admin account)
- [ ] View user list
- [ ] View disputes
- [ ] Suspend user
- [ ] Approve/reject UGC

---

## Performance Optimization

### Lighthouse Audit
```bash
# Run locally
npm run build
npm start
# Open http://localhost:3000 → DevTools → Lighthouse → Analyze

# Target scores:
# - Performance: 85+
# - Accessibility: 90+
# - Best Practices: 90+
# - SEO: 90+
```

### Key Optimization Patterns

**Images:**
- Use OptimizedImage component
- Use `priority={true}` for above-fold images
- Add `blurDataURL` for LQIP

**Queries:**
- Use eager loading (select with relations)
- Avoid N+1 queries
- Use cursor-based pagination for large datasets
- Select specific fields, not `SELECT *`

**Caching:**
- Add cache headers to GET endpoints
- Revalidate on POST/PUT/DELETE

**Code Splitting:**
- Use `dynamic()` for large components
- Lazy load admin pages

---

## Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push to GitHub
git push origin feature/new-feature

# 4. Create Pull Request on GitHub
# - Add description
# - Link to issues if applicable
# - Request reviewers

# 5. After review, merge to main
# - Auto-deploys to Vercel
```

### Commit Message Format

```
feat: add new feature
fix: fix bug X
docs: update README
style: format code
refactor: restructure component
test: add unit tests
chore: update dependencies
```

---

## Deployment

### Vercel (Production)

```bash
# Auto-deploys on push to main branch
# Monitor at https://vercel.com/projects

# Manual deployment (if needed):
# 1. Push to main or use Vercel CLI
# 2. Vercel automatically builds and deploys
# 3. Check build status in Vercel dashboard
```

### Database Migrations

```bash
# Push schema to production Supabase
# 1. Create migration in supabase/migrations/
# 2. Test locally with supabase migration up
# 3. Commit and push
# 4. Supabase CLI will apply in production (if configured)

# Or manually:
# 1. Copy SQL from migration file
# 2. Go to Supabase Dashboard → SQL Editor
# 3. Paste and execute
```

---

## Troubleshooting

### Build Fails with TypeScript Error

```bash
# 1. Check error message
# 2. Fix type issues (see COMPONENT-GUIDE.md)
# 3. Run locally: npm run build
# 4. Verify types: npx tsc --noEmit
```

### API Returns 500 Error

```bash
# 1. Check server logs (npm run dev terminal)
# 2. Check Supabase logs (Supabase dashboard)
# 3. Verify request body is valid JSON
# 4. Check environment variables
# 5. Test with curl or Postman
```

### Database Connection Issues

```bash
# 1. Verify SUPABASE_URL and keys in .env.local
# 2. Check if Supabase project is active
# 3. Verify network connectivity
# 4. Check Supabase status page
```

### Image Not Loading

```bash
# 1. Check URL is valid and accessible
# 2. Verify CORS headers (if external image)
# 3. Check file exists in public/ folder
# 4. Verify image format is supported (JPG, PNG, WebP, AVIF)
```

---

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **Stripe API**: https://stripe.com/docs/api
- **GitHub**: https://github.com/toofuturetechnologies/SummitSite

---

## Questions?

- Check existing issues: https://github.com/toofuturetechnologies/SummitSite/issues
- Ask in discussions: https://github.com/toofuturetechnologies/SummitSite/discussions
- Email: dev@summit.local
