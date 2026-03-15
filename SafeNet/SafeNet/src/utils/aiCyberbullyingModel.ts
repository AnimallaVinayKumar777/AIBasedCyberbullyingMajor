export interface AIModelConfig {
  hiddenLayers: number[];
  learningRate: number;
  epochs: number;
  batchSize: number;
  dropoutRate: number;
  activationFunction: 'relu' | 'sigmoid' | 'tanh';
}

export interface TrainingData {
  input: number[][];
  output: number[][];
  metadata?: {
    text: string;
    language: string;
    severity: string;
  }[];
}

export interface ModelWeights {
  inputWeights: number[][];
  hiddenWeights: number[][][];
  outputWeights: number[][];
  biases: number[][];
}

export interface PredictionResult {
  isCyberbullying: boolean;
  severity: 'low' | 'medium' | 'high' | 'none';
  confidence: number;
  categories: string[];
  aiConfidence: number;
  ruleBasedScore: number;
  contextScore: number;
  sentimentScore: number;
}

export class AICyberbullyingModel {
  private config: AIModelConfig;
  private weights: ModelWeights;
  private vocabulary: Map<string, number>;
  private isInitialized: boolean = false;
  private trainingHistory: Array<{ epoch: number; loss: number; accuracy: number }> = [];

  constructor(config: AIModelConfig) {
    this.config = config;
    this.vocabulary = new Map();
    this.initializeWeights();
  }

  private initializeWeights(): void {
    const inputSize = 1000; // Vocabulary size
    const outputSize = 4; // none, low, medium, high

    // Initialize input to hidden weights
    this.weights = {
      inputWeights: this.createMatrix(inputSize, this.config.hiddenLayers[0]),
      hiddenWeights: [],
      outputWeights: this.createMatrix(this.config.hiddenLayers[this.config.hiddenLayers.length - 1], outputSize),
      biases: []
    };

    // Initialize hidden layer weights
    for (let i = 0; i < this.config.hiddenLayers.length - 1; i++) {
      this.weights.hiddenWeights.push(
        this.createMatrix(this.config.hiddenLayers[i], this.config.hiddenLayers[i + 1])
      );
      this.weights.biases.push(this.createArray(this.config.hiddenLayers[i + 1]));
    }

    this.weights.biases.push(this.createArray(outputSize));
  }

  private createMatrix(rows: number, cols: number): number[][] {
    return Array(rows).fill(0).map(() => Array(cols).fill(0).map(() => Math.random() - 0.5));
  }

  private createArray(size: number): number[] {
    return Array(size).fill(0).map(() => Math.random() - 0.5);
  }

  private activation(x: number, func: string): number {
    switch (func) {
      case 'relu': return Math.max(0, x);
      case 'sigmoid': return 1 / (1 + Math.exp(-x));
      case 'tanh': return Math.tanh(x);
      default: return x;
    }
  }

  private activationDerivative(x: number, func: string): number {
    switch (func) {
      case 'relu': return x > 0 ? 1 : 0;
      case 'sigmoid': return x * (1 - x);
      case 'tanh': return 1 - x * x;
      default: return 1;
    }
  }

  private textToVector(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/);
    const vector = Array(1000).fill(0);

    words.forEach(word => {
      const index = this.vocabulary.get(word) || Math.floor(Math.random() * 1000);
      vector[index] = 1;
    });

    return vector;
  }

  private forwardPropagation(input: number[]): number[] {
    let current = input;

    // Input to first hidden layer
    current = this.matrixMultiply(current, this.weights.inputWeights);
    current = current.map((val, i) => val + this.weights.biases[0][i]);
    current = current.map(val => this.activation(val, this.config.activationFunction));

    // Hidden layers
    for (let i = 0; i < this.weights.hiddenWeights.length; i++) {
      current = this.matrixMultiply(current, this.weights.hiddenWeights[i]);
      current = current.map((val, j) => val + this.weights.biases[i + 1][j]);
      current = current.map(val => this.activation(val, this.config.activationFunction));
    }

    // Output layer
    current = this.matrixMultiply(current, this.weights.outputWeights);
    current = current.map((val, i) => val + this.weights.biases[this.weights.biases.length - 1][i]);

    // Softmax for probabilities
    const max = Math.max(...current);
    const exp = current.map(x => Math.exp(x - max));
    const sum = exp.reduce((a, b) => a + b, 0);

    return exp.map(x => x / sum);
  }

  private matrixMultiply(vector: number[], matrix: number[][]): number[] {
    return matrix[0].map((_, col) =>
      vector.reduce((sum, val, row) => sum + val * matrix[row][col], 0)
    );
  }

  async train(trainingData: TrainingData): Promise<void> {
    console.log('🚀 Starting AI model training...');

    for (let epoch = 0; epoch < this.config.epochs; epoch++) {
      let totalLoss = 0;
      let correct = 0;

      for (let i = 0; i < trainingData.input.length; i += this.config.batchSize) {
        const batchInput = trainingData.input.slice(i, i + this.config.batchSize);
        const batchOutput = trainingData.output.slice(i, i + this.config.batchSize);

        for (let j = 0; j < batchInput.length; j++) {
          const prediction = this.forwardPropagation(batchInput[j]);
          const target = batchOutput[j];

          // Calculate loss (cross-entropy)
          const loss = target.reduce((sum, val, k) =>
            sum - val * Math.log(prediction[k] + 1e-10), 0
          );
          totalLoss += loss;

          // Check accuracy
          const predClass = prediction.indexOf(Math.max(...prediction));
          const trueClass = target.indexOf(Math.max(...target));
          if (predClass === trueClass) correct++;

          // Backpropagation (simplified)
          this.updateWeights(batchInput[j], prediction, target);
        }
      }

      const accuracy = correct / trainingData.input.length;
      const avgLoss = totalLoss / trainingData.input.length;

      this.trainingHistory.push({ epoch: epoch + 1, loss: avgLoss, accuracy });

      if ((epoch + 1) % 10 === 0) {
        console.log(`📊 Epoch ${epoch + 1}/${this.config.epochs} - Loss: ${avgLoss.toFixed(4)}, Accuracy: ${accuracy.toFixed(4)}`);
      }
    }

    this.isInitialized = true;
    console.log('✅ AI model training completed!');
  }

  private updateWeights(input: number[], prediction: number[], target: number[]): void {
    // Simplified gradient descent
    const learningRate = this.config.learningRate;

    for (let i = 0; i < prediction.length; i++) {
      const error = prediction[i] - target[i];

      // Update output layer weights (simplified)
      for (let j = 0; j < this.weights.outputWeights[0].length; j++) {
        this.weights.outputWeights[j][i] -= learningRate * error * input[j];
      }
    }
  }

  predict(text: string): PredictionResult {
    if (!this.isInitialized) {
      throw new Error('Model must be trained before making predictions');
    }

    const inputVector = this.textToVector(text);
    const probabilities = this.forwardPropagation(inputVector);

    // Convert probabilities to severity levels
    const severityMap = ['none', 'low', 'medium', 'high'];
    const maxIndex = probabilities.indexOf(Math.max(...probabilities));
    const severity = severityMap[maxIndex] as 'low' | 'medium' | 'high' | 'none';

    // Calculate AI confidence
    const aiConfidence = probabilities[maxIndex];

    // Get context and sentiment scores
    const contextScore = this.calculateContextScore(text);
    const sentimentScore = this.calculateSentimentScore(text);

    // Combine with rule-based detection for hybrid approach
    const ruleBasedScore = this.calculateRuleBasedScore(text);

    // Final confidence combines multiple factors
    const finalConfidence = (aiConfidence * 0.5) + (ruleBasedScore * 0.3) + (contextScore * 0.2);

    return {
      isCyberbullying: severity !== 'none',
      severity,
      confidence: Math.min(finalConfidence, 1.0),
      categories: this.extractCategories(text),
      aiConfidence,
      ruleBasedScore,
      contextScore,
      sentimentScore
    };
  }

  private calculateContextScore(text: string): number {
    let score = 0.5; // Neutral baseline

    // Check for context indicators
    const bullyingContexts = [
      'school', 'online', 'social media', 'comment', 'post',
      'bully', 'harass', 'threat', 'attack', 'hate'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const contextMatches = words.filter(word => bullyingContexts.includes(word)).length;

    score += contextMatches * 0.1;
    return Math.min(score, 1.0);
  }

  private calculateSentimentScore(text: string): number {
    const positiveWords = ['good', 'great', 'awesome', 'love', 'like', 'happy', 'excellent'];
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'horrible', 'worst', 'stupid'];

    const words = text.toLowerCase().split(/\s+/);
    let sentimentScore = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) sentimentScore += 0.1;
      if (negativeWords.includes(word)) sentimentScore -= 0.1;
    });

    return Math.max(0, Math.min(1, sentimentScore + 0.5));
  }

  private calculateRuleBasedScore(text: string): number {
    try {
      const detector = new (require('./cyberbullyingDetection').CyberbullyingDetector)();
      const result = detector.analyzeContentSync(text);
      const severityScores = { none: 0, low: 0.3, medium: 0.7, high: 1.0 };
      return severityScores[result.severity] * result.confidence;
    } catch (error) {
      console.warn('Rule-based score unavailable, using neutral baseline:', error);
      return 0.5;
    }
  }

  private extractCategories(text: string): string[] {
    const categories: string[] = [];
    const lowerText = text.toLowerCase();

    if (/\b(kill|murder|die|death|harm)\b/.test(lowerText)) categories.push('threats');
    if (/\b(stupid|idiot|fool|dumb)\b/.test(lowerText)) categories.push('insults');
    if (/\b(hate|despise|loathe)\b/.test(lowerText)) categories.push('hate_speech');
    if (/\b(terrorist|extremist|radical)\b/.test(lowerText)) categories.push('extremism');

    return categories;
  }

  saveModel(_filePath: string): void {
    // File-based persistence not available in browser environments
    // For browser use, consider using IndexedDB for model persistence
    console.warn('Model persistence via file system is not available in browser environments');
  }

  loadModel(_filePath: string): void {
    // File-based persistence not available in browser environments
    // For browser use, consider using IndexedDB for model persistence
    console.warn('Model loading via file system is not available in browser environments');
  }

  getTrainingHistory(): Array<{ epoch: number; loss: number; accuracy: number }> {
    return [...this.trainingHistory];
  }

  isModelReady(): boolean {
    return this.isInitialized;
  }
}

// Factory function for easy model creation
export function createCyberbullyingAIModel(): AICyberbullyingModel {
  const config: AIModelConfig = {
    hiddenLayers: [128, 64, 32],
    learningRate: 0.001,
    epochs: 100,
    batchSize: 32,
    dropoutRate: 0.2,
    activationFunction: 'relu'
  };

  return new AICyberbullyingModel(config);
}

// Enhanced detection function combining AI and rule-based approaches
export async function detectCyberbullyingAI(text: string): Promise<PredictionResult> {
  console.log(`🤖 AI analyzing: "${text}"`);

  const aiModel = createCyberbullyingAIModel();

  // Check if model is trained
  if (!aiModel.isModelReady()) {
    console.log('⚠️ AI model not trained, using rule-based detection only');
    return await detectCyberbullyingFallback(text);
  }

  try {
    const result = aiModel.predict(text);
    console.log(`🎯 AI Detection result:`, result);
    return result;
  } catch (error) {
    console.error('❌ AI detection failed, falling back to rule-based:', error);
    return await detectCyberbullyingFallback(text);
  }
}

// Fallback function using the original rule-based detection
async function detectCyberbullyingFallback(text: string): Promise<PredictionResult> {
  const { detectCyberbullying } = require('./cyberbullyingDetection');
  const result = await detectCyberbullying(text);

  return {
    isCyberbullying: result.isCyberbullying,
    severity: result.severity,
    confidence: result.confidence,
    categories: result.categories,
    aiConfidence: 0,
    ruleBasedScore: result.confidence,
    contextScore: 0.5,
    sentimentScore: 0.5
  };
}
