# 🔧 Message Modal - Troubleshooting Guide

**Issue:** "Failed to send message" error  
**Solution:** Check browser console for detailed error information

---

## 🐛 Common Issues & Fixes

### Issue 1: "Please sign in to message this guide"

**Cause:** User is not logged in

**Fix:**
1. Close the modal
2. Click "Sign In" in the top nav
3. Log in with your account
4. Open message modal again

**Demo Accounts:**
- Email: jane.traveler@example.com
- Password: DemoPassword123!

---

### Issue 2: "Failed to send message" (Generic Error)

**Cause:** Multiple possible issues. Use console to diagnose.

**How to debug:**
1. Open browser console: **F12** or **Cmd+Option+I** (Mac)
2. Go to **Console** tab
3. Type a message and click send
4. Look for error messages in console

**Expected good output:**
```
📤 Sending message: {senderId: "...", recipientId: "...", content: "Hey there"}
📥 Response status: 200
✅ Message sent: {success: true, message: {...}}
```

**Common error messages & fixes:**

#### Error: "Missing guide or user ID"
- Guide ID not passed correctly
- Check that you're on a valid trip page
- Refresh the page and try again

#### Error: "404 Not Found"
- The `/api/messages/send` endpoint is missing
- Check that code is deployed
- Hard refresh browser: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)

#### Error: "500 Internal Server Error"
- Server-side issue with message processing
- Check Vercel logs: https://vercel.com/toofuturetechnologies/summitsite/logs
- Look for errors with timestamp matching when you tried to send

#### Error: "TypeError: Cannot read property 'id' of null"
- User object is null
- User is not authenticated
- Fix: Sign in first, then try again

---

### Issue 3: Modal Opens But Can't Type

**Cause:** Input field might be disabled or not focused

**Fix:**
1. Click inside the text input field
2. Make sure cursor appears
3. Type your message
4. Press Enter or click Send button

---

### Issue 4: "Start a conversation..." but can't send

**Cause:** You might not be authenticated

**Fix:**
1. Check if you see the login prompt in the modal
2. If no input field appears, you're not logged in
3. Close modal → Sign in → Open modal again

---

## 📱 Step-by-Step Debug Guide

### For "Failed to send message" Error:

**Step 1: Open Browser Console**
- **Chrome/Edge:** F12 → Console tab
- **Firefox:** F12 → Console tab
- **Safari:** Cmd+Option+I → Console tab

**Step 2: Check for Errors**
Look for red errors that say:
- `❌ API Error`
- `💥 Error`
- `Failed to send message`

**Step 3: Copy Error Details**
- Right-click error
- Select "Copy object" or "Copy message"
- Paste it somewhere to read full error

**Step 4: Check Common Issues**

**If you see "Missing guide or user ID":**
- Trip ID: Not being passed to modal
- User ID: User not authenticated

**If you see "sending message: undefined":**
- One of senderId, recipientId, or content is undefined
- Likely authentication issue

**If you see "Response status: 500":**
- Server error processing message
- Check: Are you authenticated?
- Check: Is trip ID valid?
- Check: Is guide ID valid?

---

## 🔍 Advanced Debugging

### Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Type a message and send
4. Look for a request to `/api/messages/send`
5. Click on it
6. Check **Response** tab to see what server returned

---

### Check Auth State

In browser console, run:
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
```

**Expected output:**
```
User: {
  id: "6f00e559-a0ce-44f6-9963-7f3f607b40b6",
  email: "jane.traveler@example.com",
  ...
}
```

**If you see `User: null`:**
- You're not logged in
- Sign in first before using chat

---

### Check Network Connection

```javascript
// In console:
fetch('/api/messages/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    senderId: 'test',
    recipientId: 'test',
    content: 'test'
  })
}).then(r => r.json()).then(d => console.log(d));
```

This will show you the actual API response

---

## 📋 Pre-Flight Checklist

Before trying to send a message:

- [ ] Logged in? (See name in top nav or check User object in console)
- [ ] On a trip detail page? (URL should be `/trips/[id]`)
- [ ] Chat modal opened? (Popup visible on screen)
- [ ] Modal shows input field? (Not showing login prompt)
- [ ] Text typed in input? (Message not empty)
- [ ] Send button visible? (Blue paper airplane icon)

**If any are ❌**, fix that first.

---

## 🆘 Still Not Working?

### Collect Info:

1. Screenshot of error
2. Browser console output (copy error text)
3. Network tab screenshot
4. Steps to reproduce

### Check:

- Are you using a demo account?
  - Email: jane.traveler@example.com
  - Password: DemoPassword123!

- Is the site live?
  - https://summit-site-seven.vercel.app
  - Should load without errors

- Is your internet working?
  - Open a different website
  - If that fails, fix internet first

### Get Help:

1. Check Vercel logs: https://vercel.com/toofuturetechnologies/summitsite/logs
2. Filter for `/api/messages/send`
3. Look for errors with matching timestamp
4. Read the error message

---

## ✅ Working Message Flow

When everything works:

1. **Open modal:** Click "Message Guide" button
2. **Modal loads:** Shows guide name, trip title, input field
3. **Type message:** Enter text in input field
4. **Send:** Click blue send button
5. **Console shows:** "📤 Sending message..." then "✅ Message sent..."
6. **Message appears:** Your message shows in chat (blue bubble on right)
7. **Input clears:** Text field becomes empty
8. **Ready for next:** Type another message

---

## 🚀 After Fix Deployment

**Latest deploy:** 85c28fd (improved error logging)

**What changed:**
- ✅ Better error messages
- ✅ Console logging for debugging
- ✅ Field validation
- ✅ Detailed API error responses

**To see improvement:**
1. Hard refresh browser: **Ctrl+Shift+R** (Cmd+Shift+R on Mac)
2. Try sending message again
3. Open console (F12)
4. Look for detailed logging

---

## 📞 Contact

If you're still seeing "Failed to send message" after checking all above:

1. Open browser console (F12)
2. Copy the exact error message
3. Check your authentication status
4. Verify you're on a valid trip page with a valid guide

The console will tell you exactly what's wrong! 🔍

