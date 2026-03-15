import { useState, useCallback, useEffect } from 'react';
import { PredictionResult } from '@/utils/aiCyberbullyingModel';
import { CyberbullyingResult } from '@/utils/cyberbullyingDetection';

export interface AIDetectionState {
  isLoading: boolean;
  result: PredictionResult | null;
  error: string | null;
  isModelReady: boolean;
}

export interface DetectionOptions {
  enableAI?: boolean;
  enableRuleBased?: boolean;
  language?: string;
  sensitivity?: 'low' | 'medium' | 'high';
}

export const useAICyberbullyingDetection = (options: DetectionOptions = {}) => {
  const [state, setState] = useState<AIDetectionState>({
    isLoading: false,
    result: null,
    error: null,
    isModelReady: false
  });

  const {
    enableAI = true,
    enableRuleBased = true,
    language = 'en',
    sensitivity = 'medium'
  } = options;

  // Initialize AI model
  useEffect(() => {
    const initializeModel = async () => {
      try {
        // Check if model exists and load it
        const modelPath = './models/cyberbullying_model.json';

        // For now, we'll use a simplified approach
        // In a real implementation, you'd load a pre-trained model
        setState(prev => ({ ...prev, isModelReady: true }));
      } catch (error) {
        console.error('Failed to initialize AI model:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to initialize AI model',
          isModelReady: false
        }));
      }
    };

    initializeModel();
  }, []);

  const detectContent = useCallback(async (content: string): Promise<PredictionResult | null> => {
    if (!content.trim()) {
      setState(prev => ({ ...prev, result: null, error: null }));
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let aiResult: PredictionResult | null = null;
      let ruleResult: CyberbullyingResult | null = null;

      // Use AI detection if enabled and model is ready
      if (enableAI && state.isModelReady) {
        try {
          const { detectCyberbullyingAI } = await import('@/utils/aiCyberbullyingModel');
          aiResult = await detectCyberbullyingAI(content);
        } catch (error) {
          console.error('AI detection failed:', error);
        }
      }

      // Use rule-based detection if enabled
      if (enableRuleBased) {
        try {
          const { detectCyberbullying } = await import('@/utils/cyberbullyingDetection');
          ruleResult = await detectCyberbullying(content);
        } catch (error) {
          console.error('Rule-based detection failed:', error);
        }
      }

      // Combine results
      let finalResult: PredictionResult;

      if (aiResult && ruleResult) {
        // Hybrid approach: combine AI and rule-based results
        finalResult = {
          isCyberbullying: aiResult.isCyberbullying || ruleResult.isCyberbullying,
          severity: combineSeverity(aiResult.severity, ruleResult.severity),
          confidence: Math.max(aiResult.confidence, ruleResult.confidence),
          categories: [...new Set([...aiResult.categories, ...ruleResult.categories])],
          aiConfidence: aiResult.aiConfidence,
          ruleBasedScore: ruleResult.confidence,
          contextScore: aiResult.contextScore,
          sentimentScore: aiResult.sentimentScore
        };
      } else if (aiResult) {
        finalResult = aiResult;
      } else if (ruleResult) {
        finalResult = {
          isCyberbullying: ruleResult.isCyberbullying,
          severity: ruleResult.severity,
          confidence: ruleResult.confidence,
          categories: ruleResult.categories,
          aiConfidence: 0,
          ruleBasedScore: ruleResult.confidence,
          contextScore: 0.5,
          sentimentScore: 0.5
        };
      } else {
        throw new Error('No detection methods available');
      }

      // Apply sensitivity adjustment
      finalResult = applySensitivityAdjustment(finalResult, sensitivity);

      setState(prev => ({
        ...prev,
        isLoading: false,
        result: finalResult,
        error: null
      }));

      return finalResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Detection failed';

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        result: null
      }));

      return null;
    }
  }, [enableAI, enableRuleBased, state.isModelReady, sensitivity]);

  const clearResult = useCallback(() => {
    setState(prev => ({
      ...prev,
      result: null,
      error: null
    }));
  }, []);

  const retrainWithFeedback = useCallback(async (
    content: string,
    userFeedback: { wasCorrect: boolean; actualSeverity?: 'none' | 'low' | 'medium' | 'high' }
  ) => {
    if (!enableAI || !state.isModelReady) return;

    try {
      // This would integrate with the real-time learning system
      console.log('Learning from feedback:', { content, userFeedback });

      // For now, just log the feedback
      // In a real implementation, this would update the model
    } catch (error) {
      console.error('Failed to learn from feedback:', error);
    }
  }, [enableAI, state.isModelReady]);

  return {
    ...state,
    detectContent,
    clearResult,
    retrainWithFeedback,
    isDetectionEnabled: enableAI || enableRuleBased
  };
};

// Helper functions
function combineSeverity(aiSeverity: string, ruleSeverity: string): 'low' | 'medium' | 'high' | 'none' {
  const severityLevels = { none: 0, low: 1, medium: 2, high: 3 };

  const aiLevel = severityLevels[aiSeverity as keyof typeof severityLevels] || 0;
  const ruleLevel = severityLevels[ruleSeverity as keyof typeof severityLevels] || 0;

  const combinedLevel = Math.max(aiLevel, ruleLevel);
  const severityMap = ['none', 'low', 'medium', 'high'];

  return severityMap[combinedLevel] as 'low' | 'medium' | 'high' | 'none';
}

function applySensitivityAdjustment(
  result: PredictionResult,
  sensitivity: 'low' | 'medium' | 'high'
): PredictionResult {
  const adjustments = {
    low: { threshold: 0.8, multiplier: 0.8 },
    medium: { threshold: 0.6, multiplier: 1.0 },
    high: { threshold: 0.4, multiplier: 1.2 }
  };

  const adjustment = adjustments[sensitivity];
  let adjustedConfidence = result.confidence * adjustment.multiplier;

  // Apply threshold
  if (adjustedConfidence < adjustment.threshold) {
    adjustedConfidence = 0;
  }

  // Adjust severity based on sensitivity
  let adjustedSeverity = result.severity;
  if (sensitivity === 'high' && result.severity === 'low') {
    adjustedSeverity = 'medium';
  } else if (sensitivity === 'low' && result.severity === 'medium') {
    adjustedSeverity = 'low';
  }

  return {
    ...result,
    confidence: Math.min(adjustedConfidence, 1.0),
    severity: adjustedSeverity,
    isCyberbullying: adjustedConfidence > 0.5
  };
}

// Hook for real-time content monitoring
export const useRealTimeDetection = (
  content: string,
  options: DetectionOptions = {}
) => {
  const detection = useAICyberbullyingDetection(options);

  useEffect(() => {
    if (content && content.length > 10) {
      const debounceTimer = setTimeout(() => {
        detection.detectContent(content);
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(debounceTimer);
    }
  }, [content, detection.detectContent]);

  return detection;
};

// Hook for batch content analysis
export const useBatchDetection = () => {
  const [results, setResults] = useState<Map<string, PredictionResult>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);

  const detection = useAICyberbullyingDetection();

  const analyzeBatch = useCallback(async (contents: Array<{ id: string; content: string }>) => {
    setIsProcessing(true);

    try {
      const newResults = new Map(results);

      for (const item of contents) {
        const result = await detection.detectContent(item.content);
        if (result) {
          newResults.set(item.id, result);
        }
      }

      setResults(newResults);
    } catch (error) {
      console.error('Batch analysis failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [detection.detectContent, results]);

  const clearResults = useCallback(() => {
    setResults(new Map());
  }, []);

  const getResult = useCallback((id: string) => {
    return results.get(id) || null;
  }, [results]);

  return {
    results,
    isProcessing,
    analyzeBatch,
    clearResults,
    getResult,
    isModelReady: detection.isModelReady
  };
};
