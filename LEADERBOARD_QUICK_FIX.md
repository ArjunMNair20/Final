# Quick Leaderboard Debugging

## What to Do Right Now

### 1. Open Supabase Dashboard
Go to: https://app.supabase.com/

### 2. Go to Your Project
Select your CyberSec Arena project

### 3. Open SQL Editor
Click "SQL Editor" on the left sidebar

### 4. Check if Leaderboard Has Data
Run this query:
```sql
SELECT * FROM leaderboard_scores LIMIT 10;
```

**Expected Result:** You should see at least your user entry with your username

**If Result is Empty:** No leaderboard entries exist - the trigger hasn't created them

### 5. Check User Profiles
Run this query:
```sql
SELECT id, username, email FROM user_profiles LIMIT 10;
```

**Expected Result:** You should see your user here

### 6. Apply the 3 SQL Fixes

**Copy and run each SQL statement from LEADERBOARD_FIX_INSTRUCTIONS.md:**

1. First: RLS Policy Update (Step 1)
2. Second: Trigger Function Update (Step 2)  
3. Third: Backfill Existing Users (Step 3)

### 7. After Running SQL

Go back to your app and:
1. Open browser console (F12)
2. Go to Leaderboard page
3. Look for success messages:
   - "Fetching leaderboard..."
   - "Found X leaderboard entries"
   - "Leaderboard loaded with X entries"

### 8. Verify

You should see:
- Your name on the leaderboard
- Score of 0
- Rank position

---

## Common Issues

### "No players on the leaderboard"
- SQL wasn't run in Supabase yet
- Run Step 1, 2, and 3 SQL statements

### Console shows: "Error: permission denied"
- RLS policies not updated
- Re-run Step 1 SQL

### Console shows no logs at all
- Check if you're actually on the Leaderboard page
- Refresh the page (Ctrl+R or Cmd+R)

### Leaderboard entries exist but not showing
- Check if RLS policies are correct
- Run Step 1 SQL again

---

## Still Not Working?

Run all three commands in order in Supabase SQL Editor:

```sql
-- First: Update RLS Policies
DROP POLICY IF EXISTS "Users can insert their own leaderboard entry" ON leaderboard_scores;
CREATE POLICY "Users can insert their own leaderboard entry" ON leaderboard_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can insert leaderboard entries" ON leaderboard_scores FOR INSERT TO authenticated WITH CHECK (true);

-- Second: Update Trigger
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$ 
DECLARE generated_username text; 
BEGIN 
  generated_username := COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)); 
  INSERT INTO user_profiles (id, username, email, name) VALUES (NEW.id, generated_username, NEW.email, NEW.raw_user_meta_data->>'name') ON CONFLICT (id) DO NOTHING; 
  INSERT INTO user_progress (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING; 
  INSERT INTO leaderboard_scores (user_id, username, total_score, ctf_score, phish_score, code_score, quiz_score, firewall_score) VALUES (NEW.id, generated_username, 0, 0, 0, 0, 0, 0) ON CONFLICT (user_id) DO NOTHING; 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Third: Backfill Existing Users
INSERT INTO leaderboard_scores (user_id, username, total_score, ctf_score, phish_score, code_score, quiz_score, firewall_score)
SELECT up.id, up.username, 0, 0, 0, 0, 0, 0
FROM user_profiles up
WHERE NOT EXISTS (SELECT 1 FROM leaderboard_scores ls WHERE ls.user_id = up.id)
ON CONFLICT (user_id) DO NOTHING;
```

Then refresh your app and check the leaderboard.
