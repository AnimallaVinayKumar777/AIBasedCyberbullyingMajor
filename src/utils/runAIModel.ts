// AI Model Runner - Complete guide and utilities for running the cyberbullying detection AI

import { AICyberbullyingModel } from './aiCyberbullyingModel';
import { AIModelTrainer } from './aiModelTrainer';
import { detectCyberbullyingAI } from './aiCyberbullyingModel';
import { createAndTrainModel } from './aiModelTrainer';

// ==================== TRAINING THE MODEL ====================

/**
 * STEP 1: Train a new AI model from scratch
 */
export async function trainNewAIModel(): Promise<AICyberbullyingModel> {
  console.log('🏋️ Starting AI model training...');

  const trainer = new AIModelTrainer();

  // Load pre-built dataset (includes English, Hindi, Telugu examples)
  trainer.loadPrebuiltDataset();

  // Train the model
  await trainer.trainModel();

  // Save the trained model
  trainer.saveTrainedModel('./models/cyberbullying_model.json');

  console.log('✅ Model training completed and saved!');
  return trainer['model'];
}

/**
 * STEP 2: Load a pre-trained model
 */
export function loadTrainedModel(modelPath: string = './models/cyberbullying_model.json'): AICyberbullyingModel {
  const trainer = new AIModelTrainer();
  trainer.loadTrainedModel(modelPath);

  console.log('📂 Pre-trained model loaded successfully');
  return trainer['model'];
}

// ==================== USING THE MODEL ====================

/**
 * Quick detection function - easiest way to use the AI
 */
export async function quickAIDetection(text: string): Promise<any> {
  try {
    const result = await detectCyberbullyingAI(text);
    return {
      success: true,
      result,
      summary: `Detected: ${result.isCyberbullying ? 'YES' : 'NO'} (${result.severity} severity, ${(result.confidence * 100).toFixed(1)}% confidence)`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      fallback: 'Using rule-based detection only'
    };
  }
}

/**
 * Advanced detection with all features
 */
export async function advancedAIDetection(text: string): Promise<any> {
  try {
    // Try AI detection
    const aiResult = await detectCyberbullyingAI(text);

    // Also run rule-based for comparison
    const { detectCyberbullying } = await import('./cyberbullyingDetection');
    const ruleResult = await detectCyberbullying(text);

    return {
      success: true,
      aiResult,
      ruleResult,
      recommendation: getModerationRecommendation(aiResult, ruleResult),
      explanation: generateExplanation(aiResult, ruleResult)
    };
  } catch (error) {
    console.error('AI detection failed:', error);

    // Fallback to rule-based only
    const { detectCyberbullying } = await import('./cyberbullyingDetection');
    const ruleResult = await detectCyberbullying(text);

    return {
      success: false,
      error: 'AI model not available',
      ruleResult,
      recommendation: getModerationRecommendation(null, ruleResult)
    };
  }
}

// ==================== TESTING THE MODEL ====================

/**
 * Test the model with sample texts
 */
export async function testAIModel(): Promise<void> {
  console.log('🧪 Testing AI Cyberbullying Detection Model...\n');

  const testCases = [
    // Safe content
    { text: "Great job on your presentation today!", expected: "none" },
    { text: "Thanks for helping me with homework", expected: "none" },
    { text: "बहुत अच्छा काम किया", expected: "none" }, // Hindi: Great job

    // Low severity
    { text: "That was a silly thing to say", expected: "low" },
    { text: "ये गलत बात है", expected: "low" }, // Hindi: This is wrong

    // Medium severity
    { text: "You're so stupid and annoying", expected: "medium" },
    { text: "Everyone thinks you're pathetic", expected: "medium" },
    { text: "तू है बकवास और फालतू", expected: "medium" }, // Hindi: You're useless

    // High severity
    { text: "You should just kill yourself", expected: "high" },
    { text: "I hate you, you disgusting freak", expected: "high" },
    { text: "तू है एक गधा और निकम्मा इंसान, मर जा", expected: "high" }, // Hindi: You're useless, die
    { text: "नुव्वु पिचि कोदुकु, चंपेस्तानु", expected: "high" }, // Telugu: You're crazy, I'll kill you
  ];

  for (const testCase of testCases) {
    const result = await quickAIDetection(testCase.text);

    const status = result.success ?
      (result.result.severity === testCase.expected ? '✅' : '❌') :
      '⚠️';

    console.log(`${status} "${testCase.text}"`);
    console.log(`   Expected: ${testCase.expected}, Got: ${result.result?.severity || 'ERROR'}`);
    console.log(`   Confidence: ${(result.result?.confidence * 100 || 0).toFixed(1)}%`);
    console.log('');
  }
}

// ==================== INTEGRATION EXAMPLES ====================

/**
 * Example: Use in a React component
 */
export const reactIntegrationExample = `
import { useAICyberbullyingDetection } from '@/hooks/useAICyberbullyingDetection';

function MyComponent() {
  const detection = useAICyberbullyingDetection({
    enableAI: true,
    enableRuleBased: true,
    sensitivity: 'medium'
  });

  const handleTextChange = async (text: string) => {
    if (text.length > 10) {
      await detection.detectContent(text);
    }
  };

  return (
    <div>
      <textarea onChange={(e) => handleTextChange(e.target.value)} />
      {detection.result && (
        <div>
          Status: {detection.result.isCyberbullying ? 'UNSAFE' : 'SAFE'}
          Severity: {detection.result.severity}
          Confidence: {(detection.result.confidence * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );
}
`;

/**
 * Example: Use in moderation system
 */
export const moderationIntegrationExample = `
import { advancedAIDetection } from '@/utils/runAIModel';

async function moderateContent(content: string, userId: string) {
  const analysis = await advancedAIDetection(content);

  if (analysis.success && analysis.aiResult.isCyberbullying) {
    // Hide content immediately for high severity
    if (analysis.aiResult.severity === 'high') {
      await hideContent(content, userId, 'automatic_ai_detection');
      return { action: 'hidden', reason: 'High severity cyberbullying detected' };
    }

    // Flag for review for medium severity
    if (analysis.aiResult.severity === 'medium') {
      await flagForReview(content, userId, 'ai_moderation_review');
      return { action: 'flagged', reason: 'Medium severity content flagged for review' };
    }
  }

  return { action: 'approved', reason: 'Content passed AI moderation' };
}
`;

// ==================== UTILITY FUNCTIONS ====================

function getModerationRecommendation(aiResult: any, ruleResult: any): string {
  if (!aiResult) {
    return ruleResult.severity === 'high' ? 'HIDE_CONTENT' :
           ruleResult.severity === 'medium' ? 'FLAG_FOR_REVIEW' : 'ALLOW_CONTENT';
  }

  const confidence = Math.max(aiResult.confidence, ruleResult.confidence);
  const severity = aiResult.severity;

  if (severity === 'high' || confidence > 0.9) {
    return 'HIDE_CONTENT';
  } else if (severity === 'medium' || confidence > 0.7) {
    return 'FLAG_FOR_REVIEW';
  }

  return 'ALLOW_CONTENT';
}

function generateExplanation(aiResult: any, ruleResult: any): string {
  if (!aiResult) {
    return `Rule-based detection found ${ruleResult.categories.join(', ')} with ${Math.round(ruleResult.confidence * 100)}% confidence`;
  }

  const explanations = [];
  explanations.push(`AI analysis: ${Math.round(aiResult.confidence * 100)}% confidence`);
  explanations.push(`Rule-based: ${Math.round(ruleResult.confidence * 100)}% confidence`);

  if (aiResult.categories.length > 0) {
    explanations.push(`Categories: ${aiResult.categories.join(', ')}`);
  }

  return explanations.join(' | ');
}

// ==================== RUNNER SCRIPT ====================

/**
 * Main function to run everything
 */
export async function runAIModelDemo(): Promise<void> {
  console.log('🚀 AI Cyberbullying Detection Model Demo');
  console.log('========================================\n');

  try {
    // Option 1: Test with pre-trained model (if available)
    console.log('📋 Testing with sample content...\n');
    await testAIModel();

    // Option 2: Train new model (uncomment to use)
    /*
    console.log('🏋️ Training new model...\n');
    const trainedModel = await createAndTrainModel();
    console.log('✅ Training completed!\n');

    console.log('🧪 Testing newly trained model...\n');
    await testAIModel();
    */

  } catch (error) {
    console.error('❌ Demo failed:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure all dependencies are installed');
    console.log('2. Check if model files exist in ./models/ directory');
    console.log('3. Try running: npm install react-i18next i18next');
  }
}

// Auto-run demo if this file is executed directly
if (require.main === module) {
  runAIModelDemo().catch(console.error);
}
