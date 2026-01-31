# CyberSec Arena - Backend Setup with Free LLM

This setup uses **Ollama** (free, open-source) to power the AI chatbot with proper answers.

## Quick Start (3 Steps)

### Step 1: Install & Run Ollama

1. **Download Ollama**: https://ollama.ai
2. Install it normally
3. Open a **new terminal** and run:
   ```bash
   ollama pull mistral
   ollama serve
   ```
   
   Keep this terminal open - Ollama runs in the background

### Step 2: Start the Backend Server

Open a **second terminal** in the project root and run:

```bash
cd server
npm install
npm start
```

You should see:
```
🤖 Chat server running on http://localhost:3001
📡 Make requests to http://localhost:3001/api/chat
```

### Step 3: Run the Frontend

Open a **third terminal** in the project root and run:

```bash
npm run dev
```

Now the chatbot will have real AI responses powered by Mistral (free model via Ollama)!

---

## Architecture

```
Frontend (React)
    ↓
ChatService (TypeScript)
    ↓
Express Backend (Node.js) ← API calls
    ↓
Ollama API ← Uses free Mistral model
```

## How It Works

1. **Frontend** sends user message to backend
2. **Backend** adds cybersecurity context (system prompt)
3. **Backend** calls local Ollama API
4. **Ollama** (Mistral model) generates intelligent response
5. **Response** returned to frontend

## Models You Can Use

Replace `mistral` in `server/chatserver.js` with any of these:

- `mistral` - Balanced, fast (7B) - **Recommended**
- `neural-chat` - Good for conversations
- `dolphin-mixtral` - Better at complex tasks (larger, slower)
- `llama2` - General purpose
- `orca-mini` - Lightweight option

Download new models:
```bash
ollama pull neural-chat
ollama pull dolphin-mixtral
```

Then update `server/chatserver.js` line:
```javascript
model: 'mistral', // Change this
```

## System Requirements

- **RAM**: 8GB+ (Ollama needs memory)
- **Disk**: 5-10GB for models
- **Internet**: Only for initial Ollama download

## Troubleshooting

### "Cannot connect to chat backend"

Make sure all 3 are running:
1. ✅ Ollama (terminal 1): `ollama serve`
2. ✅ Backend (terminal 2): `npm start` in `server/`
3. ✅ Frontend (terminal 3): `npm run dev`

### Ollama crashes or not found

- Make sure Ollama is installed: https://ollama.ai
- Try `ollama serve` again
- Check that model downloaded: `ollama list`

### Slow responses

- First response takes longer (model loading)
- Mistral is 7B parameters - speed depends on GPU
- For faster, use smaller models like `orca-mini`
- For better quality, use `dolphin-mixtral` (slower)

## Free vs Paid Models

✅ **This setup is completely FREE**:
- Ollama: Free, open-source
- Mistral 7B: Free model
- No API keys needed
- No rate limits

If you want cloud LLMs later, you can integrate:
- OpenAI GPT (paid)
- Hugging Face (free tier available)
- Claude (paid)
- Cohere (free tier)

## Performance Notes

- **First response**: 3-5 seconds (model loads)
- **Subsequent responses**: 2-3 seconds (depending on context length)
- **GPU**: Will use GPU if available (much faster)
- **CPU only**: Will work but slower

## Environment Variables

### Frontend (.env)
```
VITE_CHAT_SERVER_URL=http://localhost:3001
```

### Backend (server/.env)
```
PORT=3001
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```

---

## Next Steps

Once running:
1. Ask the chatbot: "How do I solve SQL injection?"
2. Ask: "What is the difference between hashing and encryption?"
3. Ask: "How do I use Ghidra?"

The responses should now be intelligent, contextual, and detailed!

Enjoy! 🚀
