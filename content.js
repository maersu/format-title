const titleState = {
  originalTitle: document.title,
  formattedTitle: null,
  url: window.location.href,
  incognito: false,
  updatedAt: null,
};

let isApplyingTitle = false;

function getFormattedTitle(originalTitle, pageUrl, incognito) {
  return `${getIncognitoPrefix(incognito)}${originalTitle}${getTitleSuffix(pageUrl)}`;
}

function getIncognitoPrefix(incognito) {
  return incognito ? "(private) " : "";
}

function getTitleSuffix(pageUrl) {
  const url = new URL(pageUrl);

  return ` - ${url.hostname}${url.pathname}`;
}

function getOriginalTitle(currentTitle, pageUrl, incognito) {
  const prefix = getIncognitoPrefix(incognito);
  const suffix = getTitleSuffix(pageUrl);
  let originalTitle = currentTitle;

  if (originalTitle.startsWith(prefix)) {
    originalTitle = originalTitle.slice(prefix.length);
  }

  return originalTitle.endsWith(suffix)
    ? originalTitle.slice(0, -suffix.length)
    : originalTitle;
}

function updateTitle(pageUrl, incognito) {
  if (!titleState.formattedTitle || document.title !== titleState.formattedTitle) {
    titleState.originalTitle = getOriginalTitle(document.title, pageUrl, incognito);
  }

  titleState.url = pageUrl;
  titleState.incognito = incognito;
  titleState.formattedTitle = getFormattedTitle(titleState.originalTitle, pageUrl, incognito);
  titleState.updatedAt = new Date().toISOString();

  isApplyingTitle = true;
  document.title = titleState.formattedTitle;
  isApplyingTitle = false;
}

function getTitleInfo() {
  const url = new URL(titleState.url);

  return {
    originalTitle: titleState.originalTitle,
    currentTitle: document.title,
    formattedTitle: titleState.formattedTitle,
    hostname: url.hostname,
    pathname: url.pathname,
    incognito: titleState.incognito,
    changed: Boolean(titleState.formattedTitle && titleState.originalTitle !== titleState.formattedTitle),
    updatedAt: titleState.updatedAt,
  };
}

new MutationObserver(() => {
  if (!isApplyingTitle && document.title !== titleState.formattedTitle) {
    titleState.originalTitle = document.title;

    if (titleState.formattedTitle) {
      updateTitle(window.location.href, titleState.incognito);
    }
  }
}).observe(document.documentElement, {
  childList: true,
  subtree: true,
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateTitle") {
    updateTitle(request.url, request.incognito);
    sendResponse(getTitleInfo());
    return;
  }

  if (request.action === "getTitleInfo") {
    sendResponse(getTitleInfo());
  }
});
