function formatTitle(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    const url = new URL(tab.url);
    const newTitle = `${tab.title} - ${url.hostname}${url.pathname}`;

    chrome.tabs.sendMessage(tabId, {
      action: "updateTitle",
      newTitle: newTitle,
    });
  }
}

chrome.tabs.onUpdated.addListener(formatTitle);
