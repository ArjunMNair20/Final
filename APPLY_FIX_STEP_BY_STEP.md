# 🚀 APPLY LEADERBOARD FIX - STEP BY STEP

## Step 1: Open Supabase Dashboard

1. Go to https://app.supabase.com/
2. Log in with your account
3. Select your **CyberSec Arena** project

## Step 2: Open SQL Editor

1. On the left sidebar, click **"SQL Editor"**
2. Click **"+ New Query"** button

## Step 3: Copy the SQL Migration File

1. Open `leaderboard_migration.sql` file in this project
2. Select **ALL** the content (Ctrl+A or Cmd+A)
3. Copy it (Ctrl+C or Cmd+C)

## Step 4: Paste into Supabase

1. In your Supabase SQL Editor, paste the SQL (Ctrl+V or Cmd+V)
2. The entire migration file should now be in the editor

## Step 5: Run the SQL

Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter)

You should see: ✅ **"Query succeeded"**

## Step 6: Verify It Worked

At the bottom of the screen, you should see query results showing:
- Total leaderboard entries count
- List of leaderboard entries
- List of user profiles

Example output:
```
total_leaderboard_entries: 2
user_id          | username  | total_score
user-123-abc     | john_doe  | 0
user-456-def     | jane_smith| 0
```

## Step 7: Test in Your App

1. **Refresh your app** (Ctrl+R or Cmd+R)
2. Go to **Leaderboard** page
3. You should now see:
   - Your username
   - Your score (0)
   - Your rank

✅ **If you see your name on the leaderboard, the fix worked!**

## Step 8: Test with Multiple Users (Optional)

1. Open app in **incognito window** or different browser
2. Sign up a **new test user**
3. Go to **Leaderboard**
4. Should see both users listed

---

## ⚠️ Troubleshooting

### "Query Error" when running SQL

**Possible causes:**
- Policy already exists (harmless, continue anyway)
- Syntax error

**Solution:** 
- The SQL has `IF NOT EXISTS` clauses, so it's safe to run multiple times
- Refresh the page and try again

### "No players on the leaderboard" after running SQL

**Check:**
1. Did the SQL query run successfully? (look for ✅)
2. Did verification queries show results?
3. Check console (F12) for any error messages

**Solution:**
- Refresh your browser
- Check if you're actually logged in
- Sign out and sign back in

### Verification queries returned 0 results

**Meaning:** No leaderboard entries were created

**Why:**
- No users exist yet
- SQL didn't run properly

**Solution:**
- Run the SQL file again
- Make sure you copy the entire file
- Check for the ✅ success message

---

## 📋 What the SQL Does

### Part 1: RLS Policies (Row Level Security)
- Allows authenticated users to see all leaderboard entries
- Allows users to insert their own leaderboard entries
- Allows users to update their own scores

### Part 2: Trigger Function
- When a new user signs up, automatically creates:
  - User profile
  - User progress
  - Leaderboard entry (with 0 score)

### Part 3: Backfill
- Creates leaderboard entries for users who signed up before this fix
- Doesn't duplicate existing entries

### Verification Queries
- Show you how many entries were created
- Let you see the data

---

## ✅ Success Checklist

- [ ] Opened Supabase Dashboard
- [ ] Opened SQL Editor
- [ ] Copied leaderboard_migration.sql
- [ ] Pasted into SQL Editor
- [ ] Clicked Run button
- [ ] Saw ✅ Query succeeded message
- [ ] Verification queries showed results
- [ ] Refreshed app
- [ ] Can see user on leaderboard

---

## 🎉 After This Works

✅ New users auto-added to leaderboard  
✅ Users see their name and score  
✅ All users appear on all leaderboards  
✅ Real-time score updates  
✅ Leaderboard rankings work correctly  

**You're done!** The leaderboard is now fully functional! 🚀
