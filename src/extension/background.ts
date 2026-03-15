// Background script for ChirpGuard Chrome extension
import '../extension/types';
import { CyberbullyingDetector } from '../utils/cyberbullyingDetection';

interface TweetData {
  id: string;
  content: string;
  author: string;
  timestamp: number;
  isProcessed?: boolean;
  moderationResult?: any;
}

const DEFAULT_STATE = {
  isMonitoring: false,
  tweetsScanned: 0,
  threatsDetected: 0,
  actionsTaken: 0,
  settings: {
    autoHide: true,
    soundAlerts: false,
    notifications: true
  }
};

// Store for processed tweets to avoid reprocessing
const processedTweets = new Map<string, TweetData>();
let isMonitoring = false;
let scanIntervalId: ReturnType<typeof setInterval> | null = null;

const detector = new CyberbullyingDetector();

function isSupportedUrl(url?: string): boolean {
  return Boolean(url && (url.includes('twitter.com') || url.includes('x.com')));
}

function computeStats() {
  const values = Array.from(processedTweets.values());
  const bullyTweets = values.filter(t => t.moderationResult?.isCyberbullying).length;
  const hiddenTweets = values.filter(t => t.moderationResult?.shouldHide).length;
  const flaggedTweets = values.filter(t => t.moderationResult?.shouldFlag).length;

  return {
    totalProcessed: processedTweets.size,
    bullyTweets,
    hiddenTweets,
    flaggedTweets,
    actionsTaken: hiddenTweets + flaggedTweets
  };
}

function updateStatsStorage() {
  const stats = computeStats();
  chrome.storage.local.get(['chirpguard_state'], (result) => {
    const current = result.chirpguard_state || DEFAULT_STATE;
    const next = {
      ...current,
      isMonitoring,
      tweetsScanned: stats.totalProcessed,
      threatsDetected: stats.bullyTweets,
      actionsTaken: stats.actionsTaken
    };

    chrome.storage.local.set({ chirpguard_state: next }, () => {
      chrome.runtime.sendMessage({ action: 'UPDATE_STATS', stats: next });
    });
  });
}

// Start monitoring Twitter feeds
function startMonitoring() {
  if (isMonitoring) return;

  isMonitoring = true;
  console.log('🛡️ ChirpGuard monitoring started');
  updateStatsStorage();

  scanForTweets();

  // Check for new tweets every 2 seconds
  scanIntervalId = setInterval(() => {
    scanForTweets();
  }, 2000);
}

// Stop monitoring
function stopMonitoring() {
  isMonitoring = false;
  if (scanIntervalId) {
    clearInterval(scanIntervalId);
    scanIntervalId = null;
  }
  console.log('🛡️ ChirpGuard monitoring stopped');
  updateStatsStorage();
}

// Scan Twitter DOM for tweets
function scanForTweets() {
  // Send message to content script to scan for tweets
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id || !isSupportedUrl(tab.url)) return;

    chrome.tabs.sendMessage(
      tab.id,
      { action: 'SCAN_TWEETS' },
      () => {
        if (chrome.runtime.lastError) {
          console.log('No content script found, injecting...');
          injectContentScript(tab.id);
        }
      }
    );
  });
}

// Inject content script into Twitter tab
function injectContentScript(tabId: number) {
  chrome.scripting.executeScript({
    target: { tabId },
    files: ['content.js']
  }).then(() => {
    console.log('💉 Content script injected');
    // Start monitoring after injection
    setTimeout(() => startMonitoring(), 1000);
  }).catch(error => {
    console.error('Failed to inject content script:', error);
  });
}

// Process tweet content for cyberbullying
async function processTweetContent(content: string): Promise<any> {
  console.log(`🔍 Analyzing tweet: "${content.substring(0, 50)}..."`);

  const cyberbullyingResult = await detector.analyzeContent(content);
  const moderationAction = detector.getModerationAction(cyberbullyingResult);

  return {
    isCyberbullying: cyberbullyingResult.isCyberbullying,
    severity: cyberbullyingResult.severity,
    categories: cyberbullyingResult.categories,
    confidence: cyberbullyingResult.confidence,
    moderationAction,
    shouldHide: moderationAction === 'hide',
    shouldFlag: moderationAction === 'flag'
  };
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'PROCESS_TWEET':
      processTweetContent(message.content)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ error: error?.message || 'Processing failed' }));
      return true;
    case 'REPORT_TWEET': {
      const { id, result } = message.data || {};
      if (id && !processedTweets.has(id)) {
        processedTweets.set(id, {
          id,
          content: '',
          author: '',
          timestamp: Date.now(),
          isProcessed: true,
          moderationResult: result
        });
        updateStatsStorage();
        if (result?.isCyberbullying) {
          chrome.runtime.sendMessage({ action: 'THREAT_DETECTED' });
        }
      }
      sendResponse({ success: true });
      break;
    }

    case 'GET_STATS':
      const stats = computeStats();
      sendResponse(stats);
      break;

    case 'START_MONITORING':
      startMonitoring();
      sendResponse({ success: true });
      break;

    case 'STOP_MONITORING':
      stopMonitoring();
      sendResponse({ success: true });
      break;

    case 'GET_STATUS':
      sendResponse({
        isMonitoring,
        totalProcessed: processedTweets.size
      });
      break;
  }
  return true; // Keep message channel open for async response
});

// Auto-start monitoring when extension is installed or refreshed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' &&
      isSupportedUrl(tab.url)) {
    console.log('🐦 Twitter tab detected, starting monitoring...');
    injectContentScript(tabId);
  }
});

// Initialize extension
console.log('🚀 ChirpGuard background script loaded');
