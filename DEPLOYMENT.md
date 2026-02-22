# Summit Vercel Deployment Guide

## Status: Ready to Deploy

Git repository initialized locally with all code committed.

## Step 1: Push to GitHub (SummitSite)

You have two options:

### Option A: Use GitHub CLI (Recommended)
```bash
# Install GitHub CLI if needed
brew install gh  # or apt-get install gh

# Authenticate
gh auth login

# Create repository
gh repo create SummitSite --source=. --remote=origin --push
```

### Option B: Manual Git Push
```bash
# Add remote to existing GitHub repo
git remote add origin https://github.com/[YOUR-USERNAME]/SummitSite.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Prerequisites
- GitHub repository created (SummitSite)
- Vercel account (vercel.com)

### Deployment Steps

1. **Connect to Vercel:**
   ```bash
   npm i -g vercel
   vercel link  # Follow prompts to connect GitHub repo
   ```

2. **Set Environment Variables in Vercel:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   R2_ACCOUNT_ID=your_account_id
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret
   R2_BUCKET_NAME=summit-media
   NEXT_PUBLIC_R2_PUBLIC_URL=https://media.yourdomain.com
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   RESEND_API_KEY=re_...
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

## What's Included

✅ **Next.js 14 with App Router**
- Server Components by default
- Optimized for performance

✅ **Supabase Integration**
- Authentication (OAuth + email/password)
- PostgreSQL database
- Real-time subscriptions ready

✅ **Cloudflare R2**
- S3-compatible object storage
- Zero egress fees
- Media upload/delivery

✅ **Stripe Connect**
- Marketplace payments
- Guide payouts
- Webhook handling

✅ **Email with Resend**
- Transactional emails
- Beautiful templates

✅ **Database Schema**
- Full migration in `supabase/migrations/001_initial_schema.sql`
- RLS policies included
- Proper constraints and indexes

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run dev server
npm run dev

# Open http://localhost:3000
```

## Next Steps

1. Push code to GitHub
2. Set environment variables in Vercel
3. Deploy to production
4. Configure custom domain
5. Set up Supabase database (SQL migration included)
6. Configure Stripe Connect for guides
7. Test booking flow

## Database Setup

The SQL schema is ready in `supabase/migrations/001_initial_schema.sql`.

To apply:
1. Open Supabase dashboard
2. Go to SQL Editor
3. Create new query
4. Copy/paste the migration SQL
5. Execute

## Troubleshooting

### Build Fails
- Check Node version (18+ required)
- Clear `.next/` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Deployment Hangs
- Check Vercel deployment logs
- Verify environment variables are set
- Ensure GitHub token is valid

### Database Connection
- Verify Supabase URL and keys in `.env.local`
- Test connection: `npx supabase status`

## Support

See `CLAUDE.md` for Claude Code prompts for extending features.

---

**Ready to proceed? Provide GitHub credentials and I'll push to SummitSite + deploy to Vercel.**
