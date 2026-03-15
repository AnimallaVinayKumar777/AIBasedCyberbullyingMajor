const DEFAULT_CONFIG = {
  offensiveWords: [
      'pathetic', 'worthless', 'disgusting', 'gross', 'freak',
      'annoying', 'irritating', 'obnoxious', 'ridiculous', 'terrible',
      'awful', 'horrible', 'hate', 'kill', 'die', 'death','stupid', 'fuck',
      // Hindi offensive words
      'bekar', 'bakwas', 'gadha', 'ullu', 'stupid', 'idiot', 'fool',
      'nikamma', 'nalayak', 'badtameez', 'ghatiya', 'faltu', 'useless',
      'pagal', 'madarchod', 'bhosdike', 'chutiya', 'randi', 'kutta',
      'kameena', 'harami', 'kutti', 'bhosda', 'chut', 'lodu',
      // Telugu offensive words
      'pichi', 'modda', 'dengu', 'lanjakodaka', 'korika', 'pooku',
      'sala', 'nayala', 'dongodu', 'theeya', 'cheththa', 'useless',
      'gadida', 'gudisa', 'kodaka', 'koduku', 'kodukulu', 'kodukulodu',
      // Kannada offensive words
      'madar', 'bhosda', 'chutiya', 'randi', 'kutta', 'kameena', 'harami',
      'kutti', 'chut', 'lodu', 'gadha', 'ullu', 'bekar', 'bakwas',
      'nikamma', 'nalayak', 'badtameez', 'ghatiya', 'faltu', 'pagal',
      'stupid', 'idiot', 'fool', 'useless',
      // Spanish offensive words
      'idiota', 'estupido', 'imbecil', 'pendejo', 'joto', 'maricon',
      'cabron', 'mierda', 'culo', 'puta', 'zorra', 'perra',
      'desgraciado', 'maldito', 'horrible', 'patetico', 'inutil',
      // French offensive words
      'idiot', 'stupide', 'imbecile', 'con', 'connard', 'salope',
      'pute', 'merde', 'nul', 'horrible', 'pathetique', 'disgustant',
      // German offensive words
      'idiot', 'dumm', 'blod', 'arschloch', 'scheiss', 'mist',
      'verdammt', 'beschissen', 'kotz', 'null', 'nutzlos',
      // Arabic offensive words
      'jalab', 'kalb', 'khinzir', 'hamar', 'ahbal', 'mukhtalat',
      'laqi', 'fahish', 'dhanib', 'safahi',
      // Chinese offensive words
      'baichi', 'chunjian', 'zazhong', 'wangba', 'lazi', 'fengzi',
      'sha bi', 'ben dan', 'cao ni ma', 'si ji ba',
      // Japanese offensive words
      'baka', 'aho', 'kuso', 'yakuza', 'hentai', 'kappa',
      'onara', 'zebasu', 'guzuguzu',
      // Korean offensive words
      'babo', 'jjalba', 'sick', 'mukste', 'kkulbo',
      'jjokbari', 'gongju', 'palga',
      // Tamil offensive words
      'poda', 'potti', 'olla', 'mookuthi', 'kuththu',
      'semma', 'thappu', 'valaiya',
      // Malayalam offensive words
      'poda', 'potti', 'olla', 'munda', 'kuthu',
      'pichu', 'thayoli', 'mootthi',
      // Bengali offensive words
      'bukha', 'chodar', 'haraam', 'god', 'kutta',
      'luchi', 'jhaat', 'gaand',
      // Portuguese offensive words
      'idiota', 'estupido', 'imbecil', 'otario', 'cuzao',
      'filha da puta', 'vai se fuder', 'merda',
      // Russian offensive words
      'durak', 'eblan', 'blyad', 'pizda', 'khuy',
      'svoloch', 'podlec', 'ublyudok',
    ],
  slurs: [
    'libtard', 'fag', 'pussy', 'bitch', 'slut', 'whore', 'cunt', 'fuck', 'asshole', 'bastard',
    'retard', 'cripple', 'spastic', 'mongoloid', 'chink', 'gook',
    'spic', 'wetback', 'raghead', 'towelhead', 'kike', 'heeb',
    // Hindi slurs
    'madarchod', 'bhosdike', 'chutiya', 'randi', 'kutta', 'kameena',
    'harami', 'kutti', 'bhosda', 'chut', 'lodu', 'randwa', 'kuttiya',
    'behanchod', 'betichod', 'gandu', 'chodu', 'lavde', 'jhantu',
    // Telugu slurs (including transliterations)
    'pooku', 'dengu', 'lanjakodaka', 'korika', 'sala', 'nayala',
    'dongodu', 'theeya', 'cheththa', 'gadida', 'gudisa', 'kodaka',
    'koduku', 'kodukulu', 'kodukulodu', 'dengutha', 'donga',
    // Telugu transliterations of English slurs
    'ఫక్', 'ఫక్ చేస్తాను', 'fuck',
    // Kannada slurs
    'madar', 'bhosda', 'chutiya', 'randi', 'kutta', 'kameena', 'harami',
    'kutti', 'chut', 'lodu', 'gandu', 'chodu', 'lavde', 'jhantu',
    'randwa', 'kuttiya', 'behanchod', 'betichod',
    // Spanish slurs
    'maricon', 'joto', 'puto', 'pendejo', 'cabron', 'gilipolla',
    'coño', 'mierda', 'estupido', 'idiota', 'vegetales',
    // French slurs
    'pd', 'pute', 'salope', 'connard', 'enfant de pute',
    'bite', 'couille', 'nique ta mere',
    // German slurs
    'schwuchtel', 'nigger', 'spast', 'flasche', 'huso',
    // Arabic slurs
    'khanzir', 'kalb', 'hamar', 'fahish',
    // Chinese slurs
    'zazhong', 'waiguoren', 'zhina',
  ],
  threatKeywords: [
    'kill', 'murder', 'die', 'death', 'hurt', 'harm', 'attack',
    'destroy', 'eliminate', 'end you', 'finish you', 'beat up',
    'assault', 'violence', 'threaten',
    // Hindi threat keywords
    'maar', 'katl', 'murdabad', 'jaladenge', 'pitenge', 'saza',
    'tabaah', 'barbaad', 'khatam', 'nikaal', 'bhaga', 'dara',
    // Telugu threat keywords
    'champestanu', 'vadilesthanu', 'kottanu', 'kottesta', 'nashanam',
    'nashtam', 'padesthanu', 'padeshta', 'vadileshta', 'vadilesthanu',
    'చంపు', // kill
    'క్షణం', 'హత్య', // kill, murder
    'నరకుతా', 'చంపుతా', 'కొట్టుతా', // will kill, will beat
    ' వధిస్తా', 'హతం చేస్తా', // will murder
    'నేను నిన్ను కొడతాను', // I will beat you (Telugu)
    'నేను నిన్చు కుంటాను', // I will kick you
    'నేను నిన్చు కొట్టాను',
    'నేను దేగుత','నువ్వు మూర్ఖుడివి','तुम एक बेवकूफ हो','मैं तुम्हें मार डालूँगा','मैं देगुता हूँ।','मैं तुम्हें मारूंगा ','तुम एक बेवकूफ हो',
    'छिछोरा','ನಾನು.* ಕೊಲ್ಲುತ್ತೇನೆ','ವೇಸ್ಟ್ ಫೆಲೋ','ghatiya','ನೀನು ಮೂರ್ಖ','నేను నిన్ను తోకుతాను',
    'Trample','nalayak','kameena','Nuvvu chala dangerous ra',
     // I beat you
    // Kannada threat keywords
    'kollu', 'maru', 'kattu', 'kottu', 'nashta', 'tappa', 'dari',
    'bhaya', 'hatya', 'vadhe', 'kollalu', 'maralu', 'kattuvenu',
    // Spanish threat keywords
    'matar', 'morir', 'muerte', 'golpear', 'herir', 'atacar',
    'destruir', 'eliminar', 'acabar', 'violencia', 'amenazar',
    'te voy a matar', 'te matare', 'vete a morir',
    // French threat keywords
    'tuer', 'mourir', 'mort', 'frapper', 'blesser', 'attaquer',
    'detruire', 'eliminer', 'violence', 'menacer',
    // German threat keywords
    'toten', 'sterben', 'tod', 'schlagen', 'verletzen', 'angreifen',
    'zerstoren', 'eliminieren', 'gewalt', 'drohen',
    // Arabic threat keywords
    'qatl', 'mawt', 'daraba', 'qatala', 'ahlaka',
    'hana', 'jfar', 'damim',
    // Chinese threat keywords
    'sha', 'si', 'das', 'gongji', 'weixie',
    'wo yao sha ni', 'ni qu si ba',
    // Japanese threat keywords
    'korosu', 'shinu', 'daigeki', 'kowasu', 'kowareru',
    'te wo korosu', 'shindeiru',
    // Korean threat keywords
    'satae', 'jugeo', 'ttara', 'beolda', 'makhda',
    'naega neoleul jug-eo', 'siinda',
  ],
  harassmentPatterns: [
    /you are a? [a-zA-Z]+/i,  // "you are a [insult]"
    /you'?re? a? [a-zA-Z]+/i,
    /i hate you/i,
    /i'?ll (kill|murder|beat|hurt|harm|attack|estroy|eliminate|finish) you/i,
    /you should [a-zA-Z]+ yourself/i,
    /you deserve to [a-zA-Z]+/i,
    /everyone hates you/i,
    /nobody likes you/i,
    /you'?re? pathetic/i,
    /you'?re? worthless/i,
    // Hindi harassment patterns
    /tu hai [a-zA-Z]+/i,
    /tum ho [a-zA-Z]+/i,
    /tera baap/i,
    /teri maa/i,
    /teri behen/i,
    /main tujhe/i,
    /sab log tujhe/i,
    /tu hai to/i,
    /nikal yahan se/i,
    /mat bol/i,
    // Telugu harassment patterns
    /nuuvu [a-zA-Z]+/i,
    /meeru [a-zA-Z]+/i,
    /ninnu [a-zA-Z]+estanu/i,
    /nee koduku/i,
    /nee amma/i,
    /nee akka/i,
    /ikkada nundi/i,
    /matladaku/i,
    /andaru ninnu/i,
    /నిన్ను [a-zA-Z]+/i,
    // Kannada harassment patterns
    /ninu [a-zA-Z]+/i,
    /nimma [a-zA-Z]+/i,
    /nannu [a-zA-Z]+alu/i,
    /ninna koduku/i,
    /ninna amma/i,
    /ninna akka/i,
    /illinda hogi/i,
    /matadalu/i,
    /ellaru ninna/i,
  ],
  hateSpeechTerms: [
    'terrorist', 'extremist', 'radical', 'fundamentalist',
    'inferior', 'superior race', 'subhuman', 'vermin',
    'infestation', 'invasion', 'replace', 'great replacement',
    // Hindi hate speech terms
    'atankwadi', 'kafir', 'mleccha', 'asur', 'rakshas', 'napunsak',
    'hijra', 'chakka', 'bania', 'baniya', 'dhobi', 'chamar',
    'bhangi', 'dom', 'harijan', 'achhut', 'dalit', 'shudra',
    // Telugu hate speech terms
    'pandaga', 'mala', 'mada', 'pariah', 'untouchable', 'low caste',
    'high caste', 'casteist', 'varna', 'jati', 'kulam', 'gotram',
    // Kannada hate speech terms
    'pandaga', 'mala', 'mada', 'pariah', 'untouchable', 'low caste',
    'high caste', 'casteist', 'varna', 'jati', 'kulam', 'gotram',
    'dalit', 'shudra', 'harijan', 'achhut', 'chamar', 'bhangi', 'dom',
    'bania', 'dhobi', 'hijra', 'napunsak', 'rakshas', 'asur', 'mleccha',
    'kafir', 'atankwadi'
  ],
  universalPatterns: [
    /\b[A-Z]{3,}\b/g,  // All caps words (shouting)
    /(\w+)\s+\1{2,}/gi,  // Repeated words
    /!{2,}/g,  // Multiple exclamation marks
    /\?{2,}/g,  // Multiple question marks
    // Universal insult patterns
    /\b(stupid|idiot|idiotic|fool|foolish|dumb|moron|imbecile|retard|loser|pathetic|worthless|disgusting|trash|garbage|shit|damn|hell)\b/gi,
    // Universal slur patterns
    /\b(fuck|shit|bitch|ass|damn|hell|crap|piss|damned)\b/gi,
    // Universal threat patterns
    /\b(kill|murder|die|dead|death|beat|hurt|harm|attack|destroy|eliminate)\b/gi,
    // Repeated punctuation
    /[!?]{3,}/g,
  ]
};

// Language detection using simple heuristics
function detectLanguage(text) {
  // Check for non-ASCII characters
  const hasCyrillic = /[\u0400-\u04FF]/.test(text);
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  const hasChinese = /[\u4E00-\u9FFF]/.test(text);
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF]/.test(text);
  const hasKorean = /[\uAC00-\uD7AF]/.test(text);
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  const hasTelugu = /[\u0C00-\u0C7F]/.test(text);
  const hasKannada = /[\u0C80-\u0CFF]/.test(text);
  const hasTamil = /[\u0B80-\u0BFF]/.test(text);
  
  if (hasCyrillic) return 'rus';
  if (hasArabic) return 'arb';
  if (hasChinese) return 'zho';
  if (hasJapanese) return 'jpn';
  if (hasKorean) return 'kor';
  if (hasDevanagari) return 'hin';
  if (hasTelugu) return 'tel';
  if (hasKannada) return 'kan';
  if (hasTamil) return 'tam';
  
  return 'eng';
}

// Translate text to English using Google Translate
async function translateToEnglish(text, fromLang) {
  if (fromLang === 'eng') return text;
  
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=en&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await response.json();
    return data[0][0][0];
  } catch (error) {
    console.log('Translation failed:', error);
    return text;
  }
}

// Detect and translate content
async function detectAndTranslate(text) {
  const detectedLang = detectLanguage(text);
  
  if (detectedLang === 'eng') {
    return { language: detectedLang, translatedText: text, isTranslated: false };
  }
  
  try {
    const translatedText = await translateToEnglish(text, detectedLang);
    return { 
      language: detectedLang, 
      translatedText, 
      isTranslated: translatedText !== text 
    };
  } catch (error) {
    return { language: detectedLang, translatedText: text, isTranslated: false };
  }
}

function testPattern(pattern, text) {
  if (pattern.global || pattern.sticky) {
    pattern.lastIndex = 0;
  }
  return pattern.test(text);
}

function computeSeverity(score) {
  // Lowered thresholds to detect more bullying
  if (score >= 2) return 'high';
  if (score >= 1) return 'medium';
  if (score >= 0.5) return 'low';
  return 'none';
}

function findTerms(lowerText, words, terms) {
  const found = [];

  // Check for non-Latin characters
  const hasNonLatinChars = /[\u0900-\u097F\u0C00-\u0C7F\u0C80-\u0CFF\u4E00-\u9FFF]/.test(lowerText);

  for (const term of terms) {
    if (term.includes(' ')) {
      if (lowerText.includes(term)) {
        found.push(term);
      }
      continue;
    }

    // For non-Latin scripts, use simple matching
    if (hasNonLatinChars) {
      if (lowerText.includes(term)) {
        found.push(term);
      }
      continue;
    }

    // Match complete words
    try {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(lowerText)) {
        found.push(term);
      }
    } catch (e) {
      // Skip invalid regex
    }
  }

  return [...new Set(found)];
}

class CyberbullyingDetector {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async analyzeContent(content) {
    // Detect language and translate for analysis
    const { language, translatedText, isTranslated } = await detectAndTranslate(content);
    console.log(`🌐 Detected language: ${language}, translated: ${isTranslated}`);
    
    // Analyze the translated (or original) text
    const analysisContent = translatedText || content;
    const lowerContent = analysisContent.toLowerCase();
    const words = lowerContent.split(/\s+/).filter(Boolean);
    
    // Also analyze the original content for non-English languages
    const lowerOriginal = content.toLowerCase();
    const originalWords = lowerOriginal.split(/\s+/).filter(Boolean);
    
    const categories = [];
    let severityScore = 0;
    let confidence = 0;
    const detectedWords = [];

    // Check for slurs (check both translated and original for non-English)
    const foundSlurs = findTerms(lowerContent, words, this.config.slurs);
    const foundOriginalSlurs = language !== 'eng' ? findTerms(lowerOriginal, originalWords, this.config.slurs) : [];
    const allFoundSlurs = [...new Set([...foundSlurs, ...foundOriginalSlurs])];
    if (allFoundSlurs.length > 0) {
      categories.push('slurs');
      severityScore += 3;
      confidence += 0.9;
      detectedWords.push(...allFoundSlurs);
    }

    // Check for threats (check both translated and original for non-English)
    const foundThreats = findTerms(lowerContent, words, this.config.threatKeywords);
    const foundOriginalThreats = language !== 'eng' ? findTerms(lowerOriginal, originalWords, this.config.threatKeywords) : [];
    const allFoundThreats = [...new Set([...foundThreats, ...foundOriginalThreats])];
    if (allFoundThreats.length > 0) {
      categories.push('threats');
      severityScore += 2;
      confidence += 0.7;
      detectedWords.push(...allFoundThreats);
    }

    // Check for hate speech (check both translated and original for non-English)
    const foundHateSpeech = findTerms(lowerContent, words, this.config.hateSpeechTerms);
    const foundOriginalHateSpeech = language !== 'eng' ? findTerms(lowerOriginal, originalWords, this.config.hateSpeechTerms) : [];
    const allFoundHateSpeech = [...new Set([...foundHateSpeech, ...foundOriginalHateSpeech])];
    if (allFoundHateSpeech.length > 0) {
      categories.push('hate_speech');
      severityScore += 2;
      confidence += 0.6;
      detectedWords.push(...allFoundHateSpeech);
    }

    // Check for offensive words (check both translated and original for non-English)
    const foundOffensive = findTerms(lowerContent, words, this.config.offensiveWords);
    const foundOriginalOffensive = language !== 'eng' ? findTerms(lowerOriginal, originalWords, this.config.offensiveWords) : [];
    const allFoundOffensive = [...new Set([...foundOffensive, ...foundOriginalOffensive])];
    if (allFoundOffensive.length > 0) {
      categories.push('offensive_language');
      severityScore += 1;
      confidence += 0.4;
      detectedWords.push(...allFoundOffensive);
    }

    // Check harassment patterns (check both translated and original content)
    const foundHarassment = this.config.harassmentPatterns.filter(pattern =>
      testPattern(pattern, analysisContent) || testPattern(pattern, content)
    );
    if (foundHarassment.length > 0) {
      categories.push('harassment');
      severityScore += 2;
      confidence += 0.8;
    }

    // Check universal patterns (check both translated and original content)
    if (this.config.universalPatterns) {
      const foundUniversal = this.config.universalPatterns.filter(pattern =>
        testPattern(pattern, analysisContent) || testPattern(pattern, content)
      );
      if (foundUniversal.length > 0) {
        categories.push('universal_patterns');
        severityScore += 1;
        confidence += 0.5;
      }
    }

    let severity = computeSeverity(severityScore);

    if (categories.length > 1) {
      confidence = Math.min(confidence + 0.2, 1.0);
    }

    const repeatedInsults = /([a-zA-Z]+)(\s+\1){2,}/i.test(analysisContent);
    if (repeatedInsults) {
      severityScore += 1;
      confidence += 0.3;
      categories.push('repeated_insults');
      severity = computeSeverity(severityScore);
    }

    // Adjust severity - use combined offensive words
    if (allFoundOffensive.length > 0 && categories.length === 1 && severity === 'low') {
      severity = 'medium';
      confidence += 0.3;
    }

    if (allFoundOffensive.length > 0 && severity === 'none') {
      severity = 'medium';
      confidence = Math.max(confidence, 0.8);
      if (!categories.includes('offensive_language')) {
        categories.push('offensive_language');
      }
    }

    return {
      isCyberbullying: severity !== 'none',
      severity,
      categories,
      confidence: Math.min(confidence, 1.0),
      detectedLanguage: language,
      detectedWords: [...new Set(detectedWords)]
    };
  }

  // More sensitive - hide any detected bullying
  shouldHideContent(result) {
    return result.severity !== 'none';
  }

  shouldFlagForReview(result) {
    return result.severity !== 'none' || result.confidence > 0.5;
  }

  getModerationAction(result) {
    // Hide any detected bullying
    if (result.severity !== 'none') {
      return 'hide';
    }
    return 'none';
  }
}

// Utility function for easy integration
async function detectCyberbullying(content, config) {
  console.log(`🔍 Analyzing content for cyberbullying: "${content}"`);
  const detector = new CyberbullyingDetector(config);
  const result = await detector.analyzeContent(content);
  console.log(`📊 Detection result:`, result);
  return result;
}

module.exports = {
  CyberbullyingDetector,
  detectCyberbullying
};
