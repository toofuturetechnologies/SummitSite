# Review System + TikTok UGC Integration Guide

## ✅ NEW FEATURES DEPLOYED

### 1. Easy Review Access
- **Review the Guide** button in "About Your Guide" section
- **Leave Review** button in "About This Trip" section
- Both buttons open a beautiful modal form

### 2. Complete Review Form
- ⭐ Star rating selector (1-5 stars)
- 📝 Title field
- 💬 Review text field (minimum 10 characters)
- 🎬 **TikTok URL field (OPTIONAL - integrated with UGC)**
- Submit button with validation

### 3. TikTok UGC Integration
- Paste your TikTok video URL in the review form
- Video automatically submitted as UGC
- Shows message: "You could earn $100-500 if featured!"
- Creates UGC record for guide approval

### 4. Two Review Types
- **Trip Review:** Review the experience, guides, accommodations
- **Guide Review:** Review the guide's professionalism, knowledge, safety

---

## 🚀 How to Test

### Step 1: Go to Any Trip
```
https://summit-site-seven.vercel.app/trips/[any-trip-id]
```

### Step 2: Click "Leave Review" Button
Look for the blue **"Leave Review"** button in the "About This Trip" section

**Or** click **"Review"** button next to "Message" in "About Your Guide" section

### Step 3: Fill Out the Form

**Option A: Text Review Only**
1. Select rating (click stars)
2. Write title (e.g., "Best experience ever!")
3. Write review (minimum 10 characters)
4. Click "Post Review"

**Option B: Review + TikTok UGC**
1. Select rating
2. Write title + review
3. **Paste TikTok URL** (e.g., `https://www.tiktok.com/@yourname/video/123456`)
4. Click "Post Review"
5. See message: "✅ TikTok video will be submitted for approval. You could earn money!"
6. Click "Post Review"

### Step 4: See Your Review Live
- Modal closes
- Review appears in the reviews section below
- If you submitted a TikTok, it goes to guide's UGC approval queue

---

## 🎬 TikTok Integration (In Review Form)

### What Happens When You Submit a TikTok URL

1. **Review is created** → Shows on trip/guide page
2. **TikTok video is submitted as UGC** → Goes to guide's approval queue
3. **Guide sees it in dashboard** → `/dashboard/ugc`
4. **Guide approves or rejects** → You get notified
5. **If approved** → Video shows on trip page in "What Adventurers Say"
6. **You get paid** → $100-500 (depending on creator tier)

### Requirements
- Valid TikTok URL: `https://www.tiktok.com/@username/video/VIDEO_ID`
- Your own content (not someone else's video)
- Authentic adventure experience (not ads or promotions)

### Payment Tiers
- **Tier 1** (< 50k followers): $100
- **Tier 2** (50k-500k followers): $250
- **Tier 3** (> 500k followers): $500

---

## 🔄 Complete User Flow

```
Customer visits trip page
        ↓
Clicks "Leave Review" or "Review"
        ↓
Form modal opens
        ↓
User fills out review (rating, title, text)
        ↓
User OPTIONALLY pastes TikTok URL
        ↓
Clicks "Post Review"
        ↓
Review created in database
        ↓
If TikTok URL provided:
  - UGC video submitted to guide for approval
  - Shows in guide's /dashboard/ugc
  - Guide reviews and approves/rejects
  - If approved → video appears on trip page
  - Creator gets paid after 7 days
```

---

## 📍 Where Reviews Appear

### On Trip Detail Page
**ReviewsSection** component shows:
- All published reviews for the trip
- Sorted by newest first
- Shows reviewer name, rating, date
- Guide can respond to reviews

### On Guide Dashboard
**Reviews dashboard** shows:
- All reviews for guide's trips
- Grouped by trip
- Average rating displayed
- Response option for each review

### In UGC Management
**If TikTok submitted:**
- `/dashboard/ugc` shows pending videos
- Guide approves/rejects with one click
- Payment processed automatically

---

## 🧪 Test Scenarios

### Scenario 1: Text-Only Review
1. Visit trip page
2. Click "Leave Review"
3. Rate 5 stars
4. Title: "Amazing experience!"
5. Review: "The guide was fantastic and very knowledgeable."
6. Leave TikTok URL blank
7. Click "Post Review"
✅ Review appears on page

### Scenario 2: Review + TikTok
1. Visit trip page
2. Click "Leave Review"
3. Rate 4 stars
4. Title: "Great adventure!"
5. Review: "Had an incredible time on this trip."
6. Paste TikTok URL: `https://www.tiktok.com/@adventurer/video/7234567890123456789`
7. Click "Post Review"
✅ Review appears + UGC submitted to guide

### Scenario 3: Review the Guide
1. Scroll to "About Your Guide"
2. Click "Review" button (green, next to Message)
3. Rate 5 stars
4. Title: "Excellent guide"
5. Review: "Best guide ever!"
6. Leave TikTok blank
7. Click "Post Review"
✅ Guide receives review (used for rating calculation)

---

## 📋 Database Changes

### New Columns (Reviews Table)
```sql
- review_type: 'trip' or 'guide'
- reviewer_id: UUID (references profiles)
- body: TEXT (formerly "comment")
- booking_id: NULLABLE (no longer required)
```

### New Functionality
- ✅ Anyone can review (no booking required)
- ✅ Support for both trip and guide reviews
- ✅ Automatic guide rating calculation
- ✅ RLS policies for security

---

## 🎯 Key Features

### For Customers
✅ Easy access to review form (two buttons on page)  
✅ Can leave TikTok video during review  
✅ Earn money if video gets featured  
✅ Can review trip or guide independently  

### For Guides
✅ Receive more reviews (no booking requirement)  
✅ Reviews for both trip and expertise  
✅ UGC submissions tracked  
✅ Can approve/reject user videos  
✅ Get paid for approving quality UGC  

### For Platform
✅ More authentic social proof  
✅ More UGC content  
✅ Better engagement metrics  
✅ Drives repeat bookings  

---

## 🔒 Security & Privacy

### RLS Policies
- Public: Can read all reviews
- Authenticated: Can create reviews
- Owner: Can edit/delete own reviews
- Guides: Can respond to reviews for their trips

### Validation
- Rating: 1-5 only
- Title: Required, max 100 chars
- Body: Required, min 10 chars
- TikTok URL: Format validation (must contain /video/)

### Safety
- Reviews require authentication
- User identity tracked
- TikTok URLs validated before submission
- Guide approval required for video display

---

## 📊 Analytics You Can Track

### Per Review
- Rating distribution
- Sentiment analysis (positive/negative)
- Word clouds (common themes)
- UGC submission rate

### Per Guide
- Average rating (auto-calculated)
- Review count (auto-calculated)
- UGC acceptance rate
- Revenue from approved UGC

### Per Trip
- Total reviews
- Average rating
- Most common feedback themes
- UGC content count

---

## 🚀 Next Steps

### Phase 1 (This Week)
- ✅ Test review form on all trip pages
- ✅ Verify TikTok URL submission works
- ✅ Check that reviews appear correctly
- ✅ Confirm UGC submissions reach guide dashboard

### Phase 2 (Week 2)
- [ ] Enable review notifications
- [ ] Add review moderation (optional)
- [ ] Track review analytics
- [ ] Create guide response workflow

### Phase 3 (Week 3+)
- [ ] Review analytics dashboard
- [ ] Sentiment analysis
- [ ] Review spotlights on homepage
- [ ] Review-based ranking improvements

---

## 🎬 TikTok Best Practices

### What Makes Good UGC
✅ Authentic footage of the activity  
✅ Real reactions and emotions  
✅ Clear audio (guide's voice/instructions)  
✅ Multiple angles/moments from the trip  
✅ 15-60 seconds (TikTok optimal length)  
✅ Hashtags: #SummitAdventures #YourActivity  

### What to Avoid
❌ Ads or promotional content  
❌ Other people's content  
❌ Low quality/blurry footage  
❌ Excessive filters/effects  
❌ Negative commentary  
❌ Safety risks shown  

---

## 💡 Tips

1. **Mobile Form:** Form is optimized for mobile - easier to use while on/after trip
2. **Optional TikTok:** Don't force TikTok - let people review without it
3. **Incentivize:** Show "$100-500 potential earnings" message prominently
4. **Easy Access:** Make buttons obvious and easy to find
5. **Fast Approval:** Approve good UGC within 24 hours to keep momentum

---

## ✨ You're Ready!

The review system is live with full TikTok integration. 

**To see it in action:**
1. Go to https://summit-site-seven.vercel.app/trips/[trip-id]
2. Click "Leave Review" or "Review" button
3. Fill out form with optional TikTok URL
4. Submit and see it appear live

**Everything works end-to-end: reviews + UGC submission + guide approval + payment tracking!**

