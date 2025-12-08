function formatTitle(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.url) {
    // Skip URLs where content scripts can't run
    if (tab.url.startsWith("chrome://") || 
        tab.url.startsWith("chrome-extension://") ||
        tab.url.startsWith("about:") ||
        tab.url.startsWith("edge://") ||
        tab.url.startsWith("file://")) {
      return;
    }

    const url = new URL(tab.url);
    const incognitoPrefix = tab.incognito ? "(private) " : "";
    const newTitle = `${incognitoPrefix}${tab.title} - ${url.hostname}${url.pathname}`;

    chrome.tabs.sendMessage(tabId, {
      action: "updateTitle",
      newTitle: newTitle,
    }).catch(() => {
      // Content script not available on this page, ignore
    });
  }
}

chrome.tabs.onUpdated.addListener(formatTitle);
