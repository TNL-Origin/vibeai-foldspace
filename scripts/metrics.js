/**
 * VibeAI FoldSpace - Metrics Aggregator v1.1.2
 * Receives metrics from content script and updates popup UI
 * Privacy: All data is ephemeral, stored only in popup runtime
 */

// ═══════════════════════════════════════════════════════════════════════════
// METRICS STATE
// ═══════════════════════════════════════════════════════════════════════════

let metricsData = {
  platform: '—',
  analyzedCount: 0,
  avgTone: null,
  observerActive: false,
  lastUpdate: null
};

// ═══════════════════════════════════════════════════════════════════════════
// UI UPDATE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function updateMetricsUI() {
  const platformEl = document.getElementById('platform-name');
  const countEl = document.getElementById('msg-count');
  const toneEl = document.getElementById('avg-tone');
  const statusEl = document.getElementById('observer-status');

  if (platformEl) {
    platformEl.textContent = metricsData.platform || '—';
  }

  if (countEl) {
    countEl.textContent = metricsData.analyzedCount || 0;
  }

  if (toneEl) {
    if (metricsData.avgTone !== null && !isNaN(metricsData.avgTone)) {
      const score = metricsData.avgTone.toFixed(2);
      const color = metricsData.avgTone > 0 ? '#4ade80' : metricsData.avgTone < 0 ? '#f87171' : '#88c0ff';
      toneEl.textContent = score;
      toneEl.style.color = color;
    } else {
      toneEl.textContent = '—';
      toneEl.style.color = '#66b3ff';
    }
  }

  if (statusEl) {
    statusEl.textContent = metricsData.observerActive ? '✅ Active' : '❌ Inactive';
    statusEl.style.color = metricsData.observerActive ? '#4ade80' : '#f87171';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CHROME RUNTIME MESSAGE LISTENER
// ═══════════════════════════════════════════════════════════════════════════

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'VIBEAI_METRICS_UPDATE') {
    const { platform, analyzedCount, avgTone, observerActive } = message.payload;

    metricsData.platform = platform || '—';
    metricsData.analyzedCount = analyzedCount || 0;
    metricsData.avgTone = avgTone;
    metricsData.observerActive = observerActive || false;
    metricsData.lastUpdate = Date.now();

    updateMetricsUI();

    console.log('[Metrics] Updated:', metricsData);
    sendResponse({ success: true });
  }

  return true; // Keep channel open for async response
});

// ═══════════════════════════════════════════════════════════════════════════
// TOGGLE SWITCH HANDLER
// ═══════════════════════════════════════════════════════════════════════════

function initToggleSwitch() {
  const toggleInput = document.getElementById('show-metrics-toggle');

  if (!toggleInput) return;

  // Load saved preference
  chrome.storage.sync.get(['showMetricsPanel'], (result) => {
    toggleInput.checked = result.showMetricsPanel || false;
  });

  // Save preference on change
  toggleInput.addEventListener('change', (e) => {
    chrome.storage.sync.set({ showMetricsPanel: e.target.checked }, () => {
      console.log('[Metrics] Panel visibility toggled:', e.target.checked);

      // Notify content script to show/hide panel
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'TOGGLE_METRICS_PANEL',
            visible: e.target.checked
          });
        }
      });
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Metrics] Popup loaded, initializing UI...');

  initToggleSwitch();
  updateMetricsUI();

  // Request initial metrics from active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'REQUEST_METRICS' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('[Metrics] No content script active in this tab');
        } else if (response) {
          console.log('[Metrics] Received initial data:', response);
        }
      });
    }
  });
});
