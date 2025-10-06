console.log("🌀 VibeAI FoldSpace background worker starting...");

chrome.runtime.onInstalled.addListener(() => {
  console.log("🔧 Extension installed or updated");
});

chrome.runtime.onStartup.addListener(() => {
  console.log("♻️ Chrome startup - VibeAI ready");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  try {
    if (msg.type === "activateFoldSpace") {
      console.log("✨ Received activation signal from content script");
      if (sender.tab && sender.tab.id) {
        chrome.tabs.sendMessage(sender.tab.id, { type: "initFoldSpace" });
        sendResponse({ ok: true });
      }
    }
  } catch (err) {
    console.error("⚠️ Error in background message handler:", err);
  }
  return true; // Keep port open for async
});

// Keep-alive heartbeat every 20s to prevent invalidation
setInterval(() => {
  chrome.runtime.sendMessage({ type: "keepAlive" }).catch(() => {});
}, 20000);

console.log("✅ VibeAI FoldSpace background worker active");
