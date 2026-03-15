import { AICyberbullyingModel, TrainingData, AIModelConfig } from './aiCyberbullyingModel';

export interface TrainingExample {
  text: string;
  label: 'none' | 'low' | 'medium' | 'high';
  language: string;
  categories: string[];
}

export class AIModelTrainer {
  private model: AICyberbullyingModel;
  private trainingExamples: TrainingExample[] = [];

  constructor(model?: AICyberbullyingModel) {
    this.model = model || this.createDefaultModel();
  }

  private createDefaultModel(): AICyberbullyingModel {
    const config: AIModelConfig = {
      hiddenLayers: [256, 128, 64, 32],
      learningRate: 0.001,
      epochs: 150,
      batchSize: 32,
      dropoutRate: 0.2,
      activationFunction: 'relu'
    };

    return new AICyberbullyingModel(config);
  }

  addTrainingExample(example: TrainingExample): void {
    this.trainingExamples.push(example);
  }

  addMultipleExamples(examples: TrainingExample[]): void {
    this.trainingExamples.push(...examples);
  }

  // Pre-built dataset for cyberbullying detection
  loadPrebuiltDataset(): void {
    const cyberbullyingExamples: TrainingExample[] = [
      // High severity examples
      {
        text: "You should just kill yourself, nobody wants you here",
        label: "high",
        language: "en",
        categories: ["threats", "harassment"]
      },
      {
        text: "I hate you so much, you disgusting worthless freak",
        label: "high",
        language: "en",
        categories: ["hate_speech", "insults"]
      },
      {
        text: "Tu hai ek gadha aur nikamma insan, mar ja",
        label: "high",
        language: "hi",
        categories: ["insults", "threats"]
      },
      {
        text: "Nuvvu pichi koduku, champestanu",
        label: "high",
        language: "te",
        categories: ["insults", "threats"]
      },

      // Medium severity examples
      {
        text: "You're so stupid and annoying, why do you even exist?",
        label: "medium",
        language: "en",
        categories: ["insults"]
      },
      {
        text: "Everyone thinks you're pathetic and worthless",
        label: "medium",
        language: "en",
        categories: ["harassment"]
      },
      {
        text: "Tu hai bakwas aur faltu, kuch mat bol",
        label: "medium",
        language: "hi",
        categories: ["insults", "harassment"]
      },
      {
        text: "Meeru andaru gudisa kodukulu",
        label: "medium",
        language: "te",
        categories: ["insults"]
      },

      // Low severity examples
      {
        text: "That was a silly thing to say",
        label: "low",
        language: "en",
        categories: ["mild_criticism"]
      },
      {
        text: "I disagree with your opinion",
        label: "low",
        language: "en",
        categories: ["disagreement"]
      },
      {
        text: "Yeh galat baat hai",
        label: "low",
        language: "hi",
        categories: ["disagreement"]
      },
      {
        text: "Nenu disagree chestunna",
        label: "low",
        language: "te",
        categories: ["disagreement"]
      },

      // Non-cyberbullying examples
      {
        text: "Great job on your presentation today!",
        label: "none",
        language: "en",
        categories: ["positive"]
      },
      {
        text: "Thanks for helping me with my homework",
        label: "none",
        language: "en",
        categories: ["gratitude"]
      },
      {
        text: "Bahut accha kaam kiya",
        label: "none",
        language: "hi",
        categories: ["positive"]
      },
      {
        text: "Thanks for your help",
        label: "none",
        language: "te",
        categories: ["gratitude"]
      }
    ];

    this.addMultipleExamples(cyberbullyingExamples);
  }

  prepareTrainingData(): TrainingData {
    const input: number[][] = [];
    const output: number[][] = [];

    this.trainingExamples.forEach(example => {
      // Convert text to vector (simplified representation)
      const vector = this.textToVector(example.text);
      input.push(vector);

      // Convert label to one-hot encoding
      const labelIndex = { none: 0, low: 1, medium: 2, high: 3 };
      const oneHot = [0, 0, 0, 0];
      oneHot[labelIndex[example.label]] = 1;
      output.push(oneHot);
    });

    return {
      input,
      output,
      metadata: this.trainingExamples.map(ex => ({
        text: ex.text,
        language: ex.language,
        severity: ex.label
      }))
    };
  }

  private textToVector(text: string): number[] {
    // Simple bag-of-words representation
    const words = text.toLowerCase().split(/\s+/);
    const vector = Array(1000).fill(0);

    words.forEach(word => {
      // Simple hash function for word to index mapping
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash + word.charCodeAt(i)) & 0xffffffff;
      }
      const index = Math.abs(hash) % 1000;
      vector[index] = 1;
    });

    return vector;
  }

  async trainModel(): Promise<void> {
    console.log(`📚 Preparing ${this.trainingExamples.length} training examples...`);

    if (this.trainingExamples.length === 0) {
      this.loadPrebuiltDataset();
    }

    const trainingData = this.prepareTrainingData();
    console.log(`🎯 Training data prepared: ${trainingData.input.length} samples`);

    await this.model.train(trainingData);
  }

  saveTrainedModel(filePath: string): void {
    this.model.saveModel(filePath);
    console.log(`💾 Model saved to ${filePath}`);
  }

  loadTrainedModel(filePath: string): void {
    this.model.loadModel(filePath);
    console.log(`📂 Model loaded from ${filePath}`);
  }

  async evaluateModel(testExamples: TrainingExample[]): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  }> {
    let correct = 0;
    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    const labelIndex = { none: 0, low: 1, medium: 2, high: 3 };
    const severityMap = ['none', 'low', 'medium', 'high'];

    testExamples.forEach(example => {
      const prediction = this.model.predict(example.text);
      const predictedLabel = prediction.severity;
      const actualLabel = example.label;

      if (predictedLabel === actualLabel) correct++;

      // Calculate confusion matrix components
      if (actualLabel !== 'none' && predictedLabel !== 'none') {
        truePositives++;
      } else if (actualLabel === 'none' && predictedLabel !== 'none') {
        falsePositives++;
      } else if (actualLabel !== 'none' && predictedLabel === 'none') {
        falseNegatives++;
      }
    });

    const accuracy = correct / testExamples.length;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    return { accuracy, precision, recall, f1Score };
  }

  getTrainingStats(): {
    totalExamples: number;
    examplesByLabel: Record<string, number>;
    examplesByLanguage: Record<string, number>;
  } {
    const examplesByLabel: Record<string, number> = { none: 0, low: 0, medium: 0, high: 0 };
    const examplesByLanguage: Record<string, number> = {};

    this.trainingExamples.forEach(example => {
      examplesByLabel[example.label]++;
      examplesByLanguage[example.language] = (examplesByLanguage[example.language] || 0) + 1;
    });

    return {
      totalExamples: this.trainingExamples.length,
      examplesByLabel,
      examplesByLanguage
    };
  }

  // Method to add real-time learning from user feedback
  async learnFromFeedback(text: string, userFeedback: {
    wasCorrect: boolean;
    actualSeverity?: 'none' | 'low' | 'medium' | 'high';
  }): Promise<void> {
    if (userFeedback.wasCorrect) return;

    const example: TrainingExample = {
      text,
      label: userFeedback.actualSeverity || 'medium',
      language: 'en', // Could be enhanced to detect language
      categories: []
    };

    this.addTrainingExample(example);

    // Retrain model with new example
    console.log('🔄 Learning from user feedback...');
    const trainingData = this.prepareTrainingData();
    await this.model.train(trainingData);
  }
}

// Utility function to create and train a model quickly
export async function createAndTrainModel(): Promise<AICyberbullyingModel> {
  const trainer = new AIModelTrainer();
  trainer.loadPrebuiltDataset();

  console.log('🏋️ Training AI model...');
  await trainer.trainModel();

  return trainer['model'];
}

// Export for easy access
export const CyberbullyingAIModel = AICyberbullyingModel;
export const CyberbullyingModelTrainer = AIModelTrainer;