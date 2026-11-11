
chrome.commands.onCommand.addListener(async (command) => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab?.id) return;

    if (command === "go-back") {
      await chrome.tabs.goBack(tab.id);
    }

    if (command === "go-forward") {
      await chrome.tabs.goForward(tab.id);
    }
  } catch (error) {
    console.error("Navigation failed:", error);
  }
});
