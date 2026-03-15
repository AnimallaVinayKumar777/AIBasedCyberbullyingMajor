#!/usr/bin/env node

/**
 * AI Model Testing Script
 *
 * Run this script to test the cyberbullying detection AI model
 *
 * Usage:
 * npm run test:ai
 * or
 * npx ts-node src/scripts/testAIModel.ts
 */

import { detectCyberbullying } from '../utils/cyberbullyingDetection';

async function main() {
  console.log('🤖 Cyberbullying Detection Test');
  console.log('=====================================\n');

  const testCases = [
    "నిన్ను చంపు", // Telugu: kill you
    "madar chod", // Hindi/Kannada
    "ninu gadha", // Kannada: you donkey
    "fuck you", // English
    "normal text",
    "pandaga", // Kannada caste slur
    "chutiya", // Hindi/Kannada slur
  ];

  try {
    for (const text of testCases) {
      console.log(`Testing: "${text}"`);
      const result = await detectCyberbullying(text);
      console.log(`Result:`, result);
      console.log('---');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as testAIModel };