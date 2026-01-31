# Progress Persistence - Testing Guide

## Quick Start Test (5 minutes)

### Test 1: Basic Progress Save
1. **Login** to your account
2. **Go to CTF Challenges** section
3. **Solve 1-2 challenges** (or mark as completed)
4. **Refresh the page** (F5)
5. ✅ **Expected**: Your solved challenges should still show as completed

### Test 2: Logout and Restore
1. **Login** to your account
2. **Solve 2-3 challenges** across different sections (CTF, Phish Hunt, Code)
3. **Click "Logout"** button in the header
4. **You should see**: Loading spinner briefly, then redirected to login
5. ✅ **Expected**: No errors, smooth logout transition
6. **Login again** with same credentials
7. ✅ **Expected**: All challenges you solved are still marked as completed

### Test 3: Cross-Section Progress
1. **Solve 1 CTF challenge**
2. **Solve 1 Phish Hunt challenge**
3. **Solve 1 Code & Secure challenge**
4. **Take and pass 1 Quiz**
5. **Refresh page**
6. ✅ **Expected**: All 4 sections show your progress preserved

## Browser Console Debugging

### Check Saved Progress
Open browser DevTools (F12) and run:

```javascript
// See what's in localStorage
JSON.parse(localStorage.getItem('cybersec_arena_progress_v1'))

// Should show:
// {
//   ctf: { solvedIds: ['challenge-1', 'challenge-2'] },
//   phish: { solvedIds: [...] },
//   code: { solvedIds: [...] },
//   quiz: { answered: 5, correct: 3, difficulty: 'easy' },
//   firewall: { bestScore: 2500 },
//   badges: ['first_challenge', 'phish_master']
// }
```

### Monitor Sync Events
Filter console logs to see sync messages:

```javascript
// In DevTools Console, you'll see:
"Syncing progress before logout..."
"Progress synced successfully"
"Performing logout..."
"Logout completed"
```

## Detailed Test Scenarios

### Scenario A: Immediate Progress Tracking
**Duration**: 2 minutes

1. Open DevTools (F12) → Console tab
2. Login to your account
3. Clear console logs (Ctrl+L or trash icon)
4. Solve a challenge → Watch console output
5. You should see:
   - Debug logs about progress loading
   - Debounce timer (100ms)
   - Success messages about localStorage save
   - If authenticated: Supabase sync message

### Scenario B: Login/Logout Cycle
**Duration**: 3 minutes

1. **Before logout:**
   - Open DevTools → Storage → Local Storage
   - Note the challenge IDs in `cybersec_arena_progress_v1`

2. **During logout:**
   - Click Logout button
   - Watch console for:
     - "Syncing progress before logout..."
     - Progress saved messages
     - "Logout completed"

3. **After login:**
   - Check DevTools Storage again
   - Verify same challenge IDs are restored
   - UI should show all solved challenges

### Scenario C: Multi-Device Testing
**Duration**: 5-10 minutes (requires 2 devices/browsers)

1. **Device A:**
   - Login
   - Solve 3-4 challenges
   - Note their IDs from console
   - Log out

2. **Device B:**
   - Open in different browser/device
   - Login with SAME account
   - Navigate to sections where you solved challenges
   - ✅ Should see all 3-4 challenges as solved

3. **Device A:**
   - Log back in
   - ✅ Progress still there

### Scenario D: Offline Simulation
**Duration**: 5 minutes

1. **Open DevTools** → Network tab
2. **Set Network to "Offline"** (throttling dropdown)
3. **Solve a challenge** while offline
4. Watch console - should see:
   - localStorage save ✅ SUCCESS
   - Supabase sync ✗ FAILED (network unavailable)
   - **Important**: Progress IS saved to localStorage!

5. **Go back online:**
   - DevTools → Network → Select "No throttling"
   - Refresh page
   - Should sync with Supabase
   - Progress restored from database

## What to Look For

### ✅ Success Indicators
- [ ] Console shows no red errors during logout
- [ ] Logout completes in <2 seconds
- [ ] After login, all solved challenges appear immediately
- [ ] localStorage contains progress data
- [ ] No infinite loading spinners

### ⚠️ Warning Signs
- [ ] Logout takes >5 seconds
- [ ] Progress disappears after logout
- [ ] Console shows auth errors
- [ ] localStorage appears empty
- [ ] Red error messages about Supabase

## Detailed Console Output Expected

### When Solving a Challenge
```
[DEBUG] Syncing progress before logout...
[DEBUG] Supabase sync initiated
[DEBUG] Synced to database: { user_id: '...', ctf_solved_ids: [...], ... }
```

### When Logging Out
```
[DEBUG] useLogoutWithSync: logout called
[DEBUG] Syncing progress before logout...
[DEBUG] Progress synced successfully
[DEBUG] Performing logout...
[DEBUG] Logout completed
```

### When Logging In
```
[DEBUG] ProgressProvider: Loading progress...
[DEBUG] Loaded from localStorage: { ctf: { solvedIds: [...] }, ... }
[DEBUG] User authenticated: syncing with Supabase
[DEBUG] Progress synced from Supabase
[DEBUG] ProgressProvider: Ready
```

## Testing Checklist

### Core Functionality
- [ ] Challenges persist on page refresh
- [ ] Challenges persist across logout/login
- [ ] Multiple challenge types tracked (CTF, Phish, Code, Quiz)
- [ ] Badges persist
- [ ] Scores persist

### Edge Cases
- [ ] Test with empty progress (new user)
- [ ] Test with lots of solved challenges (100+)
- [ ] Test switching between accounts
- [ ] Test with JavaScript disabled (if applicable)

### Browser Support
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Devices
- [ ] Desktop
- [ ] Tablet
- [ ] Mobile (if responsive design supported)

## Common Issues & Solutions

### Issue: "Progress disappeared after logout"
**Solution:**
1. Check if Supabase is properly configured
2. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
3. Check Supabase project is accessible
4. Try clearing cache: `localStorage.clear()`

### Issue: "Sync seems slow (>2 seconds)"
**Solution:**
1. Check network throttling in DevTools
2. Verify Supabase region is close to you
3. Check if browser extensions are interfering
4. Normal: 100-500ms for sync is acceptable

### Issue: "Getting 'not authenticated' errors"
**Solution:**
1. Verify login was successful
2. Check token in localStorage
3. Verify Supabase auth is configured
4. Try logging out and in again

### Issue: "Different progress on different devices"
**Solution:**
1. Make sure you're using SAME account
2. Wait 5-10 seconds for sync to complete
3. Try refreshing page on second device
4. Check Supabase console for user_id match

## Performance Notes

- **Local save**: <5ms (localStorage)
- **Supabase sync**: 100-500ms typical
- **Total logout time**: <2 seconds expected
- **Total login time**: <3 seconds expected

The hybrid approach ensures:
- Instant local availability (localStorage)
- Background database sync (Supabase)
- No blocking operations

## Next Steps

After verifying progress persistence works:

1. ✅ Test completed locally
2.📱 Test on different devices
3. 🌐 Test with different network conditions
4. 👥 Have other users test
5. 📊 Monitor server logs for sync issues

## Questions?

If progress isn't persisting:
1. Check browser console (F12) for errors
2. Check Supabase project status
3. Verify .env variables are set
4. Check localStorage isn't disabled
5. Check database schema is correct

## Report Format

If you find issues, please include:
- Browser and version
- Steps to reproduce
- Console error messages
- localStorage contents (from DevTools)
- Expected vs. actual behavior
