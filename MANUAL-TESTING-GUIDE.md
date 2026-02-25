# Manual Testing Guide - Summit Platform

**Platform URL:** https://summit-site-seven.vercel.app  
**Test Accounts:** See `TEST-RESULTS.md`

---

## 🎯 Quick Start (5 minutes)

### Setup
1. Open two browser windows/tabs side-by-side
2. In Tab 1: Open https://summit-site-seven.vercel.app
3. In Tab 2: Open the same URL

### Test Messaging (5 min)

**Tab 1 - Customer (Jane Traveler):**
```
1. Click "Sign In"
2. Enter:
   Email: jane.traveler@example.com
   Password: DemoPassword123!
3. Click "Sign In"
4. You should land on /dashboard or /trips
5. Go to "Browse Trips" or click any trip link
6. Find Alex's trip (should show "Alex Mountain" as guide)
7. Scroll down to "About Your Guide" section
8. Click the blue "Message" button
9. Type: "Hi Alex! I'm very interested in your rock climbing trip. When is your next session?"
10. Click "Send"
11. You should see your message appear immediately
12. Message should show timestamp
```

**Tab 2 - Guide (Alex Mountain):**
```
1. Click "Sign In"
2. Enter:
   Email: alex.mountain@example.com
   Password: DemoPassword123!
3. Click "Sign In"
4. Click on your avatar/profile dropdown
5. Select "Dashboard" or go to /dashboard
6. Click "Messages" in the quick links
7. You should see "Jane Traveler" in the conversations list
8. Look for an unread badge with a number (should show "1")
9. Click Jane's conversation
10. You should see Jane's message displayed
11. Type reply: "Hi Jane! Great question. I have trips scheduled for Mar 15-17 and Apr 5-7. Which dates work better for you?"
12. Click "Send"
13. Your reply should appear below Jane's message
```

**Back to Tab 1 - Customer Receives Reply:**
```
1. Refresh the page (or it auto-updates)
2. You should see Alex's reply below your message
3. Both messages should show timestamps
4. The conversation should be marked as "read" (no more unread badge in Tab 2)
```

---

## 📊 What You Should See

### Message Thread Appearance

```
Message 1 (Customer):
┌─────────────────────────────────────────┐
│ Jane Traveler                      2:45 PM │
│                                             │
│ Hi Alex! I'm very interested in your rock │
│ climbing trip. When is your next session? │
└─────────────────────────────────────────┘

Message 2 (Guide):
┌─────────────────────────────────────────┐
│ Alex Mountain                      2:47 PM │
│                                             │
│ Hi Jane! Great question. I have trips     │
│ scheduled for Mar 15-17 and Apr 5-7.      │
│ Which dates work better for you?          │
└─────────────────────────────────────────┘
```

### Conversations List (Guide View)

```
Jane Traveler
Last message: "Hi Alex! I'm very interested..."
Today, 2:45 PM
[Unread: 1]
```

---

## 🔧 Troubleshooting Manual Tests

### Messages Not Sending?
- [ ] Check browser console (F12 → Console tab)
- [ ] Should see no red errors
- [ ] Verify you're logged in (email shows in header)
- [ ] Try refreshing the page

### Conversations List Empty?
- [ ] Try sending a message first
- [ ] Refresh /dashboard/messages page
- [ ] Check that you're logged in as the correct user

### Profile Names Not Showing?
- [ ] Clear browser cache: Ctrl+Shift+Del (or Cmd+Shift+Del on Mac)
- [ ] Select "All time" and "Cookies and other site data"
- [ ] Reload page

### Wrong User Logged In?
- [ ] Click your profile in top right
- [ ] Click "Logout"
- [ ] Sign in with different email

---

## 📝 Additional Features to Test

### 1. Try Sending Multiple Messages
- Send 3-4 messages back and forth
- Verify conversation history displays correctly
- Check that messages stay in order

### 2. Try Different Trips
- Find another guide/trip
- Message a different guide
- Verify you have separate conversations

### 3. Test on Different Browsers
- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅

---

## 📸 Expected Screenshots

### Dashboard Messages Page
- Left sidebar: List of conversations
- Each shows avatar circle with first letter
- Shows last message text (truncated)
- Shows timestamp
- Shows unread count (if any)
- Right side: Selected conversation thread
- Messages alternate left/right
- Input field at bottom

### Trip Detail Page
- Guide info card with name, bio, rating
- Blue "Message" button in top right of guide card
- Reviews section below

---

## ✅ Verification Checklist

Run through and check off each:

**Messaging Features:**
- [ ] Can send message to guide
- [ ] Guide receives message
- [ ] Guide can reply
- [ ] Customer sees reply
- [ ] Messages show timestamps
- [ ] Unread count updates
- [ ] Messages auto-mark as read when viewed
- [ ] Conversation history stays in order

**UI Polish:**
- [ ] Messages appear instantly (no delay > 1 sec)
- [ ] Timestamps are human-readable (e.g., "2:45 PM" not "1708874700")
- [ ] Sender names visible
- [ ] Input field is always visible and usable
- [ ] Scrollbar works on long conversations

**Data Integrity:**
- [ ] Message text never changes or gets garbled
- [ ] Sender/recipient IDs correct
- [ ] No duplicate messages
- [ ] Messages persist on page refresh

---

## 🐛 Bug Reporting Template

If you find an issue:

```
**Bug:** [Short description]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [Expected result vs actual]

**Environment:**
- Browser: Chrome / Firefox / Safari / Edge
- OS: Windows / Mac / Linux
- Account: Jane / Alex / John
- URL: https://summit-site-seven.vercel.app/...

**Console Errors:**
[Paste any red errors from F12 → Console]

**Severity:**
- Critical (feature broken)
- High (feature doesn't work as expected)
- Medium (minor issue)
- Low (cosmetic)
```

---

## 📞 Need Help?

Check Vercel logs:
1. Go to https://vercel.com/toofuturetechnologies/summitsite/logs
2. Look for errors with endpoint names (e.g., "stripe-webhook")
3. Check timestamps

Check Supabase logs:
1. Go to https://app.supabase.com
2. Project: nqczucpdkccbkydbzytl
3. Check the SQL Editor or Logs section

---

## 🎯 Expected Timeline

- **Message send:** <1 second
- **See reply:** Auto-refresh or <3 seconds
- **Conversation list load:** <2 seconds
- **Full thread load:** <3 seconds

If significantly slower, check:
1. Network tab in browser dev tools
2. Vercel deployment status
3. Supabase database status

---

**Ready to test?** Start with the 5-minute Quick Start above!
