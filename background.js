let twitterTabId = null;
let lastTweetUrl = null;
let twitterTabReady = false;
const notificationMap = new Map();

chrome.runtime.onStartup.addListener(() => {
  console.log("🚀 Chrome restarted, restoring state.");
  chrome.storage.local.get("twitterTabId", (data) => {
    if (data.twitterTabId !== undefined) {
      twitterTabId = Number(data.twitterTabId);
      twitterTabReady = true;
      console.log("🔄 Restored twitterTabId:", twitterTabId);
    }
  });
  chrome.alarms.create("pollTwitter", { periodInMinutes: 1 });
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("⚙️ Extension installed.");
  openOrReuseTwitterTab();
  chrome.alarms.create("pollTwitter", { periodInMinutes: 1 });
  twitterTabReady = true;
});

function openOrReuseTwitterTab() {
  const searchUrl = "https://x.com/search?q=%40launchcoin&f=live";
  chrome.tabs.create({ url: searchUrl, active: false }, (tab) => {
    console.log("🆕 Opened Twitter tab:", tab.id);
    twitterTabId = tab.id;
    twitterTabReady = true;
    chrome.storage.local.set({ twitterTabId: tab.id });
  });
}

function runContentScript() {
  if (!twitterTabReady || twitterTabId === null) {
    console.warn("🚫 Twitter tab ID not ready — opening one.");
    openOrReuseTwitterTab();
    return;
  }

  console.log("🔍 Checking tab ID:", twitterTabId);
  chrome.tabs.get(twitterTabId, (tab) => {
    if (chrome.runtime.lastError || !tab) {
      console.warn("❌ Tab retrieval failed:", chrome.runtime.lastError?.message || "Tab not found");
      twitterTabId = null;
      twitterTabReady = false;
      openOrReuseTwitterTab();
      return;
    }

    chrome.tabs.reload(twitterTabId, {}, () => {
      console.log("🔄 Twitter tab reloaded:", twitterTabId);
      setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId: twitterTabId },
          files: ["content.js"]
        }).then(() => {
          console.log("✅ Script injected after refresh:", twitterTabId);
        }).catch((err) => {
          console.error("❌ Injection failed:", err);
          twitterTabId = null;
          twitterTabReady = false;
          openOrReuseTwitterTab();
        });
      }, 4000); // delay increased for tweet load time
    });
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "pollTwitter") {
    console.log("⏰ Running pollTwitter alarm");
    runContentScript();
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  console.log("📩 Received message:", msg);
  if (msg.type === "newTweet" && msg.url !== lastTweetUrl) {
    lastTweetUrl = msg.url;

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon.png",
      title: "New @launchcoin Tweet",
      message: msg.text.slice(0, 150) + "…"
    }, (id) => {
      if (chrome.runtime.lastError) {
        console.warn("⚠️ Notification error:", chrome.runtime.lastError.message);
        chrome.tabs.create({ url: msg.url });
      } else {
        console.log("🔔 Notification shown with ID:", id);
        notificationMap.set(id, msg.url);
      }
    });
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  const url = notificationMap.get(notificationId);
  if (url) {
    chrome.tabs.create({ url });
    notificationMap.delete(notificationId);
  }
});