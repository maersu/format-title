chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateTitle") {
    document.title = request.newTitle;
  }
});
