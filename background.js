function canFormatUrl(tabUrl) {
  if (!tabUrl) {
    return false;
  }

  return ![
    "chrome://",
    "chrome-extension://",
    "about:",
    "edge://",
    "file://",
  ].some((blockedPrefix) => tabUrl.startsWith(blockedPrefix));
}

function formatTitle(tabId, changeInfo, tab) {
  if (changeInfo.status !== "complete" || !canFormatUrl(tab.url)) {
    return;
  }

  chrome.tabs.sendMessage(tabId, {
    action: "updateTitle",
    url: tab.url,
    incognito: tab.incognito,
  }).catch(() => {
    // Content script not available on this page, ignore.
  });
}

chrome.tabs.onUpdated.addListener(formatTitle);
