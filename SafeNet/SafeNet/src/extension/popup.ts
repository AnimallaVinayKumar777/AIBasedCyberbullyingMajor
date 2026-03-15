// Popup script for ChirpGuard extension
import './types';

// Extension state
interface ExtensionState {
  isMonitoring: boolean;
  tweetsScanned: number;
  threatsDetected: number;
  actionsTaken: number;
  settings: {
    autoHide: boolean;
    soundAlerts: boolean;
    notifications: boolean;
  };
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  initializePopup();
});

// Initialize popup functionality
async function initializePopup() {
  // Load current state
  await loadExtensionState();

  // Set up event listeners
  setupEventListeners();

  // Update UI
  updateUI();
}

// Load extension state from storage
async function loadExtensionState(): Promise<void> {
  try {
    chrome.storage.local.get(['chirpguard_state'], (result) => {
      const state: ExtensionState = result.chirpguard_state || {
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

      // Update global state
      (window as any).extensionState = state;

      // Update UI elements
      updateStatusDisplay(state.isMonitoring);
      updateStatsDisplay(state);
      updateSettingsDisplay(state.settings);
    });
  } catch (error) {
    console.error('Failed to load extension state:', error);
  }
}

// Save extension state to storage
async function saveExtensionState(state: ExtensionState): Promise<void> {
  try {
    chrome.storage.local.set({ chirpguard_state: state }, () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to save state:', chrome.runtime.lastError);
      }
    });
  } catch (error) {
    console.error('Failed to save extension state:', error);
  }
}

// Set up event listeners for buttons and toggles
function setupEventListeners() {
  // Start monitoring button
  const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
  const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
  const scanBtn = document.getElementById('scanBtn') as HTMLButtonElement;

  startBtn?.addEventListener('click', () => {
    startMonitoring();
  });

  stopBtn?.addEventListener('click', () => {
    stopMonitoring();
  });

  scanBtn?.addEventListener('click', () => {
    scanCurrentPage();
  });

  // Settings toggles
  const autoHideToggle = document.getElementById('autoHideToggle') as HTMLInputElement;
  const soundToggle = document.getElementById('soundToggle') as HTMLInputElement;
  const notificationToggle = document.getElementById('notificationToggle') as HTMLInputElement;

  autoHideToggle?.addEventListener('change', () => {
    updateSetting('autoHide', autoHideToggle.checked);
  });

  soundToggle?.addEventListener('change', () => {
    updateSetting('soundAlerts', soundToggle.checked);
  });

  notificationToggle?.addEventListener('change', () => {
    updateSetting('notifications', notificationToggle.checked);
  });
}

// Start monitoring functionality
async function startMonitoring() {
  try {
    // Send message to background script
    chrome.runtime.sendMessage({ action: 'START_MONITORING' }, (response) => {
      if (response?.success) {
        updateState({ isMonitoring: true });
        showNotification('ChirpGuard monitoring started', 'info');
      } else {
        showNotification('Failed to start monitoring', 'error');
      }
    });
  } catch (error) {
    console.error('Failed to start monitoring:', error);
    showNotification('Failed to start monitoring', 'error');
  }
}

// Stop monitoring functionality
async function stopMonitoring() {
  try {
    // Send message to background script
    chrome.runtime.sendMessage({ action: 'STOP_MONITORING' }, (response) => {
      if (response?.success) {
        updateState({ isMonitoring: false });
        showNotification('ChirpGuard monitoring stopped', 'info');
      } else {
        showNotification('Failed to stop monitoring', 'error');
      }
    });
  } catch (error) {
    console.error('Failed to stop monitoring:', error);
    showNotification('Failed to stop monitoring', 'error');
  }
}

// Scan current page for tweets
async function scanCurrentPage() {
  try {
    // Get current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        // Send message to content script
        chrome.tabs.sendMessage(tabs[0].id, { action: 'SCAN_TWEETS' }, (response) => {
          if (response?.success) {
            showNotification('Page scan completed', 'info');
          } else {
            showNotification('Failed to scan page', 'error');
          }
        });
      }
    });
  } catch (error) {
    console.error('Failed to scan page:', error);
    showNotification('Failed to scan page', 'error');
  }
}

// Update setting value
function updateSetting(setting: keyof ExtensionState['settings'], value: boolean) {
  const state = (window as any).extensionState as ExtensionState;
  state.settings[setting] = value;
  (window as any).extensionState = state;

  saveExtensionState(state);
}

// Update state and save
function updateState(updates: Partial<ExtensionState>) {
  const state = (window as any).extensionState as ExtensionState;
  const newState = { ...state, ...updates };
  (window as any).extensionState = newState;

  saveExtensionState(newState);
  updateUI();
}

// Update UI elements
function updateUI() {
  const state = (window as any).extensionState as ExtensionState;

  updateStatusDisplay(state.isMonitoring);
  updateStatsDisplay(state);
  updateSettingsDisplay(state.settings);
  updateButtonStates(state.isMonitoring);
}

// Update status display
function updateStatusDisplay(isMonitoring: boolean) {
  const statusElement = document.getElementById('status');
  if (statusElement) {
    statusElement.textContent = isMonitoring ? '🟢 Monitoring Active' : '🔴 Monitoring Inactive';
    statusElement.className = `status ${isMonitoring ? 'active' : 'inactive'}`;
  }
}

// Update stats display
function updateStatsDisplay(state: ExtensionState) {
  const tweetsScannedElement = document.getElementById('tweetsScanned');
  const threatsDetectedElement = document.getElementById('threatsDetected');
  const actionsTakenElement = document.getElementById('actionsTaken');

  if (tweetsScannedElement) tweetsScannedElement.textContent = state.tweetsScanned.toString();
  if (threatsDetectedElement) threatsDetectedElement.textContent = state.threatsDetected.toString();
  if (actionsTakenElement) actionsTakenElement.textContent = state.actionsTaken.toString();
}

// Update settings display
function updateSettingsDisplay(settings: ExtensionState['settings']) {
  const autoHideToggle = document.getElementById('autoHideToggle') as HTMLInputElement;
  const soundToggle = document.getElementById('soundToggle') as HTMLInputElement;
  const notificationToggle = document.getElementById('notificationToggle') as HTMLInputElement;

  if (autoHideToggle) autoHideToggle.checked = settings.autoHide;
  if (soundToggle) soundToggle.checked = settings.soundAlerts;
  if (notificationToggle) notificationToggle.checked = settings.notifications;
}

// Update button states
function updateButtonStates(isMonitoring: boolean) {
  const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
  const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;

  if (startBtn) startBtn.disabled = isMonitoring;
  if (stopBtn) stopBtn.disabled = !isMonitoring;
}

// Show notification to user
function showNotification(message: string, type: 'info' | 'error' | 'success') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: bold;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    max-width: 200px;
    word-wrap: break-word;
  `;

  // Set colors based on type
  switch (type) {
    case 'success':
      notification.style.backgroundColor = '#10b981';
      notification.style.color = 'white';
      break;
    case 'error':
      notification.style.backgroundColor = '#ef4444';
      notification.style.color = 'white';
      break;
    case 'info':
    default:
      notification.style.backgroundColor = '#3b82f6';
      notification.style.color = 'white';
      break;
  }

  notification.textContent = message;

  // Add animation keyframes
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'UPDATE_STATS':
      if (message.stats) {
        updateState(message.stats);
      }
      break;
    case 'THREAT_DETECTED':
      if ((window as any).extensionState?.settings?.notifications) {
        showNotification('Cyberbullying content detected!', 'error');
      }
      if ((window as any).extensionState?.settings?.soundAlerts) {
        // Play notification sound (optional)
        // new Audio(chrome.runtime.getURL('notification.mp3')).play();
      }
      break;
  }
  sendResponse({ success: true });
  return true;
});

// Make functions available globally for debugging
(window as any).chirpGuardPopup = {
  startMonitoring,
  stopMonitoring,
  scanCurrentPage,
  updateState,
  showNotification
};