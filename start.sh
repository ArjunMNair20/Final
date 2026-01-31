#!/bin/bash
# Mac/Linux Quick Start Script

echo ""
echo "============================================"
echo "CyberSec Arena - AI Backend Quick Start"
echo "============================================"
echo ""
echo "This script opens 3 terminals:"
echo "1. Ollama (AI Model Server)"
echo "2. Backend Server"
echo "3. Frontend Dev Server"
echo ""
read -p "Press Enter to continue..."
echo ""

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama not installed!"
    echo "Download from: https://ollama.ai"
    exit 1
fi

echo "✓ Ollama found"
echo ""
echo "Starting services..."
echo ""

# Terminal 1: Ollama
echo "[1/3] Starting Ollama..."
open -a Terminal <<EOF
cd "$(pwd)"
ollama pull mistral
ollama serve
EOF

sleep 2

# Terminal 2: Backend
echo "[2/3] Starting Backend Server..."
open -a Terminal <<EOF
cd "$(pwd)/server"
npm start
EOF

sleep 2

# Terminal 3: Frontend
echo "[3/3] Starting Frontend Dev Server..."
cd "$(pwd)"
npm run dev

echo ""
echo "============================================"
echo "✓ All services started!"
echo "✓ Frontend: http://localhost:5173"
echo "✓ Backend: http://localhost:3001"
echo "============================================"
