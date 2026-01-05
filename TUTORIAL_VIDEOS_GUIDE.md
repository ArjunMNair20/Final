# How to Add Videos to Tutorials Section

## Option 1: Using YouTube Videos (Easiest)

### Step 1: Find or Upload a Video
- **Find existing videos**: Search YouTube for cybersecurity tutorials
- **Create your own**: Record animated tutorials and upload to YouTube

### Step 2: Get the Embed URL
1. Go to the YouTube video page
2. Click **Share** → **Embed**
3. Copy the `src` URL from the iframe code
   - Example: `https://www.youtube.com/embed/VIDEO_ID`
   - The `VIDEO_ID` is the part after `/embed/`

### Step 3: Update the Code
In `src/pages/Tutorials.tsx`, replace the `embedUrl` values:

```typescript
embedUrl: 'https://www.youtube.com/embed/YOUR_VIDEO_ID_HERE'
```

**Example:**
- If your video URL is: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Use embed URL: `https://www.youtube.com/embed/dQw4w9WgXcQ`

---

## Option 2: Using Other Video Platforms

### Vimeo
- Get embed code from Vimeo → Share → Embed
- Use: `https://player.vimeo.com/video/VIDEO_ID`

### Self-Hosted Videos
1. Upload videos to your server or CDN
2. Use direct video URLs:
   ```typescript
   embedUrl: 'https://yourdomain.com/videos/cyber-basics.mp4'
   ```
3. Update the iframe to use `<video>` tag instead

---

## Option 3: Create Animated Videos

### Free Tools:
- **Canva**: Has animation features for educational videos
- **Powtoon**: Specifically for animated explainer videos
- **Animaker**: Free animation tool
- **Loom**: Screen recording with drawing tools

### Steps:
1. Create account on one of these platforms
2. Use templates for "Educational" or "Tutorial" videos
3. Add your cybersecurity content
4. Export and upload to YouTube
5. Get embed URL and add to code

---

## Recommended Video Topics & Length

- **Cybersecurity Basics**: 3-5 minutes
- **CTF Challenges**: 5-7 minutes  
- **Phish Hunt**: 4-6 minutes
- **Code & Secure**: 6-8 minutes
- **Quiz Lab**: 3-5 minutes

---

## Quick Fix: Use Placeholder Mode

If you don't have videos yet, I can update the code to show:
- "Video coming soon" placeholders
- Links to external resources
- Text-based tutorials instead

Let me know which option you prefer!

