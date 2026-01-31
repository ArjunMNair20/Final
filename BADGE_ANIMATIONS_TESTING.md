# Badge Animations & Sound Effects - Testing Guide

## Quick Start Testing

### Test 1: First Badge Unlock
1. Start the application
2. Navigate to CTF Challenges
3. Solve your first challenge
4. **Expected Result:**
   - Achievement notification appears (top-right)
   - Shows: 🩸 "First Blood" badge
   - Ascending tone sound plays (C→E→G)
   - Confetti animation displays
   - Notification auto-closes after 5 seconds

### Test 2: Multiple Badges
1. Solve 3 CTF challenges quickly
2. Identify 3 phishing emails
3. **Expected Result:**
   - Multiple notifications queue up
   - Each plays unique sound
   - Each shows different emoji and description
   - Notifications appear in order

### Test 3: Sound Verification
Run this in browser console to test sounds directly:
```javascript
import { soundService } from './src/services/SoundService';

// Test individual sounds
soundService.playBadgeUnlock();      // Wait 1s
soundService.playBadgeEarned();      // Wait 1s
soundService.playAchievementComplete(); // Wait 1s
soundService.playSuccess();
```

### Test 4: Badge Details
1. Open Developer Tools (F12)
2. In Console, verify badge data:
```javascript
import { BadgeService } from './src/services/BadgeService';
const service = new BadgeService();
console.log(service.getAllBadges());
```

Should show:
- `id`: Badge identifier
- `name`: Display name
- `emoji`: Visual representation
- `description`: Achievement description
- `condition`: Function that checks if earned

### Test 5: Notification Animation
1. Trigger a badge unlock
2. Verify animations:
   - Notification bounces in from scale(0)
   - Trophy emoji bounces up and down
   - Confetti particles fall and rotate
   - Notification fades out after 5s

### Test 6: Manual Close
1. Unlock a badge
2. Click the "X" button within 5 seconds
3. **Expected:** Notification slides out right and disappears

### Test 7: Mobile Responsive
1. Open on mobile device (Chrome DevTools mobile view)
2. Unlock badge
3. **Expected:** Notification appears in appropriate position without overflow

## Bug Testing

### Test Missing Badges
If badge doesn't appear:
1. Check browser console for errors
2. Verify badge condition is met in progress.tsx
3. Check BadgeService.computeBadges() logic

### Test Silent Sound
If no sound:
1. Check browser audio permissions (Chrome might require user interaction)
2. Verify soundService.playBadgeEarned() in console
3. Check AudioContext state: `audioContext.state`
4. Verify browser supports Web Audio API

### Test Animation Jank
If animations stutter:
1. Check GPU acceleration enabled
2. Verify CSS uses transforms (not position)
3. Open DevTools Performance tab
4. Record and check frame rate (should be 60fps)

## Expected Badge Progression

### CTF Track
1. **First Blood** 🩸 - After solving 1 challenge
2. **CTF Crusader** ⚔️ - After solving 10 challenges
3. **CTF Conquerer** 👑 - After solving 25 challenges

### Phishing Track
1. **Phish Whisperer** 🐟 - After identifying 3 emails
2. **Phish Hunter** 🎣 - After identifying 10 emails

### Code Security Track
1. **Secure Coder** 🔒 - After solving 3 challenges
2. **Code Master** 💻 - After solving 10 challenges

### Quiz Track
1. **Quiz Novice** 📚 - After 5 correct answers
2. **Quiz Expert** 🧠 - After 10 correct answers
3. **Quiz Champion** 🏆 - After 25 correct answers

### Firewall Track
1. **Network Guardian** 🛡️ - After scoring 20+
2. **Firewall Master** ⚡ - After scoring 50+

### Master Achievements
1. **Cybersecurity Enthusiast** 🌟 - Multi-category completion
2. **Security Expert** 🎖️ - Mastered all categories

## Performance Benchmarks

### Expected Performance
- Notification appears: < 100ms
- Sound playback: < 50ms
- Animation frame rate: 60fps
- Memory usage: < 1MB per notification
- Audio context: Single instance (singleton)

### Stress Test
1. Rapidly unlock 10 badges in sequence
2. **Expected:** All notifications queue and display
3. **Memory:** Should not exceed 5MB increase
4. **Performance:** No frame drops

## Accessibility Testing

### Screen Reader
1. Open notification
2. Use screen reader (NVDA, JAWS)
3. Should announce: "Achievement Unlocked, [Badge Name], [Description]"

### Keyboard Navigation
1. Cannot tab into notification (expected - it's auto-dismiss)
2. All controls should be keyboard accessible
3. Close button should be focusable if needed

### Color Contrast
- Badge name: Yellow gradient on dark background (AAA compliant)
- Border: Light yellow on dark background (AAA compliant)

## Configuration Testing

### Sound Off Test
Add to soundService:
```typescript
private muted = false;
playBadgeUnlock(): void {
  if (this.muted) return;
  // ... existing code
}
```

Test future user preference for sound toggle.

## Regression Testing

After updates, verify:
1. ✅ Existing badges still unlock correctly
2. ✅ Progress data persists after page reload
3. ✅ Badges sync to leaderboard
4. ✅ No console errors on startup
5. ✅ No memory leaks (dev tools → memory tab)

## Troubleshooting

### Badge doesn't unlock
- Check condition logic in BadgeService
- Verify progress state is updating
- Check localStorage/Supabase storage

### Sound doesn't play
- Check browser audio permission
- Try muting/unmuting browser tab
- Test Web Audio API support in browser
- Check console for AudioContext errors

### Animation stutters
- Disable browser extensions
- Clear cache (Ctrl+Shift+R)
- Check GPU acceleration setting
- Monitor CPU/GPU usage in DevTools

### Multiple notifications overlap
- By design, they queue
- Each takes top position
- Can be repositioned via CSS if needed

## Success Criteria

All tests pass when:
- ✅ Badges unlock with correct conditions
- ✅ Sound effects play clearly
- ✅ Animations are smooth (60fps)
- ✅ Notifications display correct information
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Accessible to assistive tech
- ✅ No memory leaks
- ✅ Performance remains stable
