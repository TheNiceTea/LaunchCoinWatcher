# 🚀 LaunchCoin Tweet Watcher

A lightweight Chrome/Brave extension that watches for **new original tweets** containing `@launchcoin` **and a video**, alerting you within the first minute.

---

## ✅ Features

- 🕵️ Monitors [x.com](https://x.com) for tweets mentioning `@launchcoin`
- 🎬 Filters **only original tweets** (no replies) that **include a video**
- 🔁 Reloads the Twitter tab every minute to ensure fresh results
- 🔔 Sends **clickable notifications** or opens the tweet in a new tab
- 🧠 Built with **Manifest V3** and event-driven service workers
- 💾 Persists tab tracking across browser restarts

---

## 📦 Installation

1. Download and unzip this repo
2. Open `chrome://extensions` in Chrome/Brave
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the unzipped folder

---

## 🛠 How It Works

- Opens (or reuses) a tab with the search:  
  `https://x.com/search?q=%40launchcoin&f=live`
- Every 60 seconds:
  - Reloads that tab
  - Waits 2 seconds for new results to appear
  - Injects a content script to check the top tweet
- If it’s:
  - ✅ Not a reply
  - ✅ Contains `@launchcoin`
  - ✅ Has a `<video>` element  
- → Sends an alert (notification or opens tweet)

---

## 🧪 Debug Tips

Use DevTools console inside the tab to test detection:

```js
const tweet = document.querySelector("article");
console.log("Has video?", !!tweet.querySelector("video[src]"));
```

To see background logs:  
Go to `chrome://extensions` → “Service Worker” → “Inspect”

---

## 📁 File Overview

- `manifest.json` – Extension manifest (MV3)
- `background.js` – Handles alarms, tab tracking, notifications
- `content.js` – Checks tweet structure and sends alerts
- `icons/icon.png` – App icon

---

## 🙏 Contribute

Pull requests welcome — ideas for Telegram alerts, multi-tweet scanning, or tab auto-close? Let's go!