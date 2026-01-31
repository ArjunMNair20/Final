# Leaderboard Fix - Complete Solution

## Issue
Leaderboard still showing "No players on the leaderboard yet" even after code changes.

## Root Causes
1. **Database trigger not updated** - New users' leaderboard entries weren't being created automatically
2. **RLS policies too restrictive** - Users couldn't create their own leaderboard entries
3. **Query issues** - View-based queries had problems

## Solution - 3 Critical Updates Needed

### Step 1: Update RLS Policy for Leaderboard Inserts

In your **Supabase SQL Editor**, run this SQL:

```sql
-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can insert their own leaderboard entry" ON leaderboard_scores;

-- Create new policies
CREATE POLICY "Users can insert their own leaderboard entry"
  ON leaderboard_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to insert leaderboard entries more flexibly
CREATE POLICY "System can insert leaderboard entries"
  ON leaderboard_scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own scores
CREATE POLICY "Users can update their own leaderboard entry"
  ON leaderboard_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow public read
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_scores FOR SELECT
  TO authenticated
  USING (true);
```

### Step 2: Update Database Trigger Function

In your **Supabase SQL Editor**, run this SQL to replace the `handle_new_user()` function:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username text;
BEGIN
  -- Generate username if not provided
  generated_username := COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8));
  
  -- Create user profile
  INSERT INTO user_profiles (id, username, email, name)
  VALUES (
    NEW.id,
    generated_username,
    NEW.email,
    NEW.raw_user_meta_data->>'name'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create user progress
  INSERT INTO user_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create leaderboard entry
  INSERT INTO leaderboard_scores (
    user_id, 
    username, 
    total_score, 
    ctf_score, 
    phish_score, 
    code_score, 
    quiz_score, 
    firewall_score
  )
  VALUES (
    NEW.id,
    generated_username,
    0,
    0,
    0,
    0,
    0,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 3: For Existing Users - Run This Cleanup Query

This will create leaderboard entries for any users who signed up before the trigger was updated:

```sql
INSERT INTO leaderboard_scores (user_id, username, total_score, ctf_score, phish_score, code_score, quiz_score, firewall_score)
SELECT 
  up.id,
  up.username,
  0,
  0,
  0,
  0,
  0,
  0
FROM user_profiles up
WHERE NOT EXISTS (
  SELECT 1 FROM leaderboard_scores ls WHERE ls.user_id = up.id
)
ON CONFLICT (user_id) DO NOTHING;
```

## Code Changes Applied

### 1. leaderboardService.ts
- ✅ Simplified `getLeaderboard()` query to avoid RLS issues
- ✅ Query `leaderboard_scores` directly with simple profile joins
- ✅ Added console logging for debugging
- ✅ Improved `ensureLeaderboardEntry()` to use upsert

### 2. Leaderboard.tsx
- ✅ Added console logs to track loading

### 3. authService.ts
- ✅ Adds leaderboard entry on signup (already done)

### 4. schema.sql
- ✅ Updated trigger function
- ✅ Added new RLS policy

## Testing Steps

### After Running the SQL:

1. **Sign up a new user** (or use your current user)
2. **Open browser console** (F12 → Console tab)
3. **Go to Leaderboard** page
4. **Check console for these logs:**
   ```
   Loading leaderboard for user: [your-user-id]
   Fetching leaderboard...
   Found X leaderboard entries
   Leaderboard loaded with X entries
   Leaderboard data received: [array with users]
   ```

5. **You should see:**
   - Your name and username on the leaderboard
   - Score of 0
   - Rank #1 (or whatever your position is)

### Test with Multiple Users:
1. Create 2-3 test accounts
2. Each user should appear on all leaderboards immediately
3. Score changes should update in real-time

## If Still Not Working

### Check these in Supabase Dashboard:

**In SQL Editor, run:**
```sql
-- Check how many leaderboard entries exist
SELECT COUNT(*) as total_entries FROM leaderboard_scores;

-- Check all entries
SELECT user_id, username, total_score FROM leaderboard_scores LIMIT 10;

-- Check user profiles
SELECT id, username, name FROM user_profiles LIMIT 10;
```

### Check Browser Console for Errors:
- Open DevTools (F12)
- Look for any red error messages
- Copy the exact error and check if it's an RLS issue

### If you see RLS errors:
- The policies haven't been updated in Supabase yet
- Re-run Step 1 SQL

## Quick Checklist

- [ ] Step 1 SQL executed (new RLS policies)
- [ ] Step 2 SQL executed (updated trigger function)
- [ ] Step 3 SQL executed (backfill existing users)
- [ ] Signed up a new test user
- [ ] Checked browser console for success logs
- [ ] See user on leaderboard with name and score

## Expected Behavior After Fix

✅ New user signs up → Automatically added to leaderboard  
✅ User sees their name and 0 score on leaderboard  
✅ All users see each other on leaderboard  
✅ Scores update in real-time  
✅ Rankings update automatically  

## Support

If still having issues:
1. Check console logs (F12)
2. Verify SQL was actually executed in Supabase
3. Check leaderboard_scores table directly in Supabase dashboard
4. Confirm user_profiles exist for users

