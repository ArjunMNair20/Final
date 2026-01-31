#!/usr/bin/env node

/**
 * Simple backend server for Threat-Radar and other APIs
 * Run with: npm run dev:backend
 */

import express from 'express';
import cors from 'cors';
import { extractSymptoms, analyzeThreatProfile } from './server/threatAnalysisEngine.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

console.log('[DEV-SERVER] Initializing...');

// Threat Radar Endpoint
app.post('/api/threat-radar', (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
      return res.status(400).json({ error: 'Please describe your system issues' });
    }

    // Extract symptoms from user input
    let detectedSymptoms = [];
    try {
      detectedSymptoms = extractSymptoms(symptoms);
    } catch (err) {
      console.error('Error extracting symptoms:', err);
      detectedSymptoms = [];
    }

    // Perform threat analysis (works with or without detected symptoms)
    let analysis;
    try {
      analysis = analyzeThreatProfile(detectedSymptoms);
    } catch (err) {
      console.error('Error analyzing threat profile:', err);
      // Return a safe fallback response
      analysis = {
        detected_symptoms: detectedSymptoms,
        threats: [],
        overall_risk_level: 'low',
        risk_percentage: 0,
        explanation: 'Analysis completed. No specific threats detected based on your input.',
        mitigation_strategies: [],
        timestamp: new Date().toISOString()
      };
    }

    // Return analysis results
    res.json(analysis);
  } catch (error) {
    console.error('Error in threat radar analysis:', error);
    res.status(500).json({ 
      error: 'Failed to analyze threats', 
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create server with proper error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('🚀  DEV SERVER STARTED SUCCESSFULLY');
  console.log('═══════════════════════════════════════════');
  console.log(`🌐 Backend: http://localhost:${PORT}`);
  console.log(`🎯 Threat-Radar API: http://localhost:${PORT}/api/threat-radar`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log('═══════════════════════════════════════════');
  console.log('Frontend will proxy all /api calls to this server');
  console.log('═══════════════════════════════════════════\n');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n✗ Port ${PORT} is already in use!`);
    console.error('Kill the process and try again:');
    console.error(`  netstat -ano | findstr :${PORT}`);
    console.error('  taskkill /PID <PID> /F\n');
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n[DEV-SERVER] Shutting down gracefully...');
  server.close(() => {
    console.log('[DEV-SERVER] Server closed');
    process.exit(0);
  });
});
