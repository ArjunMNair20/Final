# Real-Time Leaderboard Updates - Implementation

## What Changed

Real-time leaderboard updates have been significantly improved for faster, more responsive updates.

### 1. Reduced Debounce Times
- **Score sync debounce**: 1000ms → **300ms** (when user completes challenge, score updates to DB)
- **Real-time subscription debounce**: 2000ms → **500ms** (when other users' scores change, leaderboard refreshes)

### 2. Enhanced Real-Time Subscriptions

**Before:** Silent subscriptions with no visibility into status
**After:** Full logging and status tracking

- Both `leaderboard_scores` and `user_progress` tables are monitored
- Subscription status is logged to console
- Changes trigger immediate refetch (within 500ms)

### 3. Improved Logging

All real-time operations now log to browser console for debugging:

```
[leaderboardService] Setting up real-time subscriptions
[leaderboardService] leaderboard_scores subscription status: SUBSCRIBED
[leaderboardService] user_progress subscription status: SUBSCRIBED
[leaderboardService] leaderboard_scores change detected: UPDATE
[leaderboardService] Real-time update triggered, refetching leaderboard...
[leaderboardService] Broadcasting updated entries: 5
```

## How Real-Time Updates Work

### When You Complete a Challenge (Any Page)

1. **Challenge solved** (CTF.tsx, PhishHunt.tsx, CodeAndSecure.tsx, etc.)
2. **Score calculated** by `useSyncProgressToLeaderboard()` hook
3. **Score synced to database** via `leaderboardService.syncUserScore()`
   - Debounce: 300ms (minimal wait)
4. **Database updated** - your new score is stored
5. **Real-time notification** - subscriptions detect change
6. **Leaderboard refreshes** within 500ms
   - All users on Leaderboard page see update immediately

### When Another User Completes a Challenge

1. **Their database score updates**
2. **Real-time subscriptions detect change**
3. **Your leaderboard refreshes** within 500ms
4. **Their updated score appears** in the table

### Refresh Cycle

```
User 1: Solves CTF Challenge
  ↓ (immediate)
Syncs Score to Database (300ms debounce)
  ↓ (0ms - simultaneous)
Database: leaderboard_scores table updated
  ↓ (Realtime subscription detects change)
All Subscribed Clients Notified
  ↓ (500ms debounce)
Leaderboard Refetches Data
  ↓ (immediate)
User 2's Leaderboard Page Shows New Score
```

## Testing Real-Time Updates

### Setup: 2 Browser Windows

1. **Window 1**: Open Leaderboard page
2. **Window 2**: Open any challenge page (CTF, Phishing, etc.)

### Test Steps

1. **In Window 2**: Complete a challenge (solve a task)
2. **Watch Window 1**: Leaderboard should update **within 1 second**
3. **Open Console** (F12): You should see logs like:
   ```
   [leaderboardService] leaderboard_scores change detected: UPDATE
   [leaderboardService] Real-time update triggered, refetching leaderboard...
   [leaderboardService] Broadcasting updated entries: 5
   ```

### Expected Behavior

- ✅ **Immediate**: Your local score updates in your browser
- ✅ **Fast (300ms)**: Score syncs to database
- ✅ **Quick (500ms)**: Leaderboard refreshes with new data
- ✅ **Instant**: Other users see your update when it happens

## Performance Impact

- **Debounce times**: 300ms and 500ms prevent excessive database queries
- **Subscriptions**: Only refetch on actual changes (not polling)
- **Network**: Minimal - only full leaderboard on change
- **User Experience**: Updates feel instant (< 1 second total)

## Console Logs for Debugging

Open Browser Console (F12) and look for these patterns:

**Good Signs ✅**
- `[leaderboardService] Real-time subscriptions established`
- `[leaderboardService] leaderboard_scores change detected:`
- `[leaderboardService] Broadcasting updated entries: X`
- `[useSyncProgressToLeaderboard] Progress synced successfully`

**Problems ❌**
- No "subscriptions established" message = check Supabase connection
- No "change detected" = RLS policies may be blocking notifications
- Error messages in console = check network/permissions

## Architecture

```
Challenge Complete (CTF/Phishing/Code)
    ↓
syncUserScore() called (progress.tsx hook)
    ↓
leaderboardService.syncUserScore()
    ↓ (300ms debounce)
Supabase upsert → leaderboard_scores table
    ↓ (Real-time trigger)
Supabase notifies all subscribed clients
    ↓ (500ms debounce)
Leaderboard page calls getLeaderboard()
    ↓
UI updates with fresh data
```

## Configuration

All timing can be adjusted in:

- **Leaderboard.tsx** (line 65): `setTimeout(syncScore, 300)` 
- **leaderboardService.ts** (line 319): `}, 500);` in debouncedRefetch

Reduce these values for even faster updates (at cost of more database traffic).
