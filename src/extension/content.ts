// Content script for Twitter cyberbullying detection
import { detectCyberbullying, getPostModerationAction } from '../utils/cyberbullyingDetection';
import './types';

// Store for processed tweets to avoid reprocessing
const processedTweets = new Set<string>();
let isMonitoring = false;
let observer: MutationObserver | null = null;

// Start monitoring Twitter timeline
function startMonitoring() {
  if (isMonitoring) return;

  isMonitoring = true;
  console.log('🛡️ ChirpGuard content script monitoring started');

  // Monitor for new tweets in timeline
  observeTimelineChanges();

  // Initial scan of existing tweets
  setTimeout(() => {
    scanExistingTweets();
  }, 2000);
}

// Stop monitoring
function stopMonitoring() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  isMonitoring = false;
  console.log('🛡️ ChirpGuard monitoring stopped');
}

// Observe DOM changes for new tweets
function observeTimelineChanges() {
  const timelineSelectors = [
    '[data-testid="primaryColumn"]',
    'main[role="main"]',
    '.react-root'
  ];

  const timeline = document.querySelector(timelineSelectors.join(', ')) as Element;
  if (!timeline) {
    console.log('Timeline not found, retrying...');
    setTimeout(observeTimelineChanges, 1000);
    return;
  }

  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          // Check if new tweets were added
          const tweets = element.querySelectorAll ? element.querySelectorAll('[data-testid="tweet"]') : [];
          tweets.forEach(tweet => processTweetElement(tweet));
        }
      });
    });
  });

  observer.observe(timeline, {
    childList: true,
    subtree: true
  });
}

// Scan existing tweets on page load
function scanExistingTweets() {
  const tweetSelectors = [
    '[data-testid="tweet"]',
    'article[data-testid="tweet"]',
    'div[data-testid="tweet"]'
  ];

  tweetSelectors.forEach(selector => {
    const tweets = document.querySelectorAll(selector);
    tweets.forEach(tweet => processTweetElement(tweet));
  });
}

// Process individual tweet element
function processTweetElement(tweetElement: Element) {
  // Try to get tweet content
  const content = extractTweetContent(tweetElement);
  if (!content || content.length < 3) return;

  // Try to get tweet ID
  const tweetId = (tweetElement as HTMLElement).dataset?.tweetId || generateTweetId(tweetElement);
  if (processedTweets.has(tweetId)) return;

  processedTweets.add(tweetId);

  console.log(`🐦 Processing tweet: "${content.substring(0, 50)}..."`);

  // Analyze content for cyberbullying
  const cyberbullyingResult = detectCyberbullying(content);
  const moderationAction = getPostModerationAction(content);

  if (cyberbullyingResult.isCyberbullying) {
    console.log(`🚨 Cyberbullying detected! Severity: ${cyberbullyingResult.severity}`);

    // Apply visual overlay based on severity
    applyModerationOverlay(tweetElement, {
      isCyberbullying: cyberbullyingResult.isCyberbullying,
      severity: cyberbullyingResult.severity,
      categories: cyberbullyingResult.categories,
      shouldHide: moderationAction === 'hide',
      shouldFlag: moderationAction === 'flag'
    });
  }
}

// Extract tweet content from DOM element
function extractTweetContent(tweetElement: Element): string {
  // Try multiple selectors for tweet text
  const textSelectors = [
    '[data-testid="tweetText"]',
    'div[lang]',
    '.tweet-text',
    'p',
    'span[dir="ltr"]'
  ];

  for (const selector of textSelectors) {
    const textElement = tweetElement.querySelector(selector);
    if (textElement && textElement.textContent) {
      return textElement.textContent.trim();
    }
  }

  return tweetElement.textContent || '';
}

// Generate unique ID for tweet element
function generateTweetId(tweetElement: Element): string {
  const content = tweetElement.textContent || '';
  const timestamp = Date.now();
  return `tweet_${btoa(content.substring(0, 20)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)}_${timestamp}`;
}

// Apply moderation overlay to tweet
function applyModerationOverlay(tweetElement: Element, result: any) {
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.className = 'chirpguard-overlay';
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(239, 68, 68, 0.1);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    border-radius: 16px;
    border: 2px solid rgba(239, 68, 68, 0.3);
  `;

  // Create warning content
  const warningContent = document.createElement('div');
  warningContent.style.cssText = `
    text-align: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 12px;
    color: white;
    max-width: 90%;
  `;

  warningContent.innerHTML = `
    <div style="font-size: 24px; margin-bottom: 8px;">⚠️</div>
    <div style="font-weight: bold; margin-bottom: 8px;">Content Violation</div>
    <div style="font-size: 14px; margin-bottom: 12px;">
      ${result.severity.toUpperCase()} severity cyberbullying detected
    </div>
    <button class="chirpguard-reveal-btn" style="
      background: #1d9bf0;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
    ">Reveal Content</button>
  `;

  overlay.appendChild(warningContent);

  // Add reveal functionality
  const revealBtn = warningContent.querySelector('.chirpguard-reveal-btn') as HTMLButtonElement;
  revealBtn?.addEventListener('click', () => {
    overlay.remove();
  });

  // Position overlay relative to tweet
  (tweetElement as HTMLElement).style.position = 'relative';
  tweetElement.appendChild(overlay);

  console.log(`🛡️ Applied ${result.severity} moderation overlay to tweet`);
}

// Initialize content script
function initialize() {
  console.log('🚀 ChirpGuard content script loaded');

  // Wait for Twitter to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startMonitoring);
  } else {
    startMonitoring();
  }
}

// Handle messages from background script
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case 'SCAN_TWEETS':
        scanExistingTweets();
        sendResponse({ success: true });
        break;
      case 'START_MONITORING':
        startMonitoring();
        sendResponse({ success: true });
        break;
      case 'STOP_MONITORING':
        stopMonitoring();
        sendResponse({ success: true });
        break;
    }
    return true;
  });
}

// Auto-initialize
initialize();