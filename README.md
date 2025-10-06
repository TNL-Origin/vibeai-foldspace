# VibeAI FoldSpace Browser Extension

**Version:** 1.1.0 Beta
**Beta Period:** October 4, 2025 – November 15, 2025
**Developer:** Hugonomy Systems

---

## 🌀 Overview

VibeAI FoldSpace is a privacy-first browser extension that provides **local-only** emotional tone analysis and code detection for AI chat platforms. All processing occurs entirely within your browser—no external servers, no telemetry, no tracking.

### ✨ Key Features

- **Thread-Level Semantic Analysis** — Real-time tone detection (joy, frustration, gratitude, etc.) for visible chat messages
- **Code Detection** — Automatically identifies and highlights code snippets
- **FoldSpace Visual Overlay** — Animated glyphs and geometric patterns that respond to conversation tone
- **100% Local Processing** — No data leaves your browser
- **Privacy-First Design** — No external network calls, no tracking, no data collection

### 🎯 Supported Platforms

- ChatGPT (chat.openai.com, chatgpt.com)
- Claude (claude.ai)
- Google Gemini (gemini.google.com)
- Microsoft Copilot (copilot.microsoft.com, m365.cloud.microsoft.com)

---

## 🔒 Privacy & Security

**All analysis is local.** The extension:

- ✅ Reads only visible on-screen messages for real-time analysis
- ✅ Processes tone and code detection in browser memory
- ✅ Never stores message content
- ✅ Never transmits data to external servers
- ✅ Discards analysis data when you navigate away

**No access to:**
- ❌ Historical conversations
- ❌ Hidden or archived chats
- ❌ Personal information (name, email, IP)
- ❌ API keys or authentication tokens

Full details: [Privacy Policy](docs/privacy.html) • [Beta Agreement](docs/beta-agreement.html)

---

## 📦 Installation

### Option 1: Load Unpacked (Developer Mode)

1. **Download or clone this repository**
   ```bash
   git clone https://github.com/hugonomy/vibeai-foldspace.git
   cd vibeai-foldspace
   ```

2. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions`
   - Enable **Developer mode** (toggle in top-right)

3. **Load the extension**
   - Click **Load unpacked**
   - Select the `vibeai-foldspace` folder

4. **Accept beta consent**
   - Visit any supported platform (ChatGPT, Claude, etc.)
   - Accept the beta agreement modal

### Option 2: Install from Chrome Web Store

*Coming soon after beta testing completes*

---

## 🎨 Usage

### First-Time Setup

1. After installation, visit a supported AI chat platform
2. A consent modal will appear—read and accept to continue
3. The FoldSpace overlay will initialize automatically

### Settings Panel

Click the **🌀 floating button** (bottom-right) to access settings:

- **Enable Thread Analysis** — Toggle real-time tone and code detection
- **Enable FoldSpace Canvas** — Toggle animated visual overlay
- **Clear All Extension Data** — Reset all preferences and consent status

### Visual Indicators

**Tone Overlays**
- **Green accent** — Positive tone (joy, gratitude, excitement)
- **Blue accent** — Neutral tone
- **Red accent** — Negative tone (frustration, anger, concern)

**Code Detection**
- **Blue left border** — Code snippet detected

**Hover Tooltips**
- Hover over any message with an overlay to see tone and code status

---

## 🧪 Beta Testing

This is **experimental software** with known limitations:

- Features may change or be removed without notice
- Platform updates (ChatGPT, Claude, etc.) may break functionality
- Visual rendering may vary across different browsers or screen sizes

### Reporting Issues

Found a bug? Please report it:

- **GitHub Issues:** [hugonomy/vibeai-foldspace/issues](https://github.com/hugonomy/vibeai-foldspace/issues)
- **Email:** support@hugonomy.systems

Include:
- Browser version (Chrome/Edge/Brave)
- Platform (ChatGPT/Claude/etc.)
- Steps to reproduce
- Screenshots (if applicable)

---

## 🛠️ Technical Details

### Architecture

```
vibeai-foldspace/
├── manifest.json          # Extension configuration
├── scripts/
│   ├── content-script.js  # Message scanning & tone analysis
│   ├── overlay.js         # FoldSpace canvas & settings UI
│   └── background.js      # Service worker (beta expiration checks)
├── styles/
│   └── overlay.css        # Visual styles
└── docs/
    ├── index.html         # Documentation hub
    ├── privacy.html       # Privacy policy
    └── beta-agreement.html # Beta agreement
```

### Permissions

**Required:**
- `activeTab` — Inject overlay into current tab
- `storage` — Save preferences locally

**Host Permissions:**
- Access to ChatGPT, Claude, Gemini, Copilot domains (read-only DOM access)

**No network permissions** — Extension cannot make external API calls.

### Local Analysis Algorithm

The tone analysis uses a **simple keyword-based scoring system**:

1. Scan visible message text for emotion keywords
2. Calculate scores for 6 categories: anger, frustration, joy, gratitude, concern, excitement
3. Determine dominant emotion based on highest score
4. Compute overall tone score: `(positive - negative) / (positive + negative)`
5. Map score to color: Green (+), Blue (neutral), Red (-)

**No machine learning models.** No external APIs. Pure JavaScript regex and keyword matching.

---

## 🔄 Changelog

### v1.1.0 (October 5, 2025)
- ✨ **New:** Thread-level semantic reader with local tone analysis
- ✨ **New:** Code snippet detection and highlighting
- ✨ **New:** Real-time visual overlays with hover tooltips
- ✨ **New:** Settings panel with analysis toggles
- 📝 Updated Privacy Policy and Beta Agreement
- 🛠️ Improved MutationObserver performance with debouncing

### v1.0.9 (October 4, 2025)
- 🎉 Initial beta release
- ✅ Basic FoldSpace canvas with animated glyphs
- ✅ Consent modal and beta expiration checks
- ✅ Support for ChatGPT, Claude, Gemini, Copilot

---

## 📄 License

**Proprietary Beta Software**

This extension is provided for beta testing purposes only. By using it, you agree to the [Beta Agreement](docs/beta-agreement.html).

- ❌ No redistribution
- ❌ No commercial use
- ❌ No reverse engineering
- ✅ Personal testing only during beta period

After beta completion, a public license will be determined.

---

## 🤝 Contributing

Beta testers are welcome to:

- Report bugs via GitHub Issues
- Suggest features or improvements
- Provide feedback on usability

**Code contributions:** Not accepted during beta period.

---

## 📞 Contact

**Hugonomy Systems**

- **Email:** support@hugonomy.systems
- **Privacy Questions:** privacy@hugonomy.systems
- **GitHub:** [hugonomy/vibeai-foldspace](https://github.com/hugonomy/vibeai-foldspace)
- **Website:** [hugonomy.systems](https://hugonomy.systems)

---

## ⚠️ Beta Expiration Notice

This beta version **expires on November 15, 2025**.

After expiration:
- Extension will display an expiration notice
- Core functionality will be disabled
- Settings data remains accessible for clearing
- Contact developer for updated version

---

**© 2025 Hugonomy Systems · All Rights Reserved**
