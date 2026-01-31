const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Cybersecurity Knowledge Base for context
const CYBERSEC_CONTEXT = `You are an expert cybersecurity trainer for CyberSec Arena, a CTF (Capture The Flag) platform.

IMPORTANT RULES:
1. Provide CLEAR, PRACTICAL, and DETAILED answers about:
   - CTF challenges (Web, Crypto, Binary, Forensics, Linux)
   - Web security (SQL injection, XSS, CSRF)
   - Cryptography (hashing, encryption)
   - Binary analysis and reverse engineering
   - Forensics and steganography
   - Linux/Bash security
   - Network security
   - Threat modeling and risk assessment

2. When answering:
   - Be specific with examples and code
   - Explain the "why" not just "how"
   - Provide tools and techniques
   - Give step-by-step approaches
   - Include prevention/defense strategies

3. For CTF help:
   - Provide hints without spoiling
   - Explain underlying concepts
   - Suggest tools to use
   - All flags are CSA{answer} format

4. Always be helpful, educational, and encouraging.

You are helping learners become better cybersecurity professionals.`;

// Chat endpoint (provider-agnostic)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const prompt = `${CYBERSEC_CONTEXT}\n\nUser: ${message}\n\nAssistant:`;

    // Determine provider
    const provider = (process.env.AI_PROVIDER || '').toUpperCase();

    // Auto-detect: prefer Ollama if available, else Hugging Face if API key present
    let selectedProvider = provider;

    async function isOllamaAvailable() {
      try {
        const url = process.env.OLLAMA_API_URL || 'http://localhost:11434';
        await axios.get(`${url}/api/tags`, { timeout: 3000 });
        return true;
      } catch (e) {
        return false;
      }
    }

    if (!selectedProvider) {
      if (await isOllamaAvailable()) {
        selectedProvider = 'OLLAMA';
      } else if (process.env.HUGGINGFACE_API_KEY) {
        selectedProvider = 'HUGGINGFACE';
      } else {
        selectedProvider = 'NONE';
      }
    }

    if (selectedProvider === 'OLLAMA') {
      // Ollama flow
      const url = process.env.OLLAMA_API_URL || 'http://localhost:11434';
      const model = process.env.OLLAMA_MODEL || 'mistral';
      const resp = await axios.post(`${url}/api/generate`, {
        model,
        prompt,
        stream: false,
        temperature: Number(process.env.AI_TEMPERATURE || 0.7),
      }, { timeout: 30000 });

      const response = (resp.data && (resp.data.response || resp.data.text)) || JSON.stringify(resp.data);

      return res.json({ response: String(response).trim(), sessionId: sessionId || req.sessionID, provider: 'OLLAMA', model });
    }

    if (selectedProvider === 'HUGGINGFACE') {
      // Hugging Face Inference API flow
      const hfKey = process.env.HUGGINGFACE_API_KEY;
      const hfModel = process.env.HUGGINGFACE_MODEL || process.env.OLLAMA_MODEL || 'gpt2';

      if (!hfKey) {
        return res.status(503).json({ error: 'Hugging Face API key not configured (HUGGINGFACE_API_KEY)' });
      }

      const hfResp = await axios.post(
        `https://api-inference.huggingface.co/models/${hfModel}`,
        { inputs: prompt, parameters: { max_new_tokens: 512, temperature: Number(process.env.AI_TEMPERATURE || 0.7) } },
        { headers: { Authorization: `Bearer ${hfKey}` }, timeout: 60000 }
      );

      // HF returns either {generated_text} or an array; handle both
      let text = '';
      if (Array.isArray(hfResp.data)) {
        text = (hfResp.data[0] && (hfResp.data[0].generated_text || hfResp.data[0].summary_text || '')) || '';
      } else if (hfResp.data && (hfResp.data.generated_text || hfResp.data.text)) {
        text = hfResp.data.generated_text || hfResp.data.text;
      } else if (typeof hfResp.data === 'string') {
        text = hfResp.data;
      } else {
        text = JSON.stringify(hfResp.data).slice(0, 2000);
      }

      return res.json({ response: String(text).trim(), sessionId: sessionId || req.sessionID, provider: 'HUGGINGFACE', model: hfModel });
    }

    // No provider available
    return res.status(503).json({ error: 'No AI provider available. Start Ollama or set HUGGINGFACE_API_KEY.' });

  } catch (error) {
    console.error('Chat generation error:', error && error.message ? error.message : error);
    if (error.response && error.response.data) {
      console.error('Provider response error:', JSON.stringify(error.response.data).slice(0, 1000));
    }
    return res.status(500).json({ error: 'Failed to generate response', details: (error && error.message) || String(error) });
  }
});

// Provider status endpoint (Ollama and Hugging Face)
app.get('/api/provider-status', async (req, res) => {
  const status = { ollama: { available: false }, huggingface: { available: false } };

  // Check Ollama
  try {
    const url = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    const r = await axios.get(`${url}/api/tags`, { timeout: 3000 });
    status.ollama = { available: true, models: r.data.models || [] };
  } catch (e) {
    status.ollama = { available: false, message: 'Ollama not reachable' };
  }

  // Check Hugging Face
  if (process.env.HUGGINGFACE_API_KEY) {
    // We can't query HF for models without auth that lists models, but we can report presence of API key
    status.huggingface = { available: true, message: 'API Key configured' };
  } else {
    status.huggingface = { available: false };
  }

  res.json({ provider: process.env.AI_PROVIDER || 'AUTO', status });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chat server is running' });
});

app.listen(PORT, () => {
  console.log(`🤖 Chat server running on http://localhost:${PORT}`);
  console.log(`📡 Make requests to http://localhost:${PORT}/api/chat`);
  console.log(`\n⚙️ Provider configuration:`);
  console.log(` - AI_PROVIDER: ${process.env.AI_PROVIDER || 'AUTO (OLLAMA -> HUGGINGFACE)'}`);
  console.log(` - OLLAMA_API_URL: ${process.env.OLLAMA_API_URL || 'http://localhost:11434'}`);
  console.log(` - HUGGINGFACE_API_KEY: ${process.env.HUGGINGFACE_API_KEY ? '*** configured ***' : 'not set'}`);
  console.log(`\n⚠️ If using Ollama: run 'ollama serve' and download models with 'ollama pull <model>'`);
});