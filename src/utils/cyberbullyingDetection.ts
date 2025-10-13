export interface CyberbullyingResult {
  isCyberbullying: boolean;
  severity: 'low' | 'medium' | 'high' | 'none';
  categories: string[];
  confidence: number;
}

export interface DetectionConfig {
  offensiveWords: string[];
  slurs: string[];
  threatKeywords: string[];
  harassmentPatterns: RegExp[];
  hateSpeechTerms: string[];
}

const DEFAULT_CONFIG: DetectionConfig = {
  offensiveWords: [
    'pathetic', 'worthless', 'disgusting', 'gross', 'freak',
    'annoying', 'irritating', 'obnoxious', 'ridiculous', 'terrible',
    'awful', 'horrible', 'hate', 'kill', 'die', 'death','stupid'
  ],
  slurs: [
    'libtard', 'fag', 'pussy', 'bitch', 'slut', 'whore', 'cunt',
    'retard', 'cripple', 'spastic', 'mongoloid', 'chink', 'gook',
    'spic', 'wetback', 'raghead', 'towelhead', 'kike', 'heeb','fuck','pussy'
  ],
  threatKeywords: [
    'kill', 'murder', 'die', 'death', 'hurt', 'harm', 'attack',
    'destroy', 'eliminate', 'end you', 'finish you', 'beat up',
    'assault', 'violence', 'threaten'
  ],
  harassmentPatterns: [
    /you are a? [a-zA-Z]+/i,  // "you are a [insult]"
    /you'?re? a? [a-zA-Z]+/i,
    /i hate you/i,
    /i'?ll make you/i,
    /you should [a-zA-Z]+ yourself/i,
    /you deserve to [a-zA-Z]+/i,
    /everyone hates you/i,
    /nobody likes you/i,
    /you'?re? pathetic/i,
    /you'?re? worthless/i
  ],
  hateSpeechTerms: [
    'terrorist', 'extremist', 'radical', 'fundamentalist',
    'inferior', 'superior race', 'subhuman', 'vermin',
    'infestation', 'invasion', 'replace', 'great replacement'
  ]
};

export class CyberbullyingDetector {
  private config: DetectionConfig;

  constructor(config: Partial<DetectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  analyzeContent(content: string): CyberbullyingResult {
    const lowerContent = content.toLowerCase();
    const words = content.toLowerCase().split(/\s+/);
    const categories: string[] = [];
    let severityScore = 0;
    let confidence = 0;

    // Check for slurs (highest severity)
    const foundSlurs = words.filter(word =>
      this.config.slurs.some(slur => word.includes(slur))
    );

    if (foundSlurs.length > 0) {
      categories.push('slurs');
      severityScore += 3;
      confidence += 0.9;
    }

    // Check for threat keywords
    const foundThreats = words.filter(word =>
      this.config.threatKeywords.some(threat => word.includes(threat))
    );

    if (foundThreats.length > 0) {
      categories.push('threats');
      severityScore += 2;
      confidence += 0.7;
    }

    // Check for hate speech
    const foundHateSpeech = words.filter(word =>
      this.config.hateSpeechTerms.some(term => word.includes(term))
    );

    if (foundHateSpeech.length > 0) {
      categories.push('hate_speech');
      severityScore += 2;
      confidence += 0.6;
    }

    // Check for offensive words
    const foundOffensive = words.filter(word =>
      this.config.offensiveWords.some(offensive => word.includes(offensive))
    );

    if (foundOffensive.length > 0) {
      categories.push('offensive_language');
      severityScore += 1;
      confidence += 0.4;
    }

    // Check harassment patterns
    const foundHarassment = this.config.harassmentPatterns.filter(pattern =>
      pattern.test(content)
    );

    if (foundHarassment.length > 0) {
      categories.push('harassment');
      severityScore += 2;
      confidence += 0.8;
    }

    // Calculate severity - HIGHER THRESHOLDS for production use
    let severity: 'low' | 'medium' | 'high' | 'none' = 'none';
    if (severityScore >= 3) {
      severity = 'high';
    } else if (severityScore >= 2) {
      severity = 'medium';
    } else if (severityScore >= 1) {
      severity = 'low';
    }

    // Adjust confidence based on context
    if (categories.length > 1) {
      confidence = Math.min(confidence + 0.2, 1.0);
    }

    // Check for repeated patterns (intensifies bullying)
    const repeatedInsults = /([a-zA-Z]+)(\s+\1){2,}/i.test(content);
    if (repeatedInsults) {
      severityScore += 1;
      confidence += 0.3;
      categories.push('repeated_insults');
    }

    // Special case: single offensive words should be medium severity for quick action
    if (foundOffensive.length > 0 && categories.length === 1 && severity === 'low') {
      severity = 'medium';
      confidence += 0.3;
    }

    // Extra sensitive: any single offensive word gets flagged
    if (foundOffensive.length > 0 && severity === 'none') {
      severity = 'medium';
      confidence = 0.8;
      categories.push('offensive_language');
    }

    return {
      isCyberbullying: severity !== 'none',
      severity,
      categories,
      confidence: Math.min(confidence, 1.0)
    };
  }

  shouldHideContent(result: CyberbullyingResult): boolean {
    return result.severity === 'high' || (result.severity === 'medium' && result.confidence > 0.9);
  }

  shouldFlagForReview(result: CyberbullyingResult): boolean {
    return result.severity === 'medium' || (result.severity === 'low' && result.confidence > 0.8);
  }

  getModerationAction(result: CyberbullyingResult): 'hide' | 'flag' | 'none' {
    if (this.shouldHideContent(result)) {
      return 'hide';
    } else if (this.shouldFlagForReview(result)) {
      return 'flag';
    }
    return 'none';
  }
}

// Utility function for easy integration
export function detectCyberbullying(content: string, config?: Partial<DetectionConfig>): CyberbullyingResult {
  console.log(`🔍 Analyzing content for cyberbullying: "${content}"`);
  const detector = new CyberbullyingDetector(config);
  const result = detector.analyzeContent(content);
  console.log(`📊 Detection result:`, result);
  return result;
}

export function shouldHidePost(content: string): boolean {
  const detector = new CyberbullyingDetector();
  const result = detector.analyzeContent(content);
  return detector.shouldHideContent(result);
}

export function getPostModerationAction(content: string): 'hide' | 'flag' | 'none' {
  const detector = new CyberbullyingDetector();
  const result = detector.analyzeContent(content);
  return detector.getModerationAction(result);
}