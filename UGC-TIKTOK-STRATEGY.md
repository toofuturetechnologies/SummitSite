# Summit UGC + TikTok Integration Strategy

## Executive Summary
Integrate user-generated TikTok content into trip detail pages to drive conversion, build social proof, and create authentic marketing assets. Budget: 2% of 12% platform commission (0.24% effective) for professional UGC production.

---

## Financial Model

### Revenue Calculation (Per $450 Booking)
- **Customer pays:** $450
- **Platform commission:** 12% = $54
- **UGC budget:** 2% of 12% = 0.24% = $1.08 per booking
- **Guide payout:** 88% = $396

### UGC Budget Sizing
- **At 100 bookings/month:** $108/month UGC budget
- **At 500 bookings/month:** $540/month UGC budget  
- **At 1000 bookings/month:** $1,080/month UGC budget

### UGC Cost Structure (Industry Standard)
**Per TikTok video:**
- **Micro-creator (10k-100k followers):** $100-300
- **Mid-tier (100k-500k followers):** $300-800
- **High-tier (500k+ followers):** $1,000+

**Recommendation: Start with micro-creators ($150/video)**
- More authentic appearance
- Higher engagement rates  
- Budget-friendly: 7 videos/month at $100 budget

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
1. ✅ Extend Supabase schema to track TikTok videos
2. ✅ Choose social aggregator platform
3. ✅ Create UGC creator onboarding process
4. ✅ Build backend UGC management API

### Phase 2: Frontend Integration (Week 2-3)
1. ✅ Create `TikTokUGCWidget` component
2. ✅ Build "What Our Customers Say" section
3. ✅ Integrate social aggregator embed code
4. ✅ Design UGC submission form for guides

### Phase 3: Creator Program (Week 3-4)
1. ✅ Launch creator outreach program
2. ✅ Set up payment flow (Stripe)
3. ✅ Create content guidelines/brief template
4. ✅ Implement analytics dashboard

---

## Technical Implementation

### Database Schema Extension

```sql
-- New table: ugc_videos
CREATE TABLE ugc_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  creator_name TEXT NOT NULL,
  creator_handle TEXT NOT NULL,
  creator_followers INTEGER,
  tiktok_url TEXT NOT NULL UNIQUE,
  tiktok_video_id TEXT NOT NULL,
  embed_code TEXT,
  thumbnail_url TEXT,
  video_status TEXT DEFAULT 'pending', -- pending, approved, published, rejected
  engagement_likes INTEGER DEFAULT 0,
  engagement_views INTEGER DEFAULT 0,
  engagement_shares INTEGER DEFAULT 0,
  payment_amount DECIMAL(10,2),
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed
  stripe_charge_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  rejected_reason TEXT
);

-- Index for quick lookups
CREATE INDEX ugc_videos_trip_id_idx ON ugc_videos(trip_id);
CREATE INDEX ugc_videos_guide_id_idx ON ugc_videos(guide_id);
CREATE INDEX ugc_videos_status_idx ON ugc_videos(video_status);
```

### Social Aggregator Selection: EmbedSocial

**Why EmbedSocial:**
- ✅ Single post widget (perfect for UGC highlighting)
- ✅ Hides native TikTok UI
- ✅ Custom styling/borders
- ✅ CTA button integration (Shop Now/Book Now)
- ✅ Analytics tracking
- ✅ ~$10-30/month for startup plan
- ✅ 7-day free trial

**Alternative Options:**
- Tagbox: Similar, slightly more expensive ($49/month)
- Juicer: Better for feeds, less ideal for single posts
- Recommendation: **Start with EmbedSocial**, migrate to Tagbox at scale

---

## Frontend Components

### 1. TikTokUGCWidget Component
```tsx
// src/components/TikTokUGCWidget.tsx
'use client';

import { useEffect, useState } from 'react';

interface TikTokUGCVideo {
  id: string;
  creator_name: string;
  creator_handle: string;
  creator_followers: number;
  tiktok_url: string;
  embed_code: string;
  engagement_likes: number;
  engagement_views: number;
}

export default function TikTokUGCWidget({ tripId }: { tripId: string }) {
  const [videos, setVideos] = useState<TikTokUGCVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUGC = async () => {
      try {
        const res = await fetch(`/api/ugc/trip/${tripId}`);
        if (res.ok) {
          const data = await res.json();
          setVideos(data.videos || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUGC();
  }, [tripId]);

  if (loading) return <div className="animate-pulse h-96 bg-gray-200 rounded-lg" />;
  if (videos.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">What Adventurers Say</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            {/* TikTok Embed */}
            <div 
              className="w-full aspect-video"
              dangerouslySetInnerHTML={{ __html: video.embed_code }}
            />
            
            {/* Creator Info */}
            <div className="p-4 border-t border-gray-200">
              <a
                href={`https://tiktok.com/${video.creator_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:opacity-80 transition"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {video.creator_name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{video.creator_name}</p>
                  <p className="text-gray-600 text-xs">@{video.creator_handle}</p>
                </div>
              </a>
              
              {/* Engagement Stats */}
              <div className="flex gap-4 mt-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-red-500">❤</span>
                  <span className="text-gray-700">{(video.engagement_likes / 1000).toFixed(1)}k</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-blue-500">👁</span>
                  <span className="text-gray-700">{(video.engagement_views / 1000).toFixed(1)}k</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 text-sm mb-4">
          Want to be featured? Tag us in your TikTok + use #SummitAdventures
        </p>
        <a
          href="https://tiktok.com/@summitadventures"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
        >
          Follow @SummitAdventures
          <span className="text-lg">🎵</span>
        </a>
      </div>
    </div>
  );
}
```

### 2. Integration into Trip Detail Page
```tsx
// In src/app/trips/[id]/page.tsx, after ReviewsSection:

{/* TikTok UGC Section */}
<TikTokUGCWidget tripId={trip.id} />

{/* Reviews Section */}
<ReviewsSection tripId={trip.id} guideId={trip.guide_id} />
```

---

## Backend API Routes

### 1. Fetch UGC Videos for Trip
```typescript
// src/app/api/ugc/trip/[tripId]/route.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const { data: videos, error } = await supabase
      .from('ugc_videos')
      .select('*')
      .eq('trip_id', params.tripId)
      .eq('video_status', 'published')
      .order('published_at', { ascending: false })
      .limit(6);

    if (error) throw error;

    return Response.json({ videos: videos || [] });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch UGC videos' },
      { status: 500 }
    );
  }
}
```

### 2. Submit UGC Video (Creator)
```typescript
// src/app/api/ugc/submit/route.ts

export async function POST(request: Request) {
  const { guideId, tripId, tiktokUrl, creatorInfo } = await request.json();

  // 1. Validate TikTok URL
  const videoId = extractTikTokId(tiktokUrl);
  if (!videoId) {
    return Response.json({ error: 'Invalid TikTok URL' }, { status: 400 });
  }

  // 2. Extract embed code from EmbedSocial API
  const embedCode = await getEmbedCodeFromEmbedSocial(videoId);

  // 3. Save to database
  const { data, error } = await supabase.from('ugc_videos').insert({
    guide_id: guideId,
    trip_id: tripId,
    creator_id: creatorInfo.id,
    creator_name: creatorInfo.name,
    creator_handle: creatorInfo.handle,
    creator_followers: creatorInfo.followers,
    tiktok_url: tiktokUrl,
    tiktok_video_id: videoId,
    embed_code: embedCode,
    video_status: 'pending', // Manual review by guide
  });

  if (error) throw error;

  return Response.json({ success: true, videoId: data[0].id });
}
```

### 3. Approve & Publish UGC
```typescript
// src/app/api/ugc/approve/[videoId]/route.ts

export async function POST(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  const { guideId } = await request.json();

  // 1. Get video
  const { data: video } = await supabase
    .from('ugc_videos')
    .select('*')
    .eq('id', params.videoId)
    .single();

  if (!video || video.guide_id !== guideId) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // 2. Process payment
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const charge = await stripe.charges.create({
    amount: Math.round(video.payment_amount * 100),
    currency: 'usd',
    source: 'tok_visa', // Should be from creator's connected account
    description: `UGC Payment - ${video.creator_name} - ${video.tiktok_url}`,
  });

  // 3. Update status
  const { error } = await supabase
    .from('ugc_videos')
    .update({
      video_status: 'published',
      published_at: new Date().toISOString(),
      payment_status: 'paid',
      stripe_charge_id: charge.id,
    })
    .eq('id', params.videoId);

  if (error) throw error;

  return Response.json({ success: true, chargeId: charge.id });
}
```

---

## Creator Program Setup

### 1. Creator Landing Page
```tsx
// src/app/creators/page.tsx

export default function CreatorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-pink-600 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-16 text-white">
        <h1 className="text-5xl font-black mb-4">Get Paid to Create</h1>
        <p className="text-2xl text-white/90 mb-8">
          Share your adventure videos and earn $100-500 per TikTok
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-xl font-bold mb-2">Create Content</h3>
            <p className="text-white/80">Film your genuine adventure experience</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">Submit & Get Approved</h3>
            <p className="text-white/80">We review for authenticity and quality</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Get Paid</h3>
            <p className="text-white/80">Receive payment within 7 days</p>
          </div>
        </div>

        <div className="bg-white text-gray-900 rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-6">Application Form</h2>
          <form className="space-y-4">
            <input type="text" placeholder="Your Name" className="w-full px-4 py-3 bg-gray-100 rounded-lg" />
            <input type="text" placeholder="TikTok Handle (@username)" className="w-full px-4 py-3 bg-gray-100 rounded-lg" />
            <input type="email" placeholder="Email" className="w-full px-4 py-3 bg-gray-100 rounded-lg" />
            <input type="number" placeholder="TikTok Followers" className="w-full px-4 py-3 bg-gray-100 rounded-lg" />
            <textarea placeholder="Tell us about your adventure content..." rows={4} className="w-full px-4 py-3 bg-gray-100 rounded-lg" />
            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-pink-600 text-white font-bold py-3 rounded-lg">
              Apply Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

### 2. Content Brief Template
```markdown
# Summit UGC Content Brief

## Trip: [Trip Name]

### Requirements
- **Duration:** 15-60 seconds
- **Platform:** TikTok only
- **Hashtags:** #SummitAdventures #[ActivityType] #[Location]
- **Mentions:** @summitadventures (if possible)

### Vibe
- Authentic, unscripted, genuine reaction
- Show the experience, not the product
- Natural lighting, handheld camera
- Include 3-4 key moments:
  1. Arrival/excitement
  2. Activity moment
  3. Breathtaking view
  4. Group celebration

### What NOT to do
- ❌ Don't use overdone TikTok sounds
- ❌ Don't make it look like an ad
- ❌ Don't hide the activity
- ❌ Don't use heavy filters

### Payment
- **Tier 1 (< 50k followers):** $100
- **Tier 2 (50k-500k followers):** $250
- **Tier 3 (> 500k followers):** $500

### Timeline
- Submit draft: [Date]
- Publish: [Date]
- Payment: 7 days after publication

### Questions?
Email: creators@summitadventures.com
```

---

## Analytics Dashboard

### Metrics to Track
1. **Per Video:**
   - Views, likes, comments, shares
   - Click-through to booking
   - Conversion rate (clicks → bookings)
   - ROI ($cost vs. revenue)

2. **Aggregated:**
   - Total UGC reach
   - Cost per booking acquisition
   - Engagement rate vs. industry benchmark (10-15%)
   - Creator sentiment analysis

### Implementation
```tsx
// src/app/dashboard/ugc-analytics/page.tsx

interface UGCMetrics {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  avgEngagementRate: number;
  costPerView: number;
  costPerBooking: number;
  roi: number; // Revenue from UGC bookings / Total UGC spend
}
```

---

## Launch Timeline

### Week 1: Setup
- [ ] Create Supabase schema
- [ ] Register EmbedSocial account
- [ ] Build API routes
- [ ] Implement TikTokUGCWidget component

### Week 2: Integration
- [ ] Integrate into trip detail pages
- [ ] Build creator application form
- [ ] Set up Stripe payment flow
- [ ] Create content brief template

### Week 3: Launch
- [ ] Soft launch with 3-5 test creators
- [ ] Gather feedback
- [ ] Refine content brief
- [ ] Scale creator outreach

### Week 4: Growth
- [ ] 20+ creators in pipeline
- [ ] Monitor metrics daily
- [ ] Optimize payment structure
- [ ] Expand to Instagram Reels

---

## Budget Projection (Annual)

### Conservative Scenario (100 bookings/month)
- **UGC budget:** $1,296/year (100 × $10.80)
- **Average revenue per booking:** $450
- **Estimated UGC-driven bookings:** +15/month = $81,000/year
- **ROI:** 6,250% ✅

### Optimistic Scenario (500 bookings/month)
- **UGC budget:** $6,480/year (500 × $10.80)
- **Estimated UGC-driven bookings:** +100/month = $540,000/year
- **ROI:** 8,333% ✅

---

## Next Steps

1. **This Week:**
   - [ ] Approve UGC budget allocation
   - [ ] Sign up for EmbedSocial free trial
   - [ ] Create Supabase schema

2. **Next Week:**
   - [ ] Deploy backend APIs
   - [ ] Build frontend components
   - [ ] Launch creator application

3. **Month 2:**
   - [ ] Onboard first 10 creators
   - [ ] Publish 5-10 TikTok videos
   - [ ] Measure impact on bookings

4. **Month 3:**
   - [ ] Scale to 50+ creator network
   - [ ] Expand to Instagram Reels
   - [ ] Add TikTok analytics dashboard

---

## Questions & Decisions

1. **Starting budget:** $100/video or $150/video?
2. **Target creator size:** Micro (10k-100k) or mix?
3. **Payment method:** Stripe direct or PayPal?
4. **Content approval:** Auto-approve or manual review?
5. **Exclusivity:** Can creators post same video elsewhere?

