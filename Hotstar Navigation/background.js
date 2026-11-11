
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "back") {
    chrome.tabs.goBack();
  }

  if (message.action === "forward") {
    chrome.tabs.goForward();
  }
});
