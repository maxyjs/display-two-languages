chrome.tabs.onUpdated.addListener(function
    (tabId, changeInfo) {
    if (changeInfo.url) {
      const message = changeInfo.url
      chrome.tabs.sendMessage(
        tabId,
        message
      );
    }
  }
);