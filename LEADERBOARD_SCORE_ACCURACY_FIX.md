# Leaderboard Score Calculation - Fixed for Accuracy

## Problem
Leaderboard scores were not showing correctly or were showing inconsistent values for different users.

## Root Cause
The `total_score` being sent to the database didn't always equal the sum of individual component scores (CTF + Phish + Code + Quiz + Firewall), causing display inconsistencies.

## Solution Implemented

### Code Change: `src/services/leaderboardService.ts`

**Lines 224-241**: Modified `syncUserScore()` to calculate total_score as the exact sum of components:

```typescript
// Ensure total_score is always the sum of component scores for consistency
const calculatedTotal = scores.ctf + scores.phish + scores.code + scores.quiz + scores.firewall;

const payload: any = {
  user_id: userId,
  username: profileUsername.toLowerCase(),
  total_score: calculatedTotal,  // ← Use calculated sum, not input
  ctf_score: scores.ctf,
  phish_score: scores.phish,
  code_score: scores.code,
  quiz_score: scores.quiz,
  firewall_score: scores.firewall,
  last_updated: new Date().toISOString(),
};
```

### Score Calculation Formula (Exact per user)

Each user's score is calculated as:

```
Total Score = (CTF Solved × 100) + (Phish Solved × 150) + (Code Solved × 150) + (Quiz Correct × 80) + (Firewall Best Score × 20)
```

**Example:**
- User completes 2 CTF challenges: 2 × 100 = 200
- User solves 1 Phishing email: 1 × 150 = 150
- User completes 1 Code challenge: 1 × 150 = 150
- User gets 10 Quiz questions correct: 10 × 80 = 800
- User's best Firewall score is 15: 15 × 20 = 300

**Total = 200 + 150 + 150 + 800 + 300 = 1,600 points**

### Fallback Logic

In [src/pages/Leaderboard.tsx](src/pages/Leaderboard.tsx#L220-L226), the `getEntryTotal()` function ensures scores display correctly even if total_score is missing:

```typescript
const getEntryTotal = (entry: LeaderboardEntry) => {
  if (!entry) return 0;
  // Use stored total_score if available
  if (entry.total_score !== undefined && entry.total_score !== null) 
    return entry.total_score;
  // Calculate from components as fallback
  const sum = (entry.ctf_score || 0) + (entry.phish_score || 0) + (entry.code_score || 0) + (entry.quiz_score || 0) + (entry.firewall_score || 0);
  return sum;
};
```

## Impact

✅ **All user scores are now exact and consistent**
- Scores match the formula precisely
- Total = sum of all components (no rounding errors)
- Leaderboard rankings are accurate
- Score updates sync immediately to database

## Testing

To verify scores are accurate:

1. **Complete challenges:**
   - Solve 2 CTF tasks (should add 200 points)
   - Flag 1 Phishing email (should add 150 points)
   - Complete 1 Code challenge (should add 150 points)

2. **Check Leaderboard:**
   - Your total score should be exactly 500 points
   - Your progress breakdown should show: CTF: 2, Phish: 1, Code: 1

3. **Verify in browser console (F12):**
   ```
   [leaderboardService] Calculated total_score: 500 from components: {ctf: 200, phish: 150, code: 150, quiz: 0, firewall: 0}
   ```

## Database Verification

To manually verify scores in Supabase:

```sql
-- Check leaderboard entries and their scores
SELECT username, total_score, ctf_score, phish_score, code_score, quiz_score, firewall_score
FROM leaderboard_scores
ORDER BY total_score DESC
LIMIT 10;

-- Verify total_score = sum of components
SELECT 
  username, 
  total_score,
  (ctf_score + phish_score + code_score + quiz_score + firewall_score) as calculated_total,
  CASE 
    WHEN total_score = (ctf_score + phish_score + code_score + quiz_score + firewall_score) 
    THEN '✓ CORRECT' 
    ELSE '✗ MISMATCH' 
  END as validation
FROM leaderboard_scores;
```

All rows should show **✓ CORRECT** in the validation column.
