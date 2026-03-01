# Migration 011 Setup Guide

Step-by-step guide to apply the Admin Panel database schema to Supabase.

## Overview

**Migration 011** creates the admin panel infrastructure:
- `admin_activity_logs` - Audit trail of admin actions
- `disputes` - Customer refund requests
- `content_reports` - Inappropriate content reports
- `suspension_history` - User account suspensions

**Status:** Code created, awaiting Supabase SQL execution

---

## Prerequisites

- ✅ Admin account on Supabase (https://app.supabase.com)
- ✅ Access to nqczucpdkccbkydbzytl project
- ✅ Owner or Admin role in Supabase

---

## Step 1: Prepare SQL

The migration SQL is located at:
```
supabase/migrations/011_add_admin_panel.sql
```

**Content:** 308 lines creating 4 tables + RLS policies + helper functions

---

## Step 2: Access Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select project: **SummitSite**
3. Left sidebar → **SQL Editor**
4. Click **+ New Query** button

---

## Step 3: Copy Migration SQL

**Option A: From GitHub (Recommended)**

1. Open: https://github.com/toofuturetechnologies/SummitSite
2. Navigate to: `supabase/migrations/011_add_admin_panel.sql`
3. Click **Raw** button (top-right)
4. Select all (Cmd+A or Ctrl+A)
5. Copy (Cmd+C or Ctrl+C)

**Option B: From Local File**

```bash
# Copy to clipboard (macOS)
cat supabase/migrations/011_add_admin_panel.sql | pbcopy

# Copy to clipboard (Linux)
cat supabase/migrations/011_add_admin_panel.sql | xclip -selection clipboard

# Copy to clipboard (Windows)
type supabase\migrations\011_add_admin_panel.sql | clip
```

---

## Step 4: Paste into SQL Editor

1. In Supabase SQL Editor, click in the query textarea
2. Paste SQL (Cmd+V or Ctrl+V)
3. You should see ~308 lines of SQL

---

## Step 5: Execute Migration

1. Click **Run** button (Ctrl+Enter or ⌘ Enter)
2. Wait for execution to complete (~2-3 seconds)
3. Check for success message at bottom

**Expected Output:**
```
✓ Query executed successfully
```

**Common Errors & Solutions:**

| Error | Cause | Solution |
|-------|-------|----------|
| `table already exists` | Table created before | Drop table: `DROP TABLE IF EXISTS admin_activity_logs CASCADE;` |
| `column already exists` | Column exists on profiles | Check columns exist before adding |
| `permission denied` | No ALTER TABLE permission | Use service role key in env |
| `syntax error` | Malformed SQL | Check line numbers in error message |

---

## Step 6: Verify Tables Created

1. Left sidebar → **SQL Editor**
2. Run this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'admin_%' OR table_name LIKE 'disputes' 
  OR table_name LIKE 'content_reports' 
  OR table_name LIKE 'suspension_%';
```

**Expected Result:**
```
table_name
─────────────────────
admin_activity_logs
disputes
content_reports
suspension_history
```

---

## Step 7: Verify RLS Policies

1. Go to **Authentication** → **Policies** (left sidebar)
2. Scroll down to find policies for:
   - `admin_activity_logs`
   - `disputes`
   - `content_reports`
   - `suspension_history`

**Expected:** 8-12 policies total (admins can view all, users can view own)

---

## Step 8: Verify Helper Functions

1. Go to **SQL Editor**
2. Run:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE 'log_%' 
  OR routine_name LIKE 'suspend_%' 
  OR routine_name LIKE 'lift_%'
  OR routine_name LIKE 'is_user_%';
```

**Expected Result:**
```
routine_name
──────────────────
log_admin_activity
suspend_user
lift_suspension
is_user_suspended
```

---

## Step 9: Create Admin Account

To access the admin panel, you need admin privileges.

**Option A: Use SQL (Recommended)**

1. Go to **SQL Editor**
2. Run:

```sql
UPDATE profiles 
SET admin_role = 'admin', admin_since = now() 
WHERE email = 'your-email@example.com';
```

**Replace:** `your-email@example.com` with your actual email

**Verify:**
```sql
SELECT email, admin_role, admin_since 
FROM profiles 
WHERE email = 'your-email@example.com';
```

Expected:
```
email                  | admin_role | admin_since
──────────────────────┼────────────┼──────────────────────
your-email@example.com| admin      | 2026-03-01 20:35:00
```

**Option B: Update via Auth Admin Panel**

1. Go to **Authentication** → **Users** (left sidebar)
2. Find your user
3. Click on user
4. In "User details" section, you can add custom claims (if enabled)
5. Or use SQL method above (more reliable)

---

## Step 10: Test Admin Access

1. Go to https://summit-site-seven.vercel.app
2. Login with your email
3. Navigate to https://summit-site-seven.vercel.app/admin
4. You should see **Admin Dashboard** with metrics

**If you see "Unauthorized" or "Loading...":**
- Verify `admin_role = 'admin'` in database (run query from Step 9)
- Clear browser cache/cookies
- Log out and log back in
- Check browser console for errors (F12 → Console)

---

## Step 11: Verify Admin Dashboard

Once in admin panel:

1. **Dashboard** should show:
   - Total users
   - Active guides
   - Total bookings
   - Monthly revenue
   - Pending disputes
   - Pending reviews

2. **Users** page should:
   - List all users
   - Allow filtering by status (active/suspended)
   - Show "Suspend" button on each user

3. **UGC** page should:
   - List TikTok videos
   - Show approve/reject buttons
   - Filter by status (pending/approved/rejected)

4. **Disputes** page should:
   - List disputes
   - Show resolve button
   - Track refund status

5. **Reports** page should:
   - List content reports
   - Show reporter and reason
   - Allow resolution

---

## Troubleshooting

### "Unauthorized" on Admin Page

**Cause:** `admin_role` not set in database

**Fix:**
```sql
UPDATE profiles 
SET admin_role = 'admin' 
WHERE id = (SELECT auth.uid());
```

Then log out and log back in.

---

### "Loading admin panel..." stuck

**Cause:** API endpoint returns 401/403

**Fix:**
1. Open DevTools (F12)
2. Go to **Network** tab
3. Refresh admin page
4. Check `/api/admin/check` response
5. Should return `{ isAdmin: true }`

If not:
- Verify database `admin_role` is set
- Check API endpoint code (`src/app/api/admin/check/route.ts`)
- Check Supabase logs for errors

---

### "Access Denied" or "403"

**Cause:** RLS policy blocking access

**Fix:**
1. Check RLS policies are applied (Step 7)
2. Verify user has `admin_role` set
3. Check policy logic:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'admin_activity_logs';
   ```

---

### Tables Created but Empty

**Normal behavior.** Tables are empty until admin takes actions. First action should be logged in `admin_activity_logs`.

---

## Rollback (If Needed)

If something goes wrong, rollback:

```sql
DROP TABLE IF EXISTS admin_activity_logs CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS content_reports CASCADE;
DROP TABLE IF EXISTS suspension_history CASCADE;
DROP FUNCTION IF EXISTS log_admin_activity;
DROP FUNCTION IF EXISTS suspend_user;
DROP FUNCTION IF EXISTS lift_suspension;
DROP FUNCTION IF EXISTS is_user_suspended;
DROP VIEW IF EXISTS active_suspensions;
```

Then re-apply the migration.

---

## Next Steps

After migration is applied:

1. ✅ Create admin account (Step 9)
2. ✅ Test admin access (Step 10)
3. ⏭️ Execute testing checklist (see ADMIN-PANEL-TESTING-CHECKLIST.md)
4. ⏭️ Monitor error logs during first 24 hours
5. ⏭️ Document any issues found

---

## Support

- **Supabase Help**: https://supabase.com/help
- **Error Details**: Check Supabase Logs → Function Logs or Database Logs
- **Questions**: Email dev@summit.local

---

## Summary Checklist

- [ ] Access Supabase SQL Editor
- [ ] Copy 011_add_admin_panel.sql
- [ ] Paste into SQL Editor
- [ ] Execute migration
- [ ] Verify 4 tables created
- [ ] Verify RLS policies created
- [ ] Verify 4 helper functions created
- [ ] Set your admin_role to 'admin'
- [ ] Login and test admin access
- [ ] See admin dashboard load successfully
