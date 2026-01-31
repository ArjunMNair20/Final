# ✅ CyberSec Arena - Backend Setup Checklist

## Pre-Setup Requirements

- [ ] Windows/Mac/Linux computer
- [ ] 8GB RAM minimum
- [ ] ~10GB free disk space
- [ ] Internet connection
- [ ] Terminal/Command Prompt access

---

## Installation Steps

### Step 1: Download & Install Ollama (5 minutes)
- [ ] Visit https://ollama.ai
- [ ] Click "Download"
- [ ] Choose your OS (Windows/Mac/Linux)
- [ ] Run installer
- [ ] Restart computer (may be required)
- [ ] Open terminal/command prompt
- [ ] Type: `ollama --version` (should show version)

### Step 2: Download Mistral Model (~5 GB)
- [ ] Open terminal
- [ ] Run: `ollama pull mistral`
- [ ] Wait for download to complete (~5 minutes on fast internet)
- [ ] When done, should see: "Pulling manifest" → "Verifying digest"

### Step 3: Install Backend Dependencies (2 minutes)
- [ ] Navigate to project: `cd Cybersec-Arena`
- [ ] Go to server: `cd server`
- [ ] Run: `npm install`
- [ ] Wait for install to complete
- [ ] Should see: "added X packages"

### Step 4: Verify Frontend Build (1 minute)
- [ ] Go back to project root: `cd ..`
- [ ] Run: `npm run build`
- [ ] Should complete with "Precompression complete"

---

## Running the Application

### Quick Start (Recommended)
- [ ] Double-click `start.bat` (Windows) or `start.sh` (Mac/Linux)
- [ ] Let it open 3 terminals
- [ ] Wait 10 seconds for all to fully load
- [ ] Open browser to `http://localhost:5173`
- [ ] Test chatbot

### Manual Start (Better Control)

**Terminal 1 - Ollama:**
- [ ] Open new terminal
- [ ] Run: `ollama serve`
- [ ] Wait for: "Listening on 127.0.0.1:11434"
- [ ] Keep this open (don't close)

**Terminal 2 - Backend:**
- [ ] Open another terminal
- [ ] Navigate to project: `cd path/to/Cybersec-Arena`
- [ ] Go to server: `cd server`
- [ ] Run: `npm start`
- [ ] Should show:
  - [ ] "🤖 Chat server running on http://localhost:3001"
  - [ ] "⚠️ Make sure Ollama is running"
- [ ] Keep this open (don't close)

**Terminal 3 - Frontend:**
- [ ] Open another terminal
- [ ] Navigate to project: `cd path/to/Cybersec-Arena`
- [ ] Run: `npm run dev`
- [ ] Should show:
  - [ ] "VITE v5.x.x ready in XXX ms"
  - [ ] "➜  Local:   http://localhost:5173"
- [ ] Keep this open (don't close)

---

## Testing Setup

### Test 1: Frontend Loads
- [ ] Open browser: `http://localhost:5173`
- [ ] Should see CyberSec Arena app
- [ ] Should NOT see errors

### Test 2: Backend Running
- [ ] Open browser console (F12)
- [ ] Go to Network tab
- [ ] Type message in chatbot
- [ ] Should see POST to `http://localhost:3001/api/chat`
- [ ] Response status should be 200 (success)

### Test 3: Ollama Running
- [ ] Open terminal
- [ ] Run: `ollama list`
- [ ] Should show "mistral" model
- [ ] Should show size (~4GB)

### Test 4: Full Chat Test
- [ ] Ask chatbot: "What is SQL injection?"
- [ ] Should get detailed response (not error)
- [ ] Response should be 2-3 sentences minimum
- [ ] Should mention "SQL" or "injection" explicitly
- [ ] Should take 3-5 seconds (first response)

---

## Common Issues & Solutions

### ❌ "Ollama not found" or "command not found"
**Solution:**
- [ ] Install Ollama from https://ollama.ai
- [ ] Restart computer
- [ ] Try again

### ❌ "Cannot connect to backend"
**Solution:**
- [ ] Check Terminal 1: Ollama running? (should show "Listening")
- [ ] Check Terminal 2: Backend running? (should show "Chat server running")
- [ ] Check both are on their ports (11434 and 3001)
- [ ] Try restarting both

### ❌ "ollama: command not found"
**Solution:**
- [ ] Ollama not installed correctly
- [ ] Reinstall from https://ollama.ai
- [ ] May need to restart terminal after install

### ❌ "Out of memory" error
**Solution:**
- [ ] Close unnecessary apps
- [ ] Restart computer
- [ ] If still happens: Model is too large for your RAM
  - [ ] Use smaller model: `ollama pull orca-mini`
  - [ ] Update server to use orca-mini

### ❌ "Connection refused on port 3001"
**Solution:**
- [ ] Backend not running (check Terminal 2)
- [ ] Another app using port 3001
- [ ] Try: netstat -ano | findstr :3001 (Windows)
- [ ] Kill process using that port

### ❌ Chatbot gives error instead of answer
**Solution:**
- [ ] Check all 3 terminals are still running
- [ ] Restart all 3 terminals
- [ ] Check browser console for errors (F12)
- [ ] Check backend console for errors

### ❌ Very slow responses (> 10 seconds)
**Solution:**
- [ ] First response always slower (model loading)
- [ ] Subsequent responses should be 1-3 seconds
- [ ] If persistent: Try smaller model (orca-mini)
- [ ] If CPU-only: Responses will be slower
- [ ] GPU would make it much faster (if you have one)

---

## Verification Checklist

### ✅ All Systems Running
- [ ] Terminal 1: Shows "Listening on 127.0.0.1:11434" (Ollama)
- [ ] Terminal 2: Shows "Chat server running" (Backend)
- [ ] Terminal 3: Shows "Local: http://localhost:5173" (Frontend)

### ✅ Frontend Loads
- [ ] Browser shows CyberSec Arena interface
- [ ] Chat input box visible
- [ ] No console errors (F12)

### ✅ Backend Connected
- [ ] Network tab shows POST to /api/chat (status 200)
- [ ] No 503 or connection errors

### ✅ Ollama Available
- [ ] Ollama logs show successful generation
- [ ] Response doesn't mention Ollama errors

### ✅ Chat Works
- [ ] Can type and send message
- [ ] Get response within 5 seconds
- [ ] Response is relevant to question
- [ ] Response is longer than 50 characters

---

## Files & Structure

```
Cybersec-Arena/
├── src/
│   ├── services/
│   │   └── chatService.ts ← Calls backend API
│   └── components/
│       └── ChatBot.tsx ← UI component
│
├── server/
│   ├── chatserver.js ← EXPRESS BACKEND (NEW)
│   ├── .env ← Backend config (NEW)
│   └── package.json ← Dependencies updated
│
├── .env ← Frontend config (updated)
│
├── BACKEND_SETUP.md ← Detailed backend guide
├── AI_BACKEND_GUIDE.md ← Complete documentation
├── SETUP_SUMMARY.md ← Quick overview
├── ARCHITECTURE_DIAGRAM.txt ← This file
├── start.bat ← Auto-start (Windows)
└── start.sh ← Auto-start (Mac/Linux)
```

---

## After Setup Works

### Next Steps:
1. [ ] Ask various cybersecurity questions
2. [ ] Verify responses are intelligent
3. [ ] Test different topics (CTF, crypto, web, etc.)
4. [ ] Check latency on subsequent requests
5. [ ] Enjoy your AI-powered chatbot! 🎉

### Optional Enhancements:
- [ ] Try different models (dolphin-mixtral, neural-chat)
- [ ] Customize system prompt in chatserver.js
- [ ] Add conversation context feature
- [ ] Deploy to cloud (AWS, Heroku)
- [ ] Connect premium LLM (OpenAI, Claude)

---

## Support Resources

1. **Ollama Issues?** → https://github.com/ollama/ollama
2. **Backend Help?** → Check `BACKEND_SETUP.md`
3. **Architecture?** → Check `ARCHITECTURE_DIAGRAM.txt`
4. **Full Guide?** → Check `AI_BACKEND_GUIDE.md`

---

## Success Indicators

✅ **Chatbot is working when:**
- Frontend loads without errors
- Backend shows "Chat server running on :3001"
- Ollama shows "Listening on 127.0.0.1:11434"
- Chat messages POST successfully
- Responses are detailed (not "error" messages)
- First response takes 3-5 seconds
- Subsequent responses take 1-3 seconds

---

**You're ready to go! 🚀 Enjoy your AI-powered cybersecurity chatbot!**

---

Last Updated: January 2026
Setup Time: ~15-20 minutes (including downloads)
