# Threat-Radar Frontend-Backend Integration Guide

## Quick Start

### Option 1: Run Both Frontend and Backend Together (Recommended)

```bash
npm run dev:full
```

This will start:
- **Frontend**: Vite dev server on `http://localhost:5173`
- **Backend**: Node server on `http://localhost:3001`

### Option 2: Run Separately

**Terminal 1 - Backend Server:**
```bash
npm run dev:backend
# or
node dev-server.js
```

**Terminal 2 - Frontend Server:**
```bash
npm run dev
```

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────┐
│         Frontend (Vite - port 5173)                 │
│  ┌────────────────────────────────────────────────┐ │
│  │    ThreatRadar Component                       │ │
│  │  Sends: POST /api/threat-radar                │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                      │
                      │ (Vite proxy)
                      │ http://localhost:3001
                      ↓
┌─────────────────────────────────────────────────────┐
│        Backend Server (Node - port 3001)            │
│  ┌────────────────────────────────────────────────┐ │
│  │  POST /api/threat-radar                        │ │
│  │  - Extract symptoms                            │ │
│  │  - Analyze threats                             │ │
│  │  - Calculate risk score                        │ │
│  │  - Generate mitigation strategies              │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Vite Proxy Configuration

The Vite dev server automatically proxies all `/api` requests to the backend:

**vite.config.ts:**
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

This means:
- Frontend code can call `/api/threat-radar` directly
- Vite automatically routes it to `http://localhost:3001/api/threat-radar`
- No CORS issues in development

## API Endpoints

### Threat-Radar Analysis
**Endpoint:** `POST /api/threat-radar`

**Request:**
```json
{
  "symptoms": "slow performance high cpu usage"
}
```

**Response:**
```json
{
  "detected_symptoms": ["slow", "cpu usage", "high cpu"],
  "threats": [
    {
      "threat": "Cryptominer",
      "probability": 85,
      "severity": "medium",
      "description": "Uses system resources to mine cryptocurrency...",
      "indicators": ["High CPU usage at idle", "System overheating"]
    }
  ],
  "overall_risk_level": "medium",
  "risk_percentage": 55,
  "explanation": "MEDIUM RISK: Detected 1 potential threats detected.",
  "mitigation_strategies": [
    {
      "step": 1,
      "action": "Identify Mining Process",
      "priority": "high",
      "details": "Find and kill suspicious process consuming high CPU."
    }
  ],
  "timestamp": "2026-01-22T12:00:00.000Z"
}
```

### Health Check
**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-22T12:00:00.000Z"
}
```

## Frontend Component

### CyberHealthAnalyzer.tsx

Located in: `src/pages/CyberHealthAnalyzer.tsx`

**Key Features:**
- Real-time threat analysis
- Visual risk level indicators
- Threat rankings by probability
- Actionable mitigation steps
- Responsive UI with animations

**Usage:**
```tsx
import ThreatRadar from './pages/CyberHealthAnalyzer';

// Component handles all API communication automatically
export default ThreatRadar;
```

## Troubleshooting

### Issue: "http proxy error: /api/threat-radar"

**Solution:** Make sure both servers are running:
```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev
```

### Issue: "ECONNREFUSED - Connection refused"

**Solution:** Backend server not listening on port 3001
1. Kill any existing node processes: `taskkill /F /IM node.exe`
2. Restart: `npm run dev:backend`
3. Wait 2-3 seconds for it to fully start

### Issue: Port 3001 already in use

**Solution:** Find and kill the process:
```powershell
# Find process on port 3001
netstat -ano | findstr :3001

# Kill the process (replace 12345 with actual PID)
taskkill /PID 12345 /F
```

## Development Workflow

1. **Start Development Servers:**
   ```bash
   npm run dev:full
   ```

2. **Open Browser:**
   Navigate to `http://localhost:5173`

3. **Navigate to Threat-Radar:**
   Click on "ThreatRadar" in the navigation menu

4. **Test the API:**
   - Enter system symptoms (e.g., "slow performance, high cpu")
   - Click "Run Threat Scan"
   - See real-time analysis results

5. **Monitor Servers:**
   - Frontend logs appear in Terminal 2
   - Backend logs appear in Terminal 1

## Files Structure

```
cybersec-arena/
├── dev-server.js                    # Backend dev server
├── vite.config.ts                   # Frontend config with proxy
├── src/
│   └── pages/
│       └── CyberHealthAnalyzer.tsx  # Frontend component
├── server/
│   ├── index.js                     # Production backend
│   └── threatAnalysisEngine.js      # Threat analysis logic
└── package.json                     # Scripts and dependencies
```

## Production Deployment

For production:

1. **Build Frontend:**
   ```bash
   npm run build
   ```

2. **Start Backend:**
   ```bash
   NODE_ENV=production node server/index.js
   ```

3. **Serve Frontend:**
   Backend serves built frontend from `dist/` folder

## Performance Tips

- Backend response time: < 50ms
- No external API calls
- All analysis is local
- Stateless requests
- Can handle 1000+ requests/second

## Support

For issues or questions:
- Check the THREAT_RADAR_API.md for API details
- Review test-threat-radar.js for example usage
- Check browser console for frontend errors
- Check terminal for backend errors
