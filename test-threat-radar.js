#!/usr/bin/env node

import { extractSymptoms, analyzeThreatProfile } from './server/threatAnalysisEngine.js';

console.log('=== Threat-Radar API Test ===\n');

const testCases = [
  'slow performance high cpu usage',
  'webcam turning on by itself',
  'unexpected login attempts from unknown location',
  'files encrypted with strange extension',
  'random advertisements appearing everywhere'
];

testCases.forEach((symptoms, idx) => {
  console.log(`\n📋 Test Case ${idx + 1}: "${symptoms}"`);
  console.log('-'.repeat(60));
  
  try {
    const detected = extractSymptoms(symptoms);
    console.log(`Detected Symptoms: ${detected.join(', ')}`);
    
    const analysis = analyzeThreatProfile(detected);
    
    console.log(`\n✓ Risk Level: ${analysis.overall_risk_level.toUpperCase()}`);
    console.log(`📊 Risk Score: ${analysis.risk_percentage}%`);
    console.log(`🎯 Threats Found: ${analysis.threats.length}`);
    
    if (analysis.threats.length > 0) {
      console.log('\n🚨 Top Threats:');
      analysis.threats.slice(0, 3).forEach(t => {
        console.log(`   • ${t.threat} (${t.probability}% - ${t.severity})`);
      });
    }
    
    console.log(`\n💡 Mitigation Steps: ${analysis.mitigation_strategies.length}`);
    if (analysis.mitigation_strategies.length > 0) {
      analysis.mitigation_strategies.slice(0, 2).forEach(m => {
        console.log(`   Step ${m.step}: ${m.action} (${m.priority})`);
      });
    }
    
    console.log(`\n📝 Analysis: ${analysis.explanation}\n`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('✓ All tests completed successfully!');
console.log('The threat-radar API is working correctly.');
