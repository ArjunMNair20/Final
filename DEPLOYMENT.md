# Deployment Guide - CyberSec Arena

This guide explains how to host your frontend and backend so the site works for all users.

Key options:
- Frontend: Vercel or Netlify (static hosting)
- Backend: Render, Fly.io, or Docker-based host (supports environment variables)
- AI Provider: Hosted (Hugging Face Inference API) or self-hosted (Ollama)

## Recommended (easy to maintain)
- Frontend → Vercel (automatic from GitHub)
- Backend → Render or Fly.io (Docker deployment)
- AI → Hugging Face Inference (set `HUGGINGFACE_API_KEY`) or keep Ollama self-hosted

## Environment variables
For backend set these in your host:
```
PORT=3001
AI_PROVIDER=AUTO
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=mistral
HUGGINGFACE_API_KEY=your_hf_key_here
HUGGINGFACE_MODEL=mistralai/mistral-7b
AI_TEMPERATURE=0.7
```

## Docker (Render/Fly.io)
- Build & push image (Render / Docker registry)
- Use `docker-compose.yml` for local testing

Local dev:
```bash
# start Hugging Face option (no model download needed locally)
HUGGINGFACE_API_KEY=xxx docker-compose up --build

# or start backend only
cd server
docker build -t cybersec-arena-backend .
docker run -p 3001:3001 -e HUGGINGFACE_API_KEY=xxx cybersec-arena-backend
```

## Frontend (Vercel)
- Set `VITE_CHAT_SERVER_URL` to your deployed backend URL
- Push to GitHub and connect Vercel; environment variables must be set in Vercel dashboard

## Notes
- Hugging Face Inference may incur costs depending on usage; start with free-tier and monitor usage.
- If you prefer no cloud provider for LLM, run Ollama on a server and set `OLLAMA_API_URL` to that server's URL.
- For production, configure request limits, authentication, and logging.

## Quick Checklist
- [ ] Choose hosting (Vercel + Render recommended)
- [ ] Create Render service and deploy Docker image
- [ ] Add environment variables in Render
- [ ] Deploy frontend to Vercel and set `VITE_CHAT_SERVER_URL`
- [ ] Test chat end-to-end
