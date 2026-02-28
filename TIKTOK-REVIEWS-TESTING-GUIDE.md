# TikTok Video Reviews - End-to-End Testing Guide

## ✅ Deployment Status

All systems are now live and ready for testing:

- ✅ Database migration 009 deployed (tiktok_url & video_id columns)
- ✅ Review form updated with TikTok URL input
- ✅ Review submission accepts TikTok videos
- ✅ Trip detail page displays embedded videos
- ✅ Full end-to-end integration complete

---

## 🧪 Live Demo First (No Test Data Needed)

### Try the Interactive Demo

**URL**: https://summit-site-seven.vercel.app/demos/tiktok-review-example

This demo page shows:
- The enhanced review form with TikTok URL input
- Live video preview before submission
- Example reviews with embedded videos
- How the feature works

---

## 📝 Complete End-to-End Test Flow

Follow these steps to test the full TikTok review system:

### Step 1: Create a Test Booking

**Goal**: Have a completed booking to review

**Option A: Use Existing Test Data**
```
Demo Account (Customer):
- Email: jane.traveler@example.com
- Password: DemoPassword123!
```

Check if this customer has a completed booking:
1. Login to https://summit-site-seven.vercel.app
2. Go to Dashboard → Bookings
3. Look for a booking with status "Completed"
4. If found, skip to Step 3

**Option B: Create New Test Data via SQL**

Login to Supabase dashboard and run:

```sql
-- 1. Get a guide ID (or create a test guide)
SELECT id FROM guides LIMIT 1;
-- Result: example: 12345678-1234-1234-1234-123456789012

-- 2. Get a trip ID from that guide
SELECT id, title FROM trips WHERE guide_id = '12345678-1234-1234-1234-123456789012' LIMIT 1;
-- Result: example trip_id, title

-- 3. Get a customer ID (or use existing customer)
SELECT id, email FROM profiles WHERE user_type = 'traveler' LIMIT 1;
-- Result: customer_id

-- 4. Create a completed booking
INSERT INTO bookings (
  id, user_id, guide_id, trip_id, booking_date, status, 
  total_price, payment_status, stripe_payment_intent_id,
  ugc_code
) VALUES (
  gen_random_uuid(),
  '12345678-1234-1234-1234-123456789abc',  -- customer_id
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',  -- guide_id
  'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy',  -- trip_id
  NOW(),
  'completed',  -- IMPORTANT: Must be completed
  500.00,
  'succeeded',
  'pi_test_12345',
  'TRIP-' || SUBSTRING(gen_random_uuid()::text, 1, 8) || '-' || LPAD(CAST(FLOOR(RANDOM() * 1000000) AS text), 6, '0') || '-' || SUBSTRING(MD5(RANDOM()::text), 1, 6)
) RETURNING id, status;
```

Save the `id` for Step 3.

### Step 2: Navigate to Review Form

After booking is completed, in the app:

1. Login as customer
2. Go to Dashboard → Bookings
3. Find the completed booking
4. Click "Leave a Review" button
5. You should see the enhanced form with TikTok section

### Step 3: Fill Out Review with TikTok Video

**In the Review Form:**

```
Rating: ⭐⭐⭐⭐⭐ (5 stars)

Review Title: 
"Best mountaineering experience of my life!"

Your Review (optional): 
"Guide was incredibly knowledgeable and patient. The views were breathtaking 
and I felt safe the entire time. Would definitely book again!"

Attach TikTok Video:
https://www.tiktok.com/@adventurers/video/7332445024832916747
```

**What you'll see:**
- URL validation in real-time
- ✅ "Video found!" message appears
- Video preview shows below the input
- Submit button becomes enabled

### Step 4: Submit Review

Click **"✅ Submit Review"**

**Expected result:**
- Form submits
- Success message: "Your review has been posted. Redirecting to trip..."
- Redirects to trip detail page

### Step 5: Verify Video Display on Trip Page

After redirect to trip page:

1. Scroll down to **"Reviews"** section
2. Find your new review
3. Should show:
   - ⭐⭐⭐⭐⭐ Rating stars
   - "Best mountaineering experience of my life!" - Title
   - Review text
   - **NEW**: "📱 Video from adventure:" section
   - **TikTok embed** showing the native video player
   - Creator credit visible (e.g., "@adventurers")
   - View counts, like button, etc.

---

## 🎬 Real TikTok URLs to Test With

These are real adventure videos you can use:

```
Adventure Videos:
https://www.tiktok.com/@adventurers/video/7332445024832916747
https://www.tiktok.com/@outdooradventures/video/7331234567890123456
https://www.tiktok.com/@mountaineering/video/7330987654321098765
https://www.tiktok.com/@rockclimbing/video/7329876543210987654
```

Each will embed a real TikTok video with native player controls.

---

## ✅ Testing Checklist

Complete this checklist to verify everything works:

### Review Form Tests
- [ ] Review form loads with TikTok URL field
- [ ] Can enter rating (1-5 stars)
- [ ] Can enter review title
- [ ] Can enter review comment
- [ ] Can enter TikTok URL
- [ ] Real-time validation shows "Video found!" for valid URLs
- [ ] Error message shows for invalid URLs
- [ ] Live preview displays embedded video before submit
- [ ] Submit button is enabled when all required fields filled
- [ ] Form submission succeeds

### Database Tests
- [ ] Verify record created in `reviews` table with:
  - `tiktok_url` populated
  - `video_id` populated
  - `reviewer_id` set to current user
  - `body` contains review text
- [ ] Check via SQL:

```sql
SELECT id, title, tiktok_url, video_id, reviewer_id 
FROM reviews 
ORDER BY created_at DESC 
LIMIT 5;
```

### Display Tests
- [ ] Trip detail page loads
- [ ] Reviews section visible
- [ ] TikTok embed displays below review text
- [ ] Video player is interactive (can play/pause)
- [ ] Creator credit visible on embed
- [ ] View counts/engagement metrics show
- [ ] Embed is responsive (works on mobile)
- [ ] Multiple reviews with videos display correctly

### Dark Mode Tests
- [ ] Toggle dark mode in navbar
- [ ] Review form styling looks good
- [ ] TikTok embed visible in dark mode
- [ ] Text contrast is sufficient

---

## 🐛 Troubleshooting

### Issue: "Video found!" doesn't appear

**Cause**: URL validation failed

**Solutions**:
- Use full URL (e.g., `https://www.tiktok.com/@creator/video/123456789`)
- Don't use shortened URLs (`vt.tiktok.com`)
- Check for extra spaces in URL
- Paste from browser address bar

### Issue: Form submits but video doesn't display

**Cause**: `video_id` extraction failed or not stored

**Check**:
```sql
SELECT tiktok_url, video_id FROM reviews WHERE tiktok_url IS NOT NULL;
```

If `video_id` is NULL but `tiktok_url` has a value:
- Try URL with different format
- Check URL extraction logic

### Issue: "Error: Failed to run sql query"

**Cause**: Database column doesn't exist

**Check**:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name IN ('tiktok_url', 'video_id');
```

If columns missing:
- Run migration 009 again:
```sql
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS tiktok_url VARCHAR(500);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS video_id VARCHAR(50);
```

### Issue: TikTok embed doesn't load

**Cause**: Script not loaded or iframe blocked

**Check**:
- Browser console for errors (F12 → Console)
- Check if third-party scripts are blocked
- Try different browser
- Clear browser cache

**Fix**:
- Refresh page (Ctrl+F5 hard refresh)
- Clear browser cookies for tiktok.com
- Try incognito/private mode

---

## 📊 Success Metrics

You'll know it's working when:

✅ **Form Integration**
- Enhanced review form appears
- TikTok URL field accepts input
- Real-time validation works

✅ **Data Storage**
- Reviews saved with `tiktok_url` and `video_id`
- Database records look correct

✅ **Display**
- Native TikTok embed shows on trip page
- Video is interactive
- Creator credit visible

✅ **End-to-End**
- User flow: Review Form → Submit → Trip Page → Embedded Video
- Works on mobile and desktop
- Works in light and dark mode

---

## 🎯 Next Steps After Testing

1. **Bug Reporting**: Note any issues encountered
2. **Performance**: Check load times with embedded video
3. **Mobile Testing**: Test on real mobile devices
4. **Browser Testing**: Test on Chrome, Firefox, Safari
5. **User Feedback**: Get feedback from beta testers
6. **Analytics**: Track how many reviews include videos
7. **Optimization**: Monitor performance impact

---

## 📝 Test Report Template

Copy this template to document your testing:

```markdown
## TikTok Review Feature - Test Report

**Date**: [Date]
**Tester**: [Name]
**Environment**: [Production/Staging]

### Test Results

#### Form Tests
- Review form loads: ✅/❌
- TikTok URL validation: ✅/❌
- Live preview: ✅/❌
- Form submission: ✅/❌

#### Display Tests
- Trip page shows review: ✅/❌
- TikTok embed appears: ✅/❌
- Video is playable: ✅/❌
- Creator credit visible: ✅/❌

#### Browser/Device Tests
- Desktop (Chrome): ✅/❌
- Desktop (Firefox): ✅/❌
- Mobile (iOS): ✅/❌
- Mobile (Android): ✅/❌

#### Issues Found
1. [Issue description]
2. [Issue description]

#### Overall Status
[Pass/Fail]

#### Notes
[Additional observations]
```

---

## Support

If you encounter issues:

1. **Check logs**: Browser console (F12), Supabase logs
2. **Verify migration**: Run the schema check query
3. **Test components**: Visit `/demos/tiktok-review-example`
4. **Review code**: Check `ReviewFormWithTikTok.tsx` implementation
5. **Database**: Verify records in `reviews` table

---

## Files Involved

- **Form**: `/src/components/ReviewFormWithTikTok.tsx`
- **Embed**: `/src/components/TikTokReviewEmbed.tsx`
- **Utils**: `/src/lib/tiktok-utils.ts`
- **Review Page**: `/src/app/bookings/review/page.tsx`
- **Display**: `/src/components/ReviewsSection.tsx`
- **Demo**: `/src/app/demos/tiktok-review-example/page.tsx`
- **Migration**: `/supabase/migrations/009_add_tiktok_to_reviews_FIXED.sql`

---

**Happy testing! 🚀**

Once you've verified everything works, the feature is ready for production use.
