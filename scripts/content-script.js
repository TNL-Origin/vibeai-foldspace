/**
 * VibeAI FoldSpace - Content Script v1.1.2
 * Thread Selector Matrix + Local Tone Analysis + Page-Wide Consent
 * Privacy: All analysis occurs in-memory, zero external calls
 */

// ═══════════════════════════════════════════════════════════════════════════
// BETA EXPIRY CHECK
// ═══════════════════════════════════════════════════════════════════════════

const BETA_EXPIRY = new Date('2025-11-15');
if (new Date() > BETA_EXPIRY) {
  alert('VibeAI FoldSpace Beta has expired. Please check for updates.');
  throw new Error('[VibeAI] Beta expired');
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLESHEET INJECTION
// ═══════════════════════════════════════════════════════════════════════════

function ensureStyles() {
  if (document.getElementById('vibeai-styles')) return;
  const link = document.createElement('link');
  link.id = 'vibeai-styles';
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('styles/overlay.css');
  document.head.appendChild(link);
  console.log('[VibeAI] Styles injected');
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSENT MODAL (PAGE-WIDE BLOCKER)
// ═══════════════════════════════════════════════════════════════════════════

function showConsentModal() {
  ensureStyles();
  if (document.getElementById('vibeai-consent-modal')) return;

  console.log('[VibeAI] Showing consent modal');

  const modal = document.createElement('div');
  modal.id = 'vibeai-consent-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.88);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483647;
  `;

  modal.innerHTML = `
    <div class="vibeai-consent-card">
      <h2>🌀 VibeAI FoldSpace Beta</h2>
      <p style="font-size: 15px; opacity: 0.9; margin-bottom: 16px;">
        All analysis happens <strong>locally in your browser</strong>. No data is sent anywhere.
      </p>

      <div class="vibeai-consent-scroll">
        <h4>What We Do:</h4>
        <ul>
          <li>✅ Read visible text in the current chat view</li>
          <li>✅ Local-only tone & code highlighting</li>
          <li>✅ UI settings stored via Chrome Sync</li>
        </ul>

        <h4>What We DON'T Do:</h4>
        <ul>
          <li>❌ Send any data to external servers</li>
          <li>❌ Store message content beyond current session</li>
          <li>❌ Track or profile your conversations</li>
        </ul>

        <p style="margin-top: 16px; font-size: 13px; opacity: 0.8;">
          Full details:
          <a class="vibeai-link" href="https://tnl-origin.github.io/vibeai-foldspace/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a> ·
          <a class="vibeai-link" href="https://tnl-origin.github.io/vibeai-foldspace/beta-agreement.html" target="_blank" rel="noopener noreferrer">Beta Agreement</a>
        </p>
      </div>

      <label class="vibeai-consent-check">
        <input id="vibeai-consent-checkbox" type="checkbox">
        <span>I have read and agree to the terms above</span>
      </label>

      <button id="vibeai-consent-accept" disabled>Accept and Continue</button>
    </div>
  `;

  document.body.appendChild(modal);

  const checkbox = modal.querySelector('#vibeai-consent-checkbox');
  const acceptBtn = modal.querySelector('#vibeai-consent-accept');

  checkbox.addEventListener('change', () => {
    acceptBtn.disabled = !checkbox.checked;
  });

  acceptBtn.addEventListener('click', () => {
    if (!checkbox.checked) return;

    chrome.storage.sync.set({ consentGiven: true }, () => {
      console.log('[VibeAI] Consent accepted and token written');
      modal.remove();
      startFoldSpace();
    });
  });

  // Handle link clicks
  modal.querySelectorAll('.vibeai-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(link.href, '_blank', 'noopener,noreferrer');
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM DETECTION & SELECTOR MATRIX
// ═══════════════════════════════════════════════════════════════════════════

const SELECTORS = {
  chatgpt: [
    "[data-message-id]",
    ".flex.flex-col.items-center.text-sm",
    ".group.w-full",
    "main [role='presentation']"
  ],
  claude: [
    ".conversation-container",
    ".chat__messages",
    "[data-testid='conversation']",
    "main .contents"
  ],
  gemini: [
    "c-wiz[data-message-id]",
    "[role='listitem']",
    ".conversation-container",
    "message-content"
  ],
  copilot: [
    ".copilot-chat-container",
    ".chat-message-list",
    "[data-content='conversation']",
    ".thread-container"
  ]
};

function detectPlatform() {
  const hostname = window.location.hostname;

  if (hostname.includes('chatgpt.com') || hostname.includes('openai.com')) {
    return 'chatgpt';
  }
  if (hostname.includes('claude.ai')) {
    return 'claude';
  }
  if (hostname.includes('gemini.google.com')) {
    return 'gemini';
  }
  if (hostname.includes('copilot.microsoft.com') || hostname.includes('m365.cloud.microsoft.com')) {
    return 'copilot';
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// TONE ANALYSIS ENGINE (LOCAL ONLY)
// ═══════════════════════════════════════════════════════════════════════════

const TONE_KEYWORDS = {
  joy: ['happy', 'great', 'awesome', 'excellent', 'love', 'wonderful', 'amazing', 'fantastic', '😊', '🎉', '✨'],
  gratitude: ['thank', 'thanks', 'appreciate', 'grateful', 'thankful', '🙏'],
  anger: ['angry', 'furious', 'mad', 'hate', 'terrible', 'awful', 'worst', '😡', '💢'],
  frustration: ['frustrated', 'annoying', 'ugh', 'argh', 'why', 'broken', 'failed', 'error', '😤'],
  concern: ['worried', 'concerned', 'anxious', 'unsure', 'problem', 'issue', 'help', '😟'],
  excitement: ['excited', 'wow', 'omg', 'incredible', 'yes!', 'finally', '🚀', '🔥', '💪']
};

function analyzeTone(text) {
  if (!text || text.length < 10) return 0; // Neutral for short text

  const lowerText = text.toLowerCase();
  let score = 0;

  // Positive tones (+1)
  if (TONE_KEYWORDS.joy.some(kw => lowerText.includes(kw))) score += 1;
  if (TONE_KEYWORDS.gratitude.some(kw => lowerText.includes(kw))) score += 1;
  if (TONE_KEYWORDS.excitement.some(kw => lowerText.includes(kw))) score += 1;

  // Negative tones (-1)
  if (TONE_KEYWORDS.anger.some(kw => lowerText.includes(kw))) score -= 1;
  if (TONE_KEYWORDS.frustration.some(kw => lowerText.includes(kw))) score -= 0.5;
  if (TONE_KEYWORDS.concern.some(kw => lowerText.includes(kw))) score -= 0.3;

  // Normalize to -1 to +1 range
  return Math.max(-1, Math.min(1, score / 2));
}

function getToneColor(score) {
  if (score > 0.3) {
    // Positive: blue/green gradient
    return `rgba(102, 179, 255, ${0.1 + score * 0.2})`;
  } else if (score < -0.3) {
    // Negative: red gradient
    return `rgba(248, 113, 113, ${0.1 + Math.abs(score) * 0.2})`;
  }
  // Neutral: subtle gray
  return 'rgba(200, 200, 200, 0.05)';
}

// ═══════════════════════════════════════════════════════════════════════════
// CODE DETECTION
// ═══════════════════════════════════════════════════════════════════════════

function hasCodeBlock(element) {
  const codeElements = element.querySelectorAll('pre, code, [class*="code"], [class*="monospace"]');
  return codeElements.length > 0;
}

function isMonospaceFont(element) {
  const style = window.getComputedStyle(element);
  const fontFamily = style.fontFamily.toLowerCase();
  return fontFamily.includes('mono') || fontFamily.includes('courier') || fontFamily.includes('consolas');
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE ANALYSIS & HIGHLIGHTING
// ═══════════════════════════════════════════════════════════════════════════

const analyzedMessages = new WeakSet();
let pendingAnalysis = [];
let analysisScheduled = false;
const MAX_NODES_PER_TICK = 100;

// Metrics tracking
let toneScores = [];
let currentPlatform = null;

function isVisible(element) {
  if (!element || !element.getBoundingClientRect) return false;
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0'
  );
}

function analyzeMessage(messageElement) {
  if (analyzedMessages.has(messageElement)) return;
  if (!isVisible(messageElement)) return;

  console.log('🧠 Analyzing message:', messageElement);

  // Extract text content
  const text = messageElement.textContent || '';

  // Analyze tone
  const toneScore = analyzeTone(text);
  const toneColor = getToneColor(toneScore);

  // Apply tone overlay
  if (!messageElement.style.position || messageElement.style.position === 'static') {
    messageElement.style.position = 'relative';
  }

  // Create or update overlay
  let overlay = messageElement.querySelector('.vibeai-tone-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'vibeai-tone-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      border-radius: 8px;
      transition: background-color 0.3s ease;
      z-index: 0;
    `;
    messageElement.insertBefore(overlay, messageElement.firstChild);
  }

  overlay.style.backgroundColor = toneColor;
  overlay.setAttribute('data-tone-score', toneScore.toFixed(2));

  // Detect and highlight code blocks
  if (hasCodeBlock(messageElement)) {
    const codeBlocks = messageElement.querySelectorAll('pre, code');
    codeBlocks.forEach(block => {
      if (!block.classList.contains('vibeai-code-highlighted')) {
        block.classList.add('vibeai-code-highlighted');
        block.setAttribute('data-vibeai-code', 'true');
        console.log('✨ Code block detected and highlighted');
      }
    });
  }

  analyzedMessages.add(messageElement);
  toneScores.push(toneScore); // Track for metrics
  console.log('✨ Overlay applied - Tone score:', toneScore.toFixed(2));
}

function processBatch() {
  const batch = pendingAnalysis.splice(0, MAX_NODES_PER_TICK);
  batch.forEach(node => analyzeMessage(node));

  if (pendingAnalysis.length > 0) {
    requestAnimationFrame(processBatch);
  } else {
    analysisScheduled = false;
    // Send metrics update after batch completes
    sendMetricsUpdate();
  }
}

function sendMetricsUpdate() {
  const avgTone = toneScores.length > 0
    ? toneScores.reduce((sum, score) => sum + score, 0) / toneScores.length
    : null;

  const metricsPayload = {
    type: 'VIBEAI_METRICS_UPDATE',
    payload: {
      platform: currentPlatform || '—',
      analyzedCount: toneScores.length,
      avgTone: avgTone,
      observerActive: observer !== null
    }
  };

  // Send to background/popup via runtime
  chrome.runtime.sendMessage(metricsPayload, (response) => {
    if (chrome.runtime.lastError) {
      console.log('[Metrics] Could not send update:', chrome.runtime.lastError.message);
    }
  });

  console.log('[Metrics] Sent update:', metricsPayload.payload);
}

function scheduleAnalysis(nodes) {
  pendingAnalysis.push(...nodes);

  if (!analysisScheduled) {
    analysisScheduled = true;
    setTimeout(() => {
      requestAnimationFrame(processBatch);
    }, 250); // 250ms debounce
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// THREAD CONTAINER DETECTION
// ═══════════════════════════════════════════════════════════════════════════

let retryCount = 0;
const MAX_RETRIES = 10;
let observer = null;

function findThreadContainer() {
  const platform = detectPlatform();

  if (!platform) {
    console.warn('[VibeAI] Unknown platform, using fallback selectors');
    const fallback = document.querySelector('main, [role="main"], .conversation, .chat');
    if (fallback) {
      console.log('✅ Thread container found on unknown platform (fallback)');
      return fallback;
    }
    return null;
  }

  const selectors = SELECTORS[platform];

  for (const selector of selectors) {
    const container = document.querySelector(selector);
    if (container) {
      console.log(`✅ Thread container found on ${platform} using selector: ${selector}`);
      return container;
    }
  }

  return null;
}

function observeThreadContent() {
  const threadContainer = findThreadContainer();

  if (!threadContainer) {
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.warn(`[VibeAI] Thread container not found, retrying in 2s… (${retryCount}/${MAX_RETRIES})`);
      setTimeout(observeThreadContent, 2000);
    } else {
      console.error('[VibeAI] Failed to find thread container after max retries.');
    }
    return;
  }

  currentPlatform = detectPlatform();
  console.log(`✅ VibeAI FoldSpace thread container detected on ${currentPlatform || 'unknown platform'}`);

  // Analyze existing messages
  const existingMessages = threadContainer.querySelectorAll('[class*="message"], [data-message-id], [role="listitem"]');
  if (existingMessages.length > 0) {
    console.log(`🔍 Found ${existingMessages.length} existing messages, analyzing...`);
    scheduleAnalysis(Array.from(existingMessages));
  }

  // Start observing new messages
  observer = new MutationObserver((mutations) => {
    const newNodes = [];

    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Element node
          // Check if it's a message or contains messages
          if (node.matches && node.matches('[class*="message"], [data-message-id], [role="listitem"]')) {
            newNodes.push(node);
          } else {
            const messages = node.querySelectorAll('[class*="message"], [data-message-id], [role="listitem"]');
            newNodes.push(...Array.from(messages));
          }
        }
      });
    });

    if (newNodes.length > 0) {
      console.log(`🔍 DOM mutation detected: ${newNodes.length} new message(s)`);
      scheduleAnalysis(newNodes);
    }
  });

  observer.observe(threadContainer, {
    childList: true,
    subtree: true
  });

  console.log('👁️ MutationObserver active - watching for new messages');
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSENT GATE & FOLDSPACE INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

function gateByConsent() {
  chrome.storage.sync.get(['consentGiven', 'enableThreadAnalysis'], (res) => {
    console.log('[VibeAI] consentGiven =', res.consentGiven);
    console.log('[VibeAI] enableThreadAnalysis =', res.enableThreadAnalysis);

    if (!res.consentGiven) {
      showConsentModal();
    } else if (res.enableThreadAnalysis === false) {
      console.log('[VibeAI] Thread analysis disabled in settings');
    } else {
      startFoldSpace();
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// REACT-SAFE HOST (prevents ChatGPT DOM purge)
// ═══════════════════════════════════════════════════════════════════════════

function ensureOverlayHost() {
  if (document.getElementById('vibeai-overlay-host')) return;

  const host = document.createElement('div');
  host.id = 'vibeai-overlay-host';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<style>
    :host { all: initial; }
  </style>`;
  document.documentElement.appendChild(host);

  window.vibeaiHostShadow = shadow;
  console.log('[VibeAI] 🛡️ Overlay host created (React-safe)');
}

function startFoldSpace() {
  console.log('[VibeAI] Starting FoldSpace…');
  ensureStyles();
  ensureOverlayHost(); // 🛡️ React-safe mount point

  // Initialize UI components directly (no overlay.js injection)
  initializeHUD();
  createFloatingButton(); // 🌀 Add this line

  // Send activation signal to background
  chrome.runtime.sendMessage({ type: 'activateFoldSpace' }, () => {
    console.log('🌀 FoldSpace activation signal sent');
  });

  // Start observing thread content
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeThreadContent);
  } else {
    observeThreadContent();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HUD COMPONENTS (CONSOLIDATED FROM OVERLAY.JS)
// ═══════════════════════════════════════════════════════════════════════════

class SettingsPanel {
  constructor() {
    this.panel = null;
    this.isVisible = false;
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show() {
    if (this.panel) {
      this.panel.style.display = 'block';
      this.isVisible = true;
      return;
    }

    this.createPanel();
    this.loadSettings();
  }

  hide() {
    if (this.panel) {
      this.panel.style.display = 'none';
      this.isVisible = false;
    }
  }

  createPanel() {
    this.panel = document.createElement('div');
    this.panel.id = 'vibeai-settings-panel';
    this.panel.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #1e1e2e, #3a3a8a); border-radius: 12px; padding: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); z-index: 10000; min-width: 300px; color: #eee; font-family: 'Inter', sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; color: #66b3ff;">FoldSpace Settings</h3>
          <button id="vibeai-close-settings" style="background: none; border: none; color: #eee; font-size: 20px; cursor: pointer;">&times;</button>
        </div>

        <div style="margin-bottom: 15px;">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="vibeai-enable-thread-analysis" style="width: 18px; height: 18px; cursor: pointer;">
            <span>Enable Thread Analysis</span>
          </label>
          <p style="font-size: 12px; opacity: 0.7; margin: 5px 0 0 28px;">Analyze visible messages for tone and code detection</p>
        </div>

        <div style="margin-bottom: 15px;">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="vibeai-enable-canvas" style="width: 18px; height: 18px; cursor: pointer;">
            <span>Enable FoldSpace Canvas</span>
          </label>
          <p style="font-size: 12px; opacity: 0.7; margin: 5px 0 0 28px;">Show animated glyphs overlay</p>
        </div>

        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.2); margin: 15px 0;">

        <div>
          <button id="vibeai-clear-data" style="width: 100%; padding: 10px; background: rgba(248, 113, 113, 0.2); border: 1px solid #f87171; border-radius: 6px; color: #f87171; cursor: pointer; font-size: 14px;">
            Clear All Extension Data
          </button>
          <p style="font-size: 11px; opacity: 0.6; margin: 8px 0 0 0;">This will reset all preferences and remove consent status</p>
        </div>

        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.2); margin: 15px 0;">

        <div style="font-size: 12px; opacity: 0.7; text-align: center;">
          <p style="margin: 5px 0;">VibeAI FoldSpace v1.1.2</p>
          <p style="margin: 5px 0;">Beta expires: Nov 15, 2025</p>
          <a href="${chrome.runtime.getURL('docs/privacy.html')}" target="_blank" style="color: #66b3ff; text-decoration: underline;">Privacy</a> ·
          <a href="${chrome.runtime.getURL('docs/beta-agreement.html')}" target="_blank" style="color: #66b3ff; text-decoration: underline;">Agreement</a>
        </div>
      </div>
    `;

    (window.vibeaiHostShadow || document.body).appendChild(this.panel);
    this.isVisible = true;

    // Event listeners
    this.panel.querySelector('#vibeai-close-settings').addEventListener('click', () => this.hide());

    this.panel.querySelector('#vibeai-enable-thread-analysis').addEventListener('change', (e) => {
      chrome.storage.sync.set({ enableThreadAnalysis: e.target.checked });
    });

    this.panel.querySelector('#vibeai-enable-canvas').addEventListener('change', (e) => {
      chrome.storage.sync.set({ enableCanvas: e.target.checked });
      if (e.target.checked) {
        window.vibeaiFoldSpace?.init();
      } else {
        window.vibeaiFoldSpace?.stopAnimation();
      }
    });

    this.panel.querySelector('#vibeai-clear-data').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all VibeAI FoldSpace data? This will reset all settings and remove consent status.')) {
        chrome.storage.sync.clear(() => {
          alert('All extension data has been cleared. The page will now reload.');
          window.location.reload();
        });
      }
    });
  }

  loadSettings() {
    chrome.storage.sync.get(['enableThreadAnalysis', 'enableCanvas'], (result) => {
      const threadAnalysisCheckbox = this.panel?.querySelector('#vibeai-enable-thread-analysis');
      const canvasCheckbox = this.panel?.querySelector('#vibeai-enable-canvas');

      if (threadAnalysisCheckbox) {
        threadAnalysisCheckbox.checked = result.enableThreadAnalysis !== false;
      }

      if (canvasCheckbox) {
        canvasCheckbox.checked = result.enableCanvas !== false;
      }
    });
  }
}

class MetricsPanel {
  constructor() {
    this.panel = null;
    this.isVisible = false;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
  }

  create() {
    if (this.panel) return;

    this.panel = document.createElement('div');
    this.panel.id = 'vibeai-metrics-panel';
    this.panel.innerHTML = `
      <div class="metrics-panel-header">
        <span>📊 VibeAI Metrics</span>
        <button class="metrics-close-btn">&times;</button>
      </div>
      <div class="metrics-panel-body">
        <div class="metric-row">
          <span>Platform:</span>
          <span id="metric-platform">—</span>
        </div>
        <div class="metric-row">
          <span>Messages:</span>
          <span id="metric-count">0</span>
        </div>
        <div class="metric-row">
          <span>Avg Tone:</span>
          <span id="metric-tone">—</span>
        </div>
        <div class="metric-row">
          <span>Observer:</span>
          <span id="metric-status">Inactive</span>
        </div>
      </div>
    `;

    (window.vibeaiHostShadow || document.body).appendChild(this.panel);

    // Event listeners
    const closeBtn = this.panel.querySelector('.metrics-close-btn');
    closeBtn.addEventListener('click', () => this.hide());

    const header = this.panel.querySelector('.metrics-panel-header');
    header.addEventListener('mousedown', (e) => this.startDrag(e));
    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('mouseup', () => this.stopDrag());

    this.isVisible = true;
  }

  show() {
    if (!this.panel) this.create();
    this.panel.style.display = 'block';
    this.isVisible = true;
  }

  hide() {
    if (this.panel) {
      this.panel.style.display = 'none';
      this.isVisible = false;
    }
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  updateMetrics(data) {
    if (!this.panel) return;

    const { platform, analyzedCount, avgTone, observerActive } = data;

    const platformEl = this.panel.querySelector('#metric-platform');
    const countEl = this.panel.querySelector('#metric-count');
    const toneEl = this.panel.querySelector('#metric-tone');
    const statusEl = this.panel.querySelector('#metric-status');

    if (platformEl) platformEl.textContent = platform || '—';
    if (countEl) countEl.textContent = analyzedCount || 0;

    if (toneEl && avgTone !== null && !isNaN(avgTone)) {
      const score = avgTone.toFixed(2);
      toneEl.textContent = score;
      toneEl.style.color = avgTone > 0 ? '#4ade80' : avgTone < 0 ? '#f87171' : '#66b3ff';
    } else if (toneEl) {
      toneEl.textContent = '—';
      toneEl.style.color = '#66b3ff';
    }

    if (statusEl) {
      statusEl.textContent = observerActive ? 'Active' : 'Inactive';
      statusEl.style.color = observerActive ? '#4ade80' : '#f87171';
    }
  }

  startDrag(e) {
    if (e.target.classList.contains('metrics-close-btn')) return;
    this.isDragging = true;
    this.dragOffset.x = e.clientX - this.panel.offsetLeft;
    this.dragOffset.y = e.clientY - this.panel.offsetTop;
    this.panel.style.cursor = 'grabbing';
  }

  drag(e) {
    if (!this.isDragging) return;
    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;
    this.panel.style.left = `${x}px`;
    this.panel.style.top = `${y}px`;
    this.panel.style.right = 'auto';
    this.panel.style.bottom = 'auto';
  }

  stopDrag() {
    this.isDragging = false;
    if (this.panel) {
      this.panel.style.cursor = 'grab';
    }
  }
}

function initializeHUD() {
  console.log('[VibeAI] Initializing HUD components...');

  // Create global instances
  window.vibeaiSettings = new SettingsPanel();
  window.vibeaiMetrics = new MetricsPanel();

  console.log('[VibeAI] HUD initialization complete');
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING ACTION BUTTON (REACT-SAFE)
// ═══════════════════════════════════════════════════════════════════════════

function createFloatingButton() {
  // Prevent duplicates
  if (document.getElementById("vibeai-button-host")) return;

  // Create a host attached to <html>, outside React's managed <body>
  const host = document.createElement("div");
  host.id = "vibeai-button-host";
  document.documentElement.appendChild(host);

  // Shadow DOM isolation so React / site CSS can't touch it
  const shadow = host.attachShadow({ mode: "open" });

  // Button styles
  const style = document.createElement("style");
  style.textContent = `
    #vibeai-fab {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #66b3ff, #3a3a8a);
      border: none;
      color: white;
      font-size: 26px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 999999;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    #vibeai-fab:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(102,179,255,0.4);
    }

    #vibeai-fab:active {
      transform: scale(0.95);
      box-shadow: 0 0 20px rgba(102,179,255,0.6);
    }
  `;
  shadow.appendChild(style);

  // Button element
  const button = document.createElement("button");
  button.id = "vibeai-fab";
  button.innerHTML = "🌀";
  button.title = "VibeAI FoldSpace";
  shadow.appendChild(button);

  // Click handler toggles settings panel
  button.addEventListener("click", () => {
    try {
      window.vibeaiSettings?.toggle();
    } catch (err) {
      console.error("[VibeAI] Error toggling settings:", err);
    }
  });

  console.log("[VibeAI] 🌀 Floating button created (React-safe)");
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE HANDLERS (FROM POPUP)
// ═══════════════════════════════════════════════════════════════════════════

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'REQUEST_METRICS') {
    sendMetricsUpdate();
    sendResponse({ success: true });
  }

  if (message.type === 'TOGGLE_METRICS_PANEL') {
    // Toggle metrics panel directly (no postMessage needed)
    window.vibeaiMetrics?.toggle();
    sendResponse({ success: true });
  }

  return true;
});

// ═══════════════════════════════════════════════════════════════════════════
// ENTRY POINT: Gate by Consent
// ═══════════════════════════════════════════════════════════════════════════

console.log('[VibeAI] Content script loaded');
gateByConsent();
