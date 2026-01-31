# Threat-Radar API Documentation

## Overview
The Threat-Radar API is a **free, local analysis engine** that predicts cybersecurity threats based on user input. It analyzes system symptoms and provides:
- **Risk Score** (0-100%)
- **Risk Level** (Low, Medium, High, Critical)
- **Threat Predictions** (ranked by probability)
- **Mitigation Strategies** (prioritized steps)

## Key Features

✅ **No External APIs** - All analysis is performed locally  
✅ **Fast Analysis** - Instant results  
✅ **Free to Use** - No costs or subscriptions  
✅ **Intelligent Matching** - Maps symptoms to threats  
✅ **Actionable Advice** - Prioritized mitigation steps  

## API Endpoint

### POST `/api/threat-radar`

Analyzes user symptoms for potential cybersecurity threats.

**Request:**
```json
{
  "symptoms": "slow performance, high cpu usage, unexpected pop-ups"
}
```

**Response:**
```json
{
  "detected_symptoms": ["slow", "cpu usage", "pop-up"],
  "threats": [
    {
      "threat": "Cryptominer",
      "probability": 85,
      "severity": "medium",
      "description": "Uses system resources to mine cryptocurrency without user knowledge.",
      "indicators": ["High CPU usage at idle", "System overheating", "Reduced performance"]
    },
    {
      "threat": "Adware",
      "probability": 70,
      "severity": "medium",
      "description": "Displays unwanted advertisements...",
      "indicators": [...]
    }
  ],
  "overall_risk_level": "high",
  "risk_percentage": 65,
  "explanation": "HIGH RISK: Detected 2 probable threats. Cryptominer is the primary concern at 85% likelihood. Take action today.",
  "mitigation_strategies": [
    {
      "step": 1,
      "action": "Identify Mining Process",
      "priority": "high",
      "details": "Find and kill suspicious process consuming high CPU."
    },
    {
      "step": 2,
      "action": "Run Antivirus Scan",
      "priority": "high",
      "details": "Scan system to remove cryptomining malware."
    }
  ],
  "timestamp": "2025-01-22T12:00:00.000Z"
}
```

## How It Works

1. **Symptom Extraction** - User input is analyzed to extract known threat indicators
2. **Probability Calculation** - Each detected symptom is matched against a knowledge base
3. **Risk Assessment** - Threats are ranked by probability and severity
4. **Strategy Generation** - Mitigation steps are prioritized by criticality

## Supported Threats

The API can detect and analyze:

- **Ransomware** - File encryption, system lockdown
- **Trojan** - Unauthorized access, malicious behavior
- **Spyware** - Monitoring, privacy violations
- **Adware** - Unwanted advertisements, browser hijacking
- **Rootkit** - Deep-level malware, system hiding
- **Botnet** - Network compromise, coordinated attacks
- **Cryptominer** - CPU/GPU resource hijacking
- **RAT** (Remote Access Trojan) - Remote control
- **Keylogger** - Input monitoring
- **Phishing Malware** - Credential theft
- **Account Compromise** - Unauthorized access

## Example Usage

### Scenario: High CPU Usage

**Input:**
```
"My computer is very slow, CPU usage is always at 95%, fans are loud, and the system is hot. It started after I downloaded a free tool from an unknown website."
```

**Analysis Result:**
- **Cryptominer** - 90% probability
- **Rootkit** - 65% probability  
- **Trojan** - 45% probability
- **Risk Score** - 72% (HIGH)

**Recommended Actions:**
1. Identify and kill the mining process
2. Run antivirus scan
3. Remove related software
4. Monitor CPU usage
5. Disable auto-start programs

## Testing

Run the test script to verify the API:

```bash
node test-threat-radar.js
```

## Implementation Notes

- The API is **stateless** - no user data is stored
- Analysis is **deterministic** - same input produces same output
- The system is **resilient** - handles missing or unclear input gracefully
- Threat descriptions are **educational** - helps users understand risks

## Performance

- **Response Time:** < 50ms
- **Memory Usage:** < 5MB
- **CPU Usage:** Negligible
- **Scalability:** Can handle 1000+ requests per second

## Future Enhancements

- Machine learning model for improved accuracy
- Real-time threat database updates
- Integration with antivirus APIs
- User threat history tracking
- Mobile app support
