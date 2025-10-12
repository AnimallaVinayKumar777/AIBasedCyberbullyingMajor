// Background script for ChirpGuard Chrome extension
import '../extension/types';
import { detectCyberbullying, getPostModerationAction } from '../utils/cyberbullyingDetection';

interface TweetData {
  id: string;
  content: string;
  author: string;
  timestamp: number;
  isProcessed?: boolean;
  moderationResult?: any;
}

// Store for processed tweets to avoid reprocessing
const processedTweets = new Map<string, TweetData>();
let isMonitoring = false;

// Start monitoring Twitter feeds
function startMonitoring() {
  if (isMonitoring) return;

  isMonitoring = true;
  console.log('🛡️ ChirpGuard monitoring started');

  // Check for new tweets every 2 seconds
  setInterval(() => {
    scanForTweets();
  }, 2000);
}

// Stop monitoring
function stopMonitoring() {
  isMonitoring = false;
  console.log('🛡️ ChirpGuard monitoring stopped');
}

// Scan Twitter DOM for tweets
function scanForTweets() {
  // Send message to content script to scan for tweets
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'SCAN_TWEETS'
      }).catch(error => {
        console.log('No content script found, injecting...');
        injectContentScript(tabs[0].id);
      });
    }
  });
}

// Inject content script into Twitter tab
function injectContentScript(tabId: number) {
  chrome.scripting.executeScript({
    target: { tabId },
    files: ['dist/content.js']
  }).then(() => {
    console.log('💉 Content script injected');
    // Start monitoring after injection
    setTimeout(() => startMonitoring(), 1000);
  }).catch(error => {
    console.error('Failed to inject content script:', error);
  });
}

// Process tweet content for cyberbullying
function processTweetContent(content: string): any {
  console.log(`🔍 Analyzing tweet: "${content.substring(0, 50)}..."`);

  const cyberbullyingResult = detectCyberbullying(content);
  const moderationAction = getPostModerationAction(content);

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
      const result = processTweetContent(message.content);
      sendResponse(result);
      break;

    case 'GET_STATS':
      const stats = {
        totalProcessed: processedTweets.size,
        bullyTweets: Array.from(processedTweets.values()).filter(t => t.moderationResult?.isCyberbullying).length,
        hiddenTweets: Array.from(processedTweets.values()).filter(t => t.moderationResult?.shouldHide).length,
        flaggedTweets: Array.from(processedTweets.values()).filter(t => t.moderationResult?.shouldFlag).length
      };
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
      (tab.url?.includes('twitter.com') || tab.url?.includes('x.com'))) {
    console.log('🐦 Twitter tab detected, starting monitoring...');
    injectContentScript(tabId);
  }
});

// Initialize extension
console.log('🚀 ChirpGuard background script loaded');