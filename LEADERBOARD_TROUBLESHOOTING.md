# Leaderboard Not Showing Any Scores - Troubleshooting

## If you see NO scores at all after applying the fix:

### Step 1: Re-apply the Updated SQL Fix

The original SQL I provided had issues. **Run this updated SQL in Supabase SQL Editor:**

1. Go to Supabase Dashboard → Your Project → SQL Editor
2. Open file: `LEADERBOARD_FIX_SQL.sql` (it's been updated)
3. Copy and paste ALL the SQL
4. Click "Run"
5. **Wait 10 seconds for policies to take effect**

This updated version:
- Disables RLS briefly to clear old policies cleanly
- Re-enables RLS with proper permissions
- Checks data and policies exist
- Provides verification output

### Step 2: Check Browser Console

Open your browser and press **F12** to open Developer Tools → **Console** tab

Look for these messages:

**Success:** ✅
```
[leaderboardService] Fetched leaderboard_scores from Supabase: {count: 5, error: null}
[leaderboardService] Fresh leaderboard loaded: 5 entries
```

**Problem:** ❌
```
[leaderboardService] Fetch error details: {...}
```

If you see an error, **screenshot it** and check step 3.

### Step 3: Verify Data in Supabase

In Supabase SQL Editor, run:

```sql
-- Check if leaderboard_scores table has data
SELECT COUNT(*) as total_entries FROM leaderboard_scores;

-- See what data is there
SELECT user_id, username, total_score FROM leaderboard_scores LIMIT 5;

-- Check user profiles exist
SELECT COUNT(*) as total_users FROM user_profiles;
```

If these return 0, then **no leaderboard entries exist yet** - this is normal for a fresh app. Users will get entries when they complete their first challenge.

### Step 4: Test by Completing a Challenge

1. **Log in to your app**
2. **Complete ONE challenge** (any of these):
   - Solve a CTF task
   - Flag a phishing email
   - Complete a code challenge
3. **Go to Leaderboard page**
4. **You should see your score**

### Step 5: Still No Scores?

Check if there's an authentication issue:

```javascript
// In browser console, paste this:
const token = localStorage.getItem('supabase.auth.token');
console.log('Auth token exists:', !!token);
```

If this is empty, users aren't logged in properly - you need to sign in first.

## Common Issues

| Problem | Solution |
|---------|----------|
| "Fetch error: policy violation" | RLS policies are still wrong - re-run the updated SQL |
| "No leaderboard entries found" | Normal - data appears after first challenge completion |
| Scores show 0 | Scores aren't being synced - check if challenge completion triggers score sync |
| Only YOUR score shows | RLS policy limiting visibility - re-run updated SQL |

## If RLS Policies Are Still Broken

**Nuclear option - Completely disable RLS temporarily to diagnose:**

```sql
-- TEMPORARY: Disable RLS entirely to test
ALTER TABLE leaderboard_scores DISABLE ROW LEVEL SECURITY;

-- Then try leaderboard - if it works, RLS policies are the issue
-- Re-enable and fix policies:
ALTER TABLE leaderboard_scores ENABLE ROW LEVEL SECURITY;
```

## Get Help Debugging

Provide these details if you need help:

1. **Browser console errors** (screenshot)
2. **SQL output** from verification queries above
3. **Username** of test account you're using
4. **Have you completed any challenges?**

The fix should work - if not, we need to see the actual Supabase errors to diagnose further.
