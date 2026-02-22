# Vercel Deployment - Manual Steps

Code is now pushed to GitHub at: https://github.com/toofuturetechnologies/SummitSite

## Deploy to Vercel (5 minutes)

### Step 1: Connect to Vercel
1. Go to https://vercel.com
2. Sign in (or create account)
3. Click "Import Project"
4. Select "GitHub"
5. Search for and select: `toofuturetechnologies/SummitSite`
6. Click "Import"

### Step 2: Configure Environment Variables
In the "Environment Variables" section, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=summit-media
NEXT_PUBLIC_R2_PUBLIC_URL=https://media.yourdomain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
```

### Step 3: Deploy
Click "Deploy" button

Vercel will:
- Build the Next.js app
- Run tests
- Deploy to production
- Provide live URL

### Step 4: Configure Custom Domain (Optional)
1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Update DNS at Cloudflare/registrar

## What's Deployed

✅ Next.js 14 App Router  
✅ Server Components  
✅ Supabase integration (ready for auth/database)  
✅ Stripe integration (ready for payments)  
✅ Cloudflare R2 (ready for media uploads)  
✅ Resend (ready for emails)  

## Post-Deployment

1. **Set up Supabase:**
   - Go to supabase.com
   - Create project
   - Run migration: `supabase/migrations/001_initial_schema.sql`
   - Copy URL + keys to Vercel env vars

2. **Configure Stripe:**
   - Go to stripe.com
   - Enable Connect
   - Copy test keys to Vercel env vars

3. **Configure Cloudflare R2:**
   - Go to cloudflare.com
   - Create R2 bucket: `summit-media`
   - Create API token
   - Copy credentials to Vercel env vars

4. **Test Locally:**
   ```bash
   git clone https://github.com/toofuturetechnologies/SummitSite
   cd SummitSite
   cp .env.example .env.local
   # Edit .env.local with your credentials
   npm install
   npm run dev
   ```

## Live URL

After deployment, your site will be at:
`https://summitsite.vercel.app` (or custom domain)

---

**GitHub Repo:** https://github.com/toofuturetechnologies/SummitSite  
**Status:** Ready for Vercel deployment ✅
