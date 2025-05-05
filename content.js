(() => {
  const tweets = document.querySelectorAll("article");
  console.log("📄 Found", tweets.length, "tweets");

  tweets.forEach((tweet) => {
    const tweetText = tweet.innerText;
    const tweetLink = tweet.querySelector("a[href*='/status/']")?.href;

    const hasVideo = tweet.querySelector("video, [data-testid='videoPlayer']") !== null;
    const isReply = tweetText.includes("Replying to");
    const containsLaunchcoin = tweetText.toLowerCase().includes("@launchcoin");

    console.log("🔍 Checking tweet:", {
      isReply,
      hasVideo,
      containsLaunchcoin,
      tweetLink,
      tweetText: tweetText.slice(0, 100)
    });

    if (!isReply && hasVideo && containsLaunchcoin) {
      console.log("📢 Qualified tweet:", tweetLink);

      if (tweetLink && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          type: "newTweet",
          url: tweetLink,
          text: tweetText
        });
      }
    }
  });
})();