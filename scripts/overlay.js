/**
 * VibeAI FoldSpace - Overlay Manager v1.1.0
 * Manages FoldSpace canvas, glyphs, and thread analysis toggle
 *
 * Privacy: All rendering occurs locally. No external resources loaded.
 */

// ═══════════════════════════════════════════════════════════════════════════
// FOLDSPACE CANVAS INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

class FoldSpaceCanvas {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.glyphs = [];
    this.animationFrame = null;
    this.isActive = false;
  }

  init() {
    // Only activate when a chat thread is open
    if (!this.detectActiveThread()) {
      console.log('[FoldSpace] No active thread detected, canvas inactive');
      return;
    }

    this.createCanvas();
    this.startAnimation();
    this.isActive = true;
    console.log('[FoldSpace] Canvas initialized');
  }

  detectActiveThread() {
    // Check if we're on a page with an active conversation
    const indicators = [
      'main [role="main"]',
      '.conversation-container',
      '.chat-thread',
      '[data-conversation-id]'
    ];

    return indicators.some(selector => document.querySelector(selector) !== null);
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'vibeai-foldspace-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.3;
      mix-blend-mode: screen;
    `;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ctx = this.canvas.getContext('2d');
    document.body.appendChild(this.canvas);

    // Handle window resize
    window.addEventListener('resize', () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });

    // Initialize glyphs
    this.initGlyphs();
  }

  initGlyphs() {
    const glyphCount = Math.floor(Math.random() * 5) + 3; // 3-7 glyphs

    for (let i = 0; i < glyphCount; i++) {
      this.glyphs.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 30 + 20,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.05 + 0.02,
        color: this.getRandomColor(),
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3
      });
    }
  }

  getRandomColor() {
    const colors = [
      'rgba(102, 179, 255, 0.6)',  // Blue
      'rgba(136, 192, 255, 0.5)',  // Light blue
      'rgba(74, 222, 128, 0.5)',   // Green
      'rgba(248, 113, 113, 0.5)'   // Red
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  drawGlyph(glyph) {
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(glyph.x, glyph.y);
    ctx.rotate(glyph.rotation);

    // Pulsing effect
    const pulse = Math.sin(glyph.pulsePhase) * 0.3 + 1;
    const size = glyph.size * pulse;

    ctx.strokeStyle = glyph.color;
    ctx.lineWidth = 2;

    // Draw abstract geometric glyph
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-size / 2, 0);
    ctx.lineTo(size / 2, 0);
    ctx.moveTo(0, -size / 2);
    ctx.lineTo(0, size / 2);
    ctx.stroke();

    ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.glyphs.forEach(glyph => {
      // Update position
      glyph.x += glyph.dx;
      glyph.y += glyph.dy;

      // Bounce off edges
      if (glyph.x < 0 || glyph.x > this.canvas.width) {
        glyph.dx *= -1;
      }
      if (glyph.y < 0 || glyph.y > this.canvas.height) {
        glyph.dy *= -1;
      }

      // Update rotation and pulse
      glyph.rotation += glyph.rotationSpeed;
      glyph.pulsePhase += glyph.pulseSpeed;

      // Draw
      this.drawGlyph(glyph);
    });

    if (this.isActive) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
    }
  }

  startAnimation() {
    this.isActive = true;
    this.animate();
  }

  stopAnimation() {
    this.isActive = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.canvas) {
      this.canvas.remove();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SETTINGS PANEL
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
          <p style="margin: 5px 0;">VibeAI FoldSpace v1.1.0</p>
          <p style="margin: 5px 0;">Beta expires: Nov 15, 2025</p>
          <a href="${chrome.runtime.getURL('docs/privacy.html')}" target="_blank" style="color: #66b3ff; text-decoration: underline;">Privacy</a> ·
          <a href="${chrome.runtime.getURL('docs/beta-agreement.html')}" target="_blank" style="color: #66b3ff; text-decoration: underline;">Agreement</a>
        </div>
      </div>
    `;

    document.body.appendChild(this.panel);
    this.isVisible = true;

    // Event listeners
    document.getElementById('vibeai-close-settings').addEventListener('click', () => this.hide());

    document.getElementById('vibeai-enable-thread-analysis').addEventListener('change', (e) => {
      chrome.storage.sync.set({ enableThreadAnalysis: e.target.checked });
    });

    document.getElementById('vibeai-enable-canvas').addEventListener('change', (e) => {
      chrome.storage.sync.set({ enableCanvas: e.target.checked });
      if (e.target.checked) {
        window.vibeaiFoldSpace?.init();
      } else {
        window.vibeaiFoldSpace?.stopAnimation();
      }
    });

    document.getElementById('vibeai-clear-data').addEventListener('click', () => {
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
      const threadAnalysisCheckbox = document.getElementById('vibeai-enable-thread-analysis');
      const canvasCheckbox = document.getElementById('vibeai-enable-canvas');

      if (threadAnalysisCheckbox) {
        threadAnalysisCheckbox.checked = result.enableThreadAnalysis !== false; // Default true
      }

      if (canvasCheckbox) {
        canvasCheckbox.checked = result.enableCanvas !== false; // Default true
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING ACTION BUTTON
// ═══════════════════════════════════════════════════════════════════════════

function createFloatingButton() {
  const button = document.createElement('button');
  button.id = 'vibeai-fab';
  button.innerHTML = '🌀';
  button.title = 'VibeAI FoldSpace Settings';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #66b3ff, #3a3a8a);
    border: none;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9998;
    transition: transform 0.3s, box-shadow 0.3s;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
    button.style.boxShadow = '0 6px 20px rgba(102, 179, 255, 0.4)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  });

  button.addEventListener('click', () => {
    window.vibeaiSettings.toggle();
  });

  document.body.appendChild(button);
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

function initOverlay() {
  console.log('[VibeAI Overlay] Initializing...');

  // Create global instances
  window.vibeaiFoldSpace = new FoldSpaceCanvas();
  window.vibeaiSettings = new SettingsPanel();

  // Load settings and start canvas if enabled
  chrome.storage.sync.get(['enableCanvas'], (result) => {
    if (result.enableCanvas !== false) { // Default true
      window.vibeaiFoldSpace.init();
    }
  });

  // Create floating action button
  createFloatingButton();

  console.log('[VibeAI Overlay] Initialization complete');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOverlay);
} else {
  initOverlay();
}
