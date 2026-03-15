/**
 * Cyberbullying Detection Engine
 * 
 * Local, offline-capable cyberbullying detection using rule-based analysis.
 * Supports multiple languages including English, Hindi, Telugu, and Kannada.
 * 
 * @module cyberbullyingDetection
 */

/**
 * Severity levels for detected content
 */
export type SeverityLevel = 'none' | 'low' | 'medium' | 'high';

/**
 * Detection categories
 */
export type DetectionCategory = 
  | 'slurs'
  | 'threats'
  | 'hate_speech'
  | 'offensive_language'
  | 'harassment'
  | 'repeated_insults'
  | 'universal_patterns';

/**
 * Moderation action recommendation
 */
export type ModerationAction = 'hide' | 'flag' | 'none';

/**
 * Configuration for detection sensitivity
 */
export interface DetectionConfig {
  /** Category weights for scoring */
  categoryWeights: CategoryWeights;
  /** Minimum confidence threshold */
  minConfidence: number;
  /** Enable multi-language detection */
  enableMultiLanguage: boolean;
  /** Custom threshold for high severity */
  highSeverityThreshold: number;
  /** Custom threshold for medium severity */
  mediumSeverityThreshold: number;
  /** Custom words to flag */
  customWords: string[];
  /** Language-specific configuration */
  languageConfig: LanguageConfig;
}

/**
 * Weights for each detection category
 */
export interface CategoryWeights {
  slurs: number;
  threats: number;
  hate_speech: number;
  offensive_language: number;
  harassment: number;
  repeated_insults: number;
  universal_patterns: number;
}

/**
 * Language-specific configuration
 */
export interface LanguageConfig {
  /** Enable English detection */
  en: boolean;
  /** Enable Hindi detection */
  hi: boolean;
  /** Enable Telugu detection */
  te: boolean;
  /** Enable Kannada detection */
  kn: boolean;
}

/**
 * Result of cyberbullying analysis
 */
export interface CyberbullyingResult {
  /** Whether cyberbullying was detected */
  isCyberbullying: boolean;
  /** Severity level of the content */
  severity: SeverityLevel;
  /** Categories of detected content */
  categories: DetectionCategory[];
  /** Confidence score (0-1) */
  confidence: number;
  /** Detected language (ISO code) */
  detectedLanguage: string;
  /** Words/phrases that triggered detection */
  detectedWords: string[];
  /** Whether this is a first-time offense */
  isFirstOffense: boolean;
  /** Timestamp of analysis */
  timestamp: Date;
}

/**
 * Default category weights for scoring
 */
const DEFAULT_CATEGORY_WEIGHTS: CategoryWeights = {
  slurs: 0.9,
  threats: 0.7,
  hate_speech: 0.6,
  offensive_language: 0.4,
  harassment: 0.8,
  repeated_insults: 0.5,
  universal_patterns: 0.3
};

/**
 * Default language configuration
 */
const DEFAULT_LANGUAGE_CONFIG: LanguageConfig = {
  en: true,
  hi: true,
  te: true,
  kn: true
};

/**
 * Default detection configuration
 */
const DEFAULT_CONFIG: DetectionConfig = {
  categoryWeights: DEFAULT_CATEGORY_WEIGHTS,
  minConfidence: 0.6,
  enableMultiLanguage: true,
  highSeverityThreshold: 0.7,
  mediumSeverityThreshold: 0.4,
  customWords: [],
  languageConfig: DEFAULT_LANGUAGE_CONFIG
};

/**
 * Offensive and sensitive terms for detection
 */
const OFFENSIVE_TERMS = {
  en: [
    'pathetic', 'worthless', 'disgusting', 'gross', 'freak',
    'annoying', 'irritating', 'obnoxious', 'ridiculous', 'terrible',
    'awful', 'horrible', 'hate', 'kill', 'die', 'death', 'stupid'
  ],
  hi: [
    'bekar', 'bakwas', 'gadha', 'ullu', 'nikamma', 'nalayak',
    'badtameez', 'ghatiya', 'faltu', 'pagal'
  ],
  te: [
    'pichi', 'modda', 'dengu', 'lanjakodaka', 'korika', 'pooku',
    'sala', 'nayala', 'dongodu', 'theeya', 'cheththa'
  ],
  kn: [
    'madar', 'bhosda', 'chutiya', 'randi', 'kutta', 'harami',
    'gadha', 'ullu', 'bekar', 'bakwas', 'pagal'
  ]
};

/**
 * Slur terms for detection (high severity)
const SLUR_TERMS = {
  en: [
    'libtard', 'fag', 'pussy', 'bitch', 'slut', 'whore', 'cunt',
    'retard', 'cripple', 'spastic'
  ],
  hi: [
    'madarchod', 'bhosdike', 'chutiya', 'randi', 'kutta', 'harami',
    'kutti', 'bhosda', 'gandu', 'chodu'
  ],
  te: [
    'pooku', 'dengu', 'lanjakodaka', 'korika', 'sala', 'nayala',
    'dongodu', 'theeya', 'cheththa', 'gadida', 'gudisa'
  ],
  kn: [
    'madar', 'bhosda', 'chutiya', 'randi', 'kutta', 'harami',
    'gandu', 'chodu', 'lavde', 'jhantu'
  ]
};
*/

/**
 * Threat keywords for detection
const THREAT_KEYWORDS = {
  en: [
    'kill', 'murder', 'die', 'death', 'hurt', 'harm', 'attack',
    'destroy', 'eliminate', 'finish you', 'beat up'
  ],
  hi: [
    'maar', 'katl', 'murdabad', 'jaladenge', 'pitenge', 'saza'
  ],
  te: [
    'champestanu', 'vadilesthanu', 'kottanu', 'nashtam', 'చంపు'
  ],
  kn: [
    'kollu', 'maru', 'kattu', 'kottu', 'nashta', 'bhaya', 'hatya'
  ]
};
*/

/**
 * Harassment patterns (regex)
const HARASSMENT_PATTERNS = [
  /you are a? [a-zA-Z]+/i,
  /i hate you/i,
  /you should [a-zA-Z]+ yourself/i,
  /everyone hates you/i,
  /nobody likes you/i
];
*/

/**
 * Default offensive terms (combined from all languages)
 */
const DEFAULT_OFFENSIVE_WORDS = [
  // English
  'pathetic', 'worthless', 'disgusting', 'gross', 'freak',
  'annoying', 'irritating', 'obnoxious', 'ridiculous', 'terrible',
  'awful', 'horrible', 'hate', 'kill', 'die', 'death', 'stupid', 'fuck',
  // Hindi
  'bekar', 'bakwas', 'gadha', 'ullu', 'nikamma', 'nalayak',
  'badtameez', 'ghatiya', 'faltu', 'pagal', 'madarchod', 'bhosdike',
  'chutiya', 'randi', 'kutta', 'kameena', 'harami', 'kutti', 'bhosda',
  // Telugu
  'pichi', 'modda', 'dengu', 'lanjakodaka', 'korika', 'pooku',
  'sala', 'nayala', 'dongodu', 'theeya', 'cheththa', 'gadida', 'gudisa',
  // Kannada
  'madar', 'bhosda', 'chutiya', 'randi', 'kutta', 'kameena', 'harami',
  'kutti', 'gandu', 'chodu', 'lavde', 'jhantu'
];

/**
 * Default slur terms
 */
const DEFAULT_SLURS = [
  // English
  'libtard', 'fag', 'pussy', 'bitch', 'slut', 'whore', 'cunt',
  'retard', 'cripple', 'spastic', 'mongoloid', 'chink', 'gook',
  // Hindi
  'madarchod', 'bhosdike', 'chutiya', 'randi', 'kutta', 'kameena',
  'harami', 'kutti', 'bhosda', 'gandu', 'chodu', 'lavde', 'jhantu',
  // Telugu
  'pooku', 'dengu', 'lanjakodaka', 'korika', 'sala', 'nayala',
  'dongodu', 'theeya', 'cheththa', 'gadida', 'gudisa',
  // Kannada
  'madar', 'bhosda', 'chutiya', 'randi', 'kutta', 'harami',
  'gandu', 'chodu', 'lavde', 'jhantu'
];

/**
 * Default threat keywords
 */
const DEFAULT_THREAT_KEYWORDS = [
  // English
  'kill', 'murder', 'die', 'death', 'hurt', 'harm', 'attack',
  'destroy', 'eliminate', 'finish you', 'beat up', 'assault', 'violence',
  // Hindi
  'maar', 'katl', 'murdabad', 'jaladenge', 'pitenge', 'saza',
  // Telugu
  'champestanu', 'vadilesthanu', 'kottanu', 'nashtam', 'చంపు',
  // Kannada
  'kollu', 'maru', 'kattu', 'kottu', 'nashta', 'bhaya', 'hatya'
];

/**
 * Universal patterns (regex)
 */
const DEFAULT_UNIVERSAL_PATTERNS = [
  /\b[A-Z]{3,}\b/g,  // All caps words
  /(\w+)\s+\1{2,}/gi,  // Repeated words
  /!{2,}/g,  // Multiple exclamation marks
  /fuck|shit|bitch|cunt|asshole/gi  // Universal swears
];

/**
 * Compute severity from score
 */
function computeSeverity(score: number): SeverityLevel {
  if (score >= 3) return 'high';
  if (score >= 2) return 'medium';
  if (score >= 1) return 'low';
  return 'none';
}

/**
 * Find terms in text
 */
function findTerms(text: string, terms: string[]): string[] {
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  const found: string[] = [];

  for (const term of terms) {
    if (term.includes(' ')) {
      if (lowerText.includes(term)) {
        found.push(term);
      }
      continue;
    }
    if (words.some(word => word.includes(term))) {
      found.push(term);
    }
  }

  return [...new Set(found)];
}

/**
 * Test regex patterns against text
 */
function testPattern(pattern: RegExp, text: string): boolean {
  if (pattern.global || pattern.sticky) {
    pattern.lastIndex = 0;
  }
  return pattern.test(text);
}

/**
 * Cyberbullying Detection Engine
 * 
 * Provides local, offline-capable detection of cyberbullying content
 * using rule-based analysis. Supports multiple languages.
 * 
 * @example
 * ```typescript
 * import { CyberbullyingDetector } from '@safenet/sdk';
 * 
 * const detector = new CyberbullyingDetector();
 * const result = await detector.analyzeContent('You are amazing!');
 * console.log(result.isCyberbullying); // false
 * ```
 */
export class CyberbullyingDetector {
  private config: DetectionConfig;

  constructor(config?: Partial<DetectionConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Analyze content for cyberbullying
   * 
   * @param content - The text content to analyze
   * @returns Promise resolving to detection result
   */
  async analyzeContent(content: string): Promise<CyberbullyingResult> {
    const lowerContent = content.toLowerCase();
    const words = lowerContent.split(/\s+/).filter(Boolean);
    const { categoryWeights, languageConfig } = this.config;

    const categories: DetectionCategory[] = [];
    let severityScore = 0;
    let confidence = 0;
    const detectedWords: string[] = [];

    // Check for slurs (highest severity)
    const foundSlurs = findTerms(content, DEFAULT_SLURS);
    if (foundSlurs.length > 0) {
      categories.push('slurs');
      severityScore += 3;
      confidence += categoryWeights.slurs;
      detectedWords.push(...foundSlurs);
    }

    // Check for threat keywords
    const foundThreats = findTerms(content, DEFAULT_THREAT_KEYWORDS);
    if (foundThreats.length > 0) {
      categories.push('threats');
      severityScore += 2;
      confidence += categoryWeights.threats;
      detectedWords.push(...foundThreats);
    }

    // Check for offensive words
    const foundOffensive = findTerms(content, DEFAULT_OFFENSIVE_WORDS);
    if (foundOffensive.length > 0) {
      categories.push('offensive_language');
      severityScore += 1;
      confidence += categoryWeights.offensive_language;
      detectedWords.push(...foundOffensive);
    }

    // Check universal patterns
    const foundUniversal = DEFAULT_UNIVERSAL_PATTERNS.filter(pattern =>
      testPattern(pattern, content)
    );
    if (foundUniversal.length > 0) {
      categories.push('universal_patterns');
      severityScore += 1;
      confidence += categoryWeights.universal_patterns;
    }

    // Check for repeated insults
    const repeatedInsults = /([a-zA-Z]+)(\s+\1){2,}/i.test(content);
    if (repeatedInsults) {
      categories.push('repeated_insults');
      severityScore += 1;
      confidence += categoryWeights.repeated_insults;
    }

    // Compute severity
    let severity = computeSeverity(severityScore);

    // Adjust confidence based on categories
    if (categories.length > 1) {
      confidence = Math.min(confidence + 0.2, 1.0);
    }

    // Single offensive word gets medium severity
    if (foundOffensive.length > 0 && categories.length === 1 && severity === 'low') {
      severity = 'medium';
      confidence += 0.3;
    }

    // Any offensive word gets flagged
    if (foundOffensive.length > 0 && severity === 'none') {
      severity = 'medium';
      confidence = Math.max(confidence, 0.8);
      categories.push('offensive_language');
    }

    return {
      isCyberbullying: severity !== 'none',
      severity,
      categories,
      confidence: Math.min(confidence, 1.0),
      detectedLanguage: this.detectLanguage(content),
      detectedWords: [...new Set(detectedWords)],
      isFirstOffense: true,
      timestamp: new Date()
    };
  }

  /**
   * Detect the language of content
   */
  private detectLanguage(content: string): string {
    const lowerContent = content.toLowerCase();
    
    // Simple language detection based on script/characters
    if (/[\u0C00-\u0C7F]/.test(content)) return 'te'; // Telugu
    if (/[\u0C80-\u0CFF]/.test(content)) return 'kn'; // Kannada
    if (/[\u0900-\u097F]/.test(content)) return 'hi'; // Hindi
    if (/[a-zA-Z]/.test(content)) return 'en'; // English
    
    return 'unknown';
  }

  /**
   * Get recommended moderation action
   */
  getModerationAction(result: CyberbullyingResult): ModerationAction {
    if (result.severity === 'high') {
      return 'hide';
    }
    if (result.severity === 'medium' && result.confidence > 0.9) {
      return 'hide';
    }
    if (result.severity === 'medium' || (result.severity === 'low' && result.confidence > 0.8)) {
      return 'flag';
    }
    return 'none';
  }

  /**
   * Check if content should be hidden
   */
  shouldHideContent(result: CyberbullyingResult): boolean {
    return result.severity === 'high' || 
           (result.severity === 'medium' && result.confidence > 0.9);
  }

  /**
   * Check if content should be flagged for review
   */
  shouldFlagForReview(result: CyberbullyingResult): boolean {
    return result.severity === 'medium' || 
           (result.severity === 'low' && result.confidence > 0.8);
  }
}

/**
 * Quick detection function
 * 
 * @param content - Text to analyze
 * @param config - Optional configuration
 * @returns Detection result
 * 
 * @example
 * ```typescript
 * import { detectCyberbullying } from '@safenet/sdk';
 * 
 * const result = await detectCyberbullying('Some text');
 * ```
 */
export async function detectCyberbullying(
  content: string,
  config?: Partial<DetectionConfig>
): Promise<CyberbullyingResult> {
  const detector = new CyberbullyingDetector(config);
  return detector.analyzeContent(content);
}

/**
 * Get moderation action for content
 * 
 * @param content - Text to analyze
 * @param config - Optional configuration
 * @returns Moderation action
 */
export async function getPostModerationAction(
  content: string,
  config?: Partial<DetectionConfig>
): Promise<ModerationAction> {
  const detector = new CyberbullyingDetector(config);
  const result = await detector.analyzeContent(content);
  return detector.getModerationAction(result);
}
