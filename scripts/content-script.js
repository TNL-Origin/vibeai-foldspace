chrome.runtime.sendMessage({ type: "activateFoldSpace" }, () => {
  console.log("🌀 FoldSpace activation signal sent");
});

let retryCount = 0;
const MAX_RETRIES = 10;

function observeThreadContent() {
  const threadContainer = document.querySelector(".chat, .conversation, .thread, [data-message-container], main, [role='main']");
  if (!threadContainer) {
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.warn(`[VibeAI] Thread container not found, retrying in 2s… (${retryCount}/${MAX_RETRIES})`);
      setTimeout(observeThreadContent, 2000);
    } else {
      console.error("[VibeAI] Failed to find thread container after max retries.");
    }
    return;
  }

  console.log("✅ VibeAI FoldSpace thread container detected");
  // Start observing DOM here…

  const observer = new MutationObserver((mutations) => {
    console.log("🔍 DOM mutation detected in thread container");
    // Add your analysis logic here
  });

  observer.observe(threadContainer, {
    childList: true,
    subtree: true
  });
}

// Wait for DOM to be ready before starting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeThreadContent);
} else {
  observeThreadContent();
}
