# VibeAI FoldSpace v1.1.0 — Manual Verification Test Plan

**Version:** 1.1.0 Beta
**Date:** October 5, 2025
**Tester:** _[Your Name]_

---

## 🎯 Test Objectives

1. Verify consent modal appears and functions correctly
2. Confirm thread-level semantic analysis works on all supported platforms
3. Validate tone detection and color mapping accuracy
4. Test code detection for inline and block code
5. Ensure settings panel toggles work correctly
6. Verify no external network calls are made
7. Confirm privacy compliance (no data transmission)
8. Test beta expiration handling

---

## ✅ Pre-Test Setup

### Environment Requirements

- [ ] Chrome/Edge/Brave browser (latest version)
- [ ] Developer mode enabled in `chrome://extensions`
- [ ] Extension loaded from unpacked source
- [ ] Access to at least 2 AI chat platforms (ChatGPT, Claude, Gemini, or Copilot)

### Initial State

- [ ] Extension installed successfully
- [ ] No previous beta consent given (clear storage if needed)
- [ ] Browser DevTools ready for network monitoring

---

## 📋 Test Cases

### **Test 1: Consent Modal**

**Objective:** Verify consent modal appears on first use and saves consent properly.

| Step | Action | Expected Result | ✓/✗ | Notes |
|------|--------|----------------|-----|-------|
| 1.1 | Navigate to ChatGPT or Claude | Consent modal appears immediately | | |
| 1.2 | Click "Decline" | Modal closes, extension does not initialize | | |
| 1.3 | Reload page | Modal appears again (consent not saved) | | |
| 1.4 | Click "I Accept and Understand" | Modal closes, extension initializes | | |
| 1.5 | Reload page | Modal does NOT appear (consent saved) | | |
| 1.6 | Check Chrome storage (`chrome://extensions` > Inspect views) | `betaConsentGiven: true` exists | | |

**Pass Criteria:** Consent flow works correctly, prevents usage until accepted, persists across reloads.

---

### **Test 2: Platform Detection**

**Objective:** Verify extension detects and activates on all supported platforms.

| Platform | URL | Detected? | Canvas Active? | ✓/✗ | Notes |
|----------|-----|-----------|----------------|-----|-------|
| ChatGPT | chat.openai.com | | | | |
| ChatGPT Alt | chatgpt.com | | | | |
| Claude | claude.ai | | | | |
| Gemini | gemini.google.com | | | | |
| Copilot | copilot.microsoft.com | | | | |
| Copilot M365 | m365.cloud.microsoft.com | | | | |

**Pass Criteria:** Extension activates on all platforms, console shows platform name.

---

### **Test 3: Tone Detection & Color Mapping**

**Objective:** Test local tone analysis with various emotional keywords.

| Test Message | Expected Tone | Expected Color | Actual Color | ✓/✗ | Notes |
|--------------|---------------|----------------|--------------|-----|-------|
| "This is amazing! Thank you so much!" | joy/gratitude | Green | | | |
| "I'm frustrated with this error" | frustration | Red | | | |
| "This doesn't work at all, wtf" | anger | Red | | | |
| "How do I implement a function?" | neutral | Blue | | | |
| "Great work, very helpful!" | joy | Green | | | |
| "I'm worried about this approach" | concern | Red | | | |

**Steps:**
1. Open a chat thread on any platform
2. Send test messages
3. Observe right-side accent color on message elements
4. Hover to view tooltip (should show "Tone: [emotion]")

**Pass Criteria:** Color mapping matches expected tone, tooltip displays correctly.

---

### **Test 4: Code Detection**

**Objective:** Verify code block and inline code detection works.

| Test Message | Has Code? | Expected Border | Tooltip Shows Code? | ✓/✗ | Notes |
|--------------|-----------|-----------------|---------------------|-----|-------|
| "Here's a function: `console.log('hello')`" | Yes (inline) | Blue left border | Yes | | |
| "Try this:\n```js\nfunction test() {}\n```" | Yes (block) | Blue left border | Yes | | |
| "Plain text with no code" | No | No border | No | | |
| "function myFunction() { return true; }" | Yes (detected) | Blue left border | Yes | | |

**Steps:**
1. Send messages with various code formats
2. Check for `data-vibeai-code="true"` attribute
3. Verify blue left border appears
4. Hover to confirm tooltip shows "Code: Yes"

**Pass Criteria:** Code detection works for inline, block, and function syntax.

---

### **Test 5: Settings Panel**

**Objective:** Test settings panel UI and toggle functionality.

| Step | Action | Expected Result | ✓/✗ | Notes |
|------|--------|----------------|-----|-------|
| 5.1 | Click 🌀 floating button (bottom-right) | Settings panel opens | | |
| 5.2 | Toggle "Enable Thread Analysis" OFF | All tone overlays disappear | | |
| 5.3 | Reload page | Overlays remain disabled | | |
| 5.4 | Toggle "Enable Thread Analysis" ON | Overlays reappear on messages | | |
| 5.5 | Toggle "Enable FoldSpace Canvas" OFF | Animated glyphs disappear | | |
| 5.6 | Toggle "Enable FoldSpace Canvas" ON | Glyphs reappear | | |
| 5.7 | Click "Clear All Extension Data" > Confirm | Settings reset, page reloads, consent modal reappears | | |

**Pass Criteria:** All toggles work, settings persist across reloads, clear data works.

---

### **Test 6: MutationObserver (Dynamic Content)**

**Objective:** Verify extension scans new messages as they appear.

| Step | Action | Expected Result | ✓/✗ | Notes |
|------|--------|----------------|-----|-------|
| 6.1 | Open existing chat thread | Existing messages have overlays | | |
| 6.2 | Send new message with positive tone | New message gets green overlay within 500ms | | |
| 6.3 | AI responds with code snippet | Response gets blue code border | | |
| 6.4 | Navigate to different thread | Old overlays cleared, new thread scanned | | |

**Pass Criteria:** MutationObserver detects new messages, applies overlays dynamically.

---

### **Test 7: Privacy Compliance (Network Monitoring)**

**Objective:** Confirm NO external network calls are made by the extension.

| Step | Action | Expected Result | ✓/✗ | Notes |
|------|--------|----------------|-----|-------|
| 7.1 | Open Chrome DevTools > Network tab | | | |
| 7.2 | Filter by extension ID or "vibeai" | | | |
| 7.3 | Clear network log | | | |
| 7.4 | Navigate to ChatGPT | Only platform's own requests visible | | |
| 7.5 | Send messages with tone keywords | No new extension-initiated requests | | |
| 7.6 | Check "Initiator" column | No requests from content-script.js or overlay.js | | |
| 7.7 | Check Application > Storage | Only Chrome storage (sync/local), no IndexedDB | | |

**Pass Criteria:** ZERO network requests initiated by extension. Only Chrome storage used.

---

### **Test 8: Beta Expiration**

**Objective:** Verify beta expiration date handling.

| Step | Action | Expected Result | ✓/✗ | Notes |
|------|--------|----------------|-----|-------|
| 8.1 | Check `background.js` expiration date | Set to `2025-11-15` | | |
| 8.2 | Temporarily change date to `2025-10-01` in code | | | |
| 8.3 | Reload extension | Extension badge shows "EXP" in red | | |
| 8.4 | Navigate to platform | Expiration notice should appear (if implemented) | | |
| 8.5 | Restore original date | Badge clears | | |

**Pass Criteria:** Expiration logic works, warns users when beta expires.

---

### **Test 9: Performance & Stability**

**Objective:** Test extension performance under normal usage.

| Metric | Measurement | Acceptable Range | Actual | ✓/✗ | Notes |
|--------|-------------|------------------|--------|-----|-------|
| Initial load time | Time from page load to first overlay | < 2 seconds | | | |
| Message scan latency | Time from new message to overlay | < 500ms | | | |
| CPU usage (DevTools > Performance) | Average during active chat | < 5% | | | |
| Memory footprint (Task Manager) | Extension process memory | < 50 MB | | | |
| No console errors | Check DevTools > Console | 0 errors | | | |

**Pass Criteria:** Smooth performance, no lag, no memory leaks, no console errors.

---

### **Test 10: Cross-Browser Compatibility**

**Objective:** Verify extension works on Chromium-based browsers.

| Browser | Version | Installed OK? | Consent Works? | Tone Analysis Works? | ✓/✗ | Notes |
|---------|---------|---------------|----------------|---------------------|-----|-------|
| Chrome | | | | | | |
| Edge | | | | | | |
| Brave | | | | | | |

**Pass Criteria:** Extension functions identically across all Chromium browsers.

---

## 🛡️ Security Checks

### Content Security Policy (CSP)

- [ ] Extension respects platform CSP (no violations in console)
- [ ] No inline scripts or `eval()` usage
- [ ] All resources loaded from extension bundle (no CDN)

### Data Storage Audit

- [ ] Open `chrome://extensions` > Inspect views > Console
- [ ] Run: `chrome.storage.sync.get(null, console.log)`
- [ ] Verify ONLY these keys exist:
  - `betaConsentGiven`
  - `betaConsentDate`
  - `enableThreadAnalysis`
  - `enableCanvas`
  - `extensionVersion`

**No message content should ever appear in storage.**

---

## 📊 Test Summary

| Category | Total Tests | Passed | Failed | Notes |
|----------|-------------|--------|--------|-------|
| Consent Modal | 6 | | | |
| Platform Detection | 6 | | | |
| Tone Detection | 6 | | | |
| Code Detection | 4 | | | |
| Settings Panel | 7 | | | |
| MutationObserver | 4 | | | |
| Privacy Compliance | 7 | | | |
| Beta Expiration | 5 | | | |
| Performance | 5 | | | |
| Cross-Browser | 3 | | | |
| **TOTAL** | **53** | | | |

---

## 🚨 Known Issues

*Document any bugs or unexpected behavior here:*

1.
2.
3.

---

## ✅ Final Checklist

- [ ] All critical tests passed
- [ ] No privacy violations detected
- [ ] No external network calls
- [ ] Settings persist correctly
- [ ] Consent flow works
- [ ] Documentation accurate
- [ ] Ready for beta release

---

## 📝 Tester Sign-Off

**Tested by:** _______________________
**Date:** _______________________
**Approved for Beta Release:** ☐ YES ☐ NO

**Notes:**

---

**End of Test Plan**
