
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get("enabled");

  if (data.enabled === undefined) {
    await chrome.storage.local.set({ enabled: true });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  const data = await chrome.storage.local.get("enabled");

  if (command === "toggle-navigation") {
    const newState = !(data.enabled ?? true);

    await chrome.storage.local.set({
      enabled: newState
    });

    console.log(
      `Navigation ${newState ? "Enabled" : "Disabled"}`
    );

    return;
  }

  if (!(data.enabled ?? true)) return;

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab?.id) return;

  try {
    if (command === "go-back") {
      await chrome.tabs.goBack(tab.id);
    }

    if (command === "go-forward") {
      await chrome.tabs.goForward(tab.id);
    }
  } catch (error) {
    console.error("Navigation error:", error);
  }
});
