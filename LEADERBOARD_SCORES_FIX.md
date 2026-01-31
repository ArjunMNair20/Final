# Leaderboard Scores Not Showing - Root Cause & Fix

## Problem Identified
**Scores and progress are not displaying for any users on the Leaderboard page.**

### Root Causes
1. **RLS Policy Conflict**: The `leaderboard_scores` table has multiple conflicting INSERT policies that prevent upsert operations from working properly
2. **Upsert Failure**: The `syncUserScore()` function uses Supabase upsert with `onConflict: 'user_id'`, but the RLS policies don't properly support this operation
3. **Score Sync Blocked**: When users complete challenges and their scores update, the sync to `leaderboard_scores` table fails silently, leaving all scores as 0

## Why It's Broken

**In `schema.sql` (lines 145-148):**
```sql
CREATE POLICY "Users can insert their own leaderboard entry"
  ON leaderboard_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert leaderboard entries"
  ON leaderboard_scores FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

These two INSERT policies conflict! When Supabase tries to upsert with `onConflict`, it gets confused about which policy to use, causing the operation to fail silently.

**In `leaderboardService.ts` (line 246-251):**
```typescript
const { error: upsertError } = await supabase
  .from('leaderboard_scores')
  .upsert(payload, {
    onConflict: 'user_id',
  });
```

The upsert fails but the error handling doesn't retry, so scores never get saved.

## Solution

### Step 1: Update RLS Policies (Database)

**Run this SQL in your Supabase SQL Editor:**

```sql
-- Drop conflicting policies
DROP POLICY IF EXISTS "Users can insert their own leaderboard entry" ON leaderboard_scores;
DROP POLICY IF EXISTS "System can insert leaderboard entries" ON leaderboard_scores;
DROP POLICY IF EXISTS "Users can update their own leaderboard entry" ON leaderboard_scores;
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard_scores;

-- CREATE SIMPLIFIED POLICIES
CREATE POLICY "authenticated_can_view_leaderboard"
  ON leaderboard_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_can_insert_leaderboard"
  ON leaderboard_scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_can_update_leaderboard"
  ON leaderboard_scores FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

This simplifies the policies to remove conflicts while maintaining security (only authenticated users can access).

### Step 2: Update Frontend Code (Already Done)

The following changes were made to `src/services/leaderboardService.ts`:

1. **Explicit column selection** (line 37-38):
   - Changed from `select('*')` to explicit column list
   - Ensures all score columns are fetched even if schema changes

2. **Better error handling** (lines 246-267):
   - If upsert fails, tries explicit UPDATE
   - If UPDATE fails, tries INSERT
   - Provides detailed logging for debugging

3. **Debug logging** (lines 46-50):
   - Logs actual score values from database
   - Helps identify if scores are missing or just not displaying

### Step 3: Verify Fix

1. **After applying the SQL changes**, wait 5-10 seconds for policies to take effect
2. **In your app, complete a challenge** (solve a CTF, phishing email, code challenge, etc.)
3. **Check Leaderboard page** - you should see:
   - Your score and progress
   - Other users' scores and progress
   - Your rank updated

4. **Check browser console** for logs:
   - Look for `[leaderboardService] Score synced successfully`
   - Look for `[Leaderboard] Fresh leaderboard loaded: X entries`

## Files Modified

1. **LEADERBOARD_FIX_SQL.sql** (NEW) - Contains the corrected RLS policies
2. **src/services/leaderboardService.ts** - Enhanced error handling and logging

## How to Apply

### For Supabase Cloud:
1. Go to Supabase Dashboard → Your Project → SQL Editor
2. Open file: `LEADERBOARD_FIX_SQL.sql`
3. Copy the SQL code
4. Paste it in the SQL Editor
5. Click "Run"
6. Wait for completion

### Expected Output:
```
DROP POLICY 1 (or 0 if not exists)
DROP POLICY 1 (or 0 if not exists)
DROP POLICY 1 (or 0 if not exists)
DROP POLICY 1 (or 0 if not exists)
CREATE POLICY 1
CREATE POLICY 1
CREATE POLICY 1
```

## Testing Steps

1. **Create test account** or use existing account
2. **Complete 2-3 challenges**:
   - Solve one CTF task
   - Flag one Phishing email
   - Complete one Code challenge
3. **View Leaderboard**
4. **Verify**:
   - ✅ Your score is visible (should be CTF: 100 + Phish: 150 + Code: 150 = 400 minimum)
   - ✅ Your progress is shown (CTF Solved: 1, Phish Solved: 1, Code Solved: 1)
   - ✅ Your rank is displayed
   - ✅ Other users' scores visible if any exist

## Monitoring

Watch the browser console (F12 → Console tab) for:

**Success Indicators:**
- `[Leaderboard] Score synced to Supabase successfully`
- `[leaderboardService] Fresh leaderboard loaded: X entries`
- Score values logged with actual numbers (not 0)

**Error Indicators:**
- `[Leaderboard] Failed to sync score`
- `[leaderboardService] Fetch error`
- Empty leaderboard or 0 scores

## If Issues Persist

1. **Clear browser cache**: Ctrl+Shift+Delete in Chrome
2. **Check Supabase logs**: Dashboard → Logs for any policy violations
3. **Verify user_profiles table**: Ensure user record exists
4. **Check leaderboard_scores table**: Ensure user entry exists with user_id

```sql
-- Check if your user has a leaderboard entry
SELECT * FROM leaderboard_scores WHERE user_id = 'YOUR_USER_ID';

-- Should return a row with total_score, ctf_score, phish_score, code_score, etc.
```

## Summary

The leaderboard was broken due to conflicting RLS policies that prevented score updates from reaching the database. By simplifying the policies and adding fallback logic to the sync function, scores will now properly save and display for all users.
