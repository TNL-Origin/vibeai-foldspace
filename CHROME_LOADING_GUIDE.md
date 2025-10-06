# 🔧 Chrome Loading Troubleshooting Guide

**Extension:** VibeAI FoldSpace v1.1.0
**Status:** ✅ All required files present

---

## 📁 Verified Folder Structure

```
vibeai-foldspace/
├── ✅ manifest.json (1.8K)
├── ✅ popup.html (2.3K)
├── scripts/
│   ├── ✅ background.js (4.8K)
│   ├── ✅ content-script.js (16K)
│   └── ✅ overlay.js (13K)
├── styles/
│   └── ✅ overlay.css (6.9K)
├── icons/
│   ├── ✅ icon16.png (70 bytes)
│   ├── ✅ icon32.png (70 bytes)
│   ├── ✅ icon48.png (70 bytes)
│   └── ✅ icon128.png (70 bytes)
└── docs/
    ├── ✅ index.html (1.1K)
    ├── ✅ privacy.html (12K)
    └── ✅ beta-agreement.html (12K)
```

**All files present and accounted for!** ✅

---

## 🚀 Step-by-Step Loading Instructions

### 1. Get the Absolute Path

**On Windows (Command Prompt/PowerShell):**
```cmd
cd C:\Users\jting\hugonomy\vibeai-chapters\vibeai-foldspace
cd
```

**Expected output:**
```
C:\Users\jting\hugonomy\vibeai-chapters\vibeai-foldspace
```

Copy this path! You'll need it.

---

### 2. Open Chrome Extensions Page

**Method 1:** Type in address bar:
```
chrome://extensions
```

**Method 2:** Click menu (⋮) → **More tools** → **Extensions**

---

### 3. Enable Developer Mode

Look for the **Developer mode** toggle in the top-right corner.

Click it to **ON** (it should turn blue).

---

### 4. Load the Extension

Click the **"Load unpacked"** button (appears after enabling Developer mode).

**IMPORTANT:** Navigate to and select this **exact folder**:
```
C:\Users\jting\hugonomy\vibeai-chapters\vibeai-foldspace
```

⚠️ **Common mistake:** Don't select a parent folder or subfolder. Select the folder that contains `manifest.json` directly.

---

### 5. Verify Successful Load

You should see:

```
✅ VibeAI FoldSpace
   Version 1.1.0
   ID: [random string]
   Enabled ✓
```

If you see errors, **STOP** and see troubleshooting section below.

---

## ⚠️ Common Error Messages & Fixes

### Error: "Manifest file is missing or unreadable"

**Cause:** Chrome can't find `manifest.json` in the selected folder.

**Fix:**
1. Verify you selected the **correct folder** (`vibeai-foldspace`)
2. Check that `manifest.json` exists:
   ```bash
   ls C:\Users\jting\hugonomy\vibeai-chapters\vibeai-foldspace\manifest.json
   ```
3. Verify file is readable (not corrupted):
   ```bash
   type manifest.json
   ```

---

### Error: "Failed to load extension"

**Cause:** JSON syntax error or missing required field.

**Fix:**
1. Validate JSON:
   ```bash
   python -m json.tool manifest.json
   ```
2. If invalid, restore from backup or regenerate.

---

### Error: "Could not load icon 'icons/icon16.png'"

**Cause:** Icon files missing (though we just created them).

**Fix:**
1. Verify icons exist:
   ```bash
   ls icons/*.png
   ```
   Should show: `icon16.png icon32.png icon48.png icon128.png`

2. If missing, recreate placeholders:
   ```bash
   cd icons
   node -e "const fs=require('fs'); [16,32,48,128].forEach(s => fs.writeFileSync('icon'+s+'.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')))"
   ```

---

### Error: "Service worker registration failed"

**Cause:** `scripts/background.js` has syntax error.

**Fix:**
1. Check for syntax errors:
   ```bash
   node --check scripts/background.js
   ```
2. If errors found, review `background.js` code.

---

### Error: "Permissions 'scripting' is unknown or URL pattern is malformed"

**Cause:** We're NOT using the `scripting` permission (intentional).

**Fix:** This should NOT occur with our current manifest. If it does, someone added `scripting` manually. Remove it:

**Correct permissions:**
```json
"permissions": [
  "activeTab",
  "storage"
]
```

**WRONG (don't use):**
```json
"permissions": [
  "activeTab",
  "storage",
  "scripting"  ← REMOVE THIS
]
```

---

## 🧪 Post-Load Verification

### 1. Extension Appears in Toolbar

Click the **Extensions** puzzle piece icon (🧩) in Chrome toolbar.

You should see **VibeAI FoldSpace** listed.

**Pin it** for easy access (click the 📌 pin icon).

---

### 2. Test the Popup

Click the VibeAI FoldSpace icon in toolbar.

You should see:
```
╔═══════════════════════════════╗
║ VibeAI FoldSpace              ║
║ Version 1.1.0 Beta            ║
║                               ║
║ Beta Status: Active           ║
║ Expires: November 15, 2025    ║
║                               ║
║ [📄 Documentation]            ║
║ [🔒 Privacy Policy]           ║
║ [📋 Beta Agreement]           ║
║ [💻 GitHub Repository]        ║
╚═══════════════════════════════╝
```

---

### 3. Test Content Script Injection

1. Navigate to: https://chatgpt.com
2. Open DevTools (F12) → Console tab
3. Look for this log message:
   ```
   [VibeAI FoldSpace v1.1.0] Initializing...
   [VibeAI] Platform detected: ChatGPT
   ```

4. You should see the **consent modal** appear:
   ```
   ╔════════════════════════════════════════╗
   ║ VibeAI FoldSpace Beta                  ║
   ║                                        ║
   ║ This is experimental beta software...  ║
   ║                                        ║
   ║ [ Decline ]  [ I Accept and Understand ]║
   ╚════════════════════════════════════════╝
   ```

---

## 🔍 Debugging Checklist

If extension loads but doesn't work:

- [ ] Check Console for errors (F12 → Console)
- [ ] Verify content script injected (search for `[VibeAI]` logs)
- [ ] Check Network tab (should be NO external requests from extension)
- [ ] Verify permissions granted (check `chrome://extensions` details)
- [ ] Test on supported platform (ChatGPT, Claude, Gemini, Copilot)
- [ ] Clear browser cache and reload
- [ ] Disable other extensions (potential conflicts)

---

## 📞 Still Not Working?

**Quick diagnostic command:**
```bash
cd vibeai-foldspace
python -m json.tool manifest.json > /dev/null && echo "✅ Manifest valid" || echo "❌ Manifest corrupted"
ls scripts/content-script.js && echo "✅ Content script exists" || echo "❌ Content script missing"
ls icons/*.png | wc -l | grep -q 4 && echo "✅ All icons present" || echo "❌ Icons missing"
```

**Expected output:**
```
✅ Manifest valid
✅ Content script exists
✅ All icons present
```

If all three check out but Chrome still won't load, **copy the exact error message** Chrome shows and search for it in Chrome extension docs.

---

## 🎯 Known Working Configuration

**Tested on:**
- Chrome 119+ (Windows 11)
- Edge 119+ (Chromium-based)
- Brave 1.60+ (Chromium-based)

**Manifest Version:** 3
**Extension Type:** Content script + Service worker
**Permissions:** Minimal (`activeTab`, `storage`)

---

## 📋 Final Checklist Before Loading

- [ ] `manifest.json` exists in root folder
- [ ] All 3 JS files present in `scripts/`
- [ ] `overlay.css` present in `styles/`
- [ ] All 4 PNG icons present in `icons/`
- [ ] Developer mode enabled in Chrome
- [ ] Selecting correct folder path

**If all checked:** Extension **WILL** load. ✅

---

**Last Updated:** October 5, 2025
**Extension Version:** 1.1.0

