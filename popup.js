const statusElement = document.getElementById("status");
const originalTitleElement = document.getElementById("original-title");
const currentTitleElement = document.getElementById("current-title");
const addedTextElement = document.getElementById("added-text");
const updatedAtElement = document.getElementById("updated-at");

function setText(element, text) {
  element.textContent = text || "-";
}

function getAddedText(info) {
  if (!info.changed || !info.hostname) {
    return "";
  }

  const incognitoPrefix = info.incognito ? "(private) " : "";

  return `${incognitoPrefix}- ${info.hostname}${info.pathname}`;
}

function showInfo(info) {
  setText(originalTitleElement, info.originalTitle);
  setText(currentTitleElement, info.currentTitle);
  setText(addedTextElement, getAddedText(info));

  statusElement.textContent = info.changed
    ? "Formatted on this page"
    : "No title change detected";

  updatedAtElement.textContent = info.updatedAt
    ? `Updated ${new Date(info.updatedAt).toLocaleTimeString()}`
    : "";
}

function showUnavailable(tab) {
  setText(originalTitleElement, tab?.title);
  setText(currentTitleElement, tab?.title);
  setText(addedTextElement, "");
  statusElement.textContent = "Title changes are not available on this page";
  updatedAtElement.textContent = "";
}

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

async function sendUpdateMessage(tab) {
  return chrome.tabs.sendMessage(tab.id, {
    action: "updateTitle",
    url: tab.url,
    incognito: tab.incognito,
  });
}

async function loadCurrentPageChanges() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id || !canFormatUrl(tab.url)) {
    showUnavailable(tab);
    return;
  }

  try {
    const info = await sendUpdateMessage(tab);

    if (info) {
      showInfo(info);
      return;
    }
  } catch (error) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
      });

      showInfo(await sendUpdateMessage(tab));
      return;
    } catch (injectionError) {
      showUnavailable(tab);
      return;
    }
  }

  showUnavailable(tab);
}

loadCurrentPageChanges();
