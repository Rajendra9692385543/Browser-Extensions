
const DEFAULT_SETTINGS = {
  enabled: true,
  scope: "hotstar"
};

// Initialize extension settings
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(DEFAULT_SETTINGS);

  await chrome.storage.local.set({
    enabled: data.enabled,
    scope: data.scope
  });

  updateBadge(data.enabled);
});

// Update toolbar badge
function updateBadge(enabled) {
  chrome.action.setBadgeText({
    text: enabled ? "ON" : "OFF"
  });

  chrome.action.setBadgeBackgroundColor({
    color: enabled ? "#16A34A" : "#DC2626"
  });

  chrome.action.setTitle({
    title: enabled
      ? "Navigation Enabled"
      : "Navigation Disabled"
  });
}

// Show temporary status
function showTemporaryStatus(text, title, color) {
  chrome.action.setBadgeText({ text });

  chrome.action.setBadgeBackgroundColor({
    color
  });

  chrome.action.setTitle({ title });

  setTimeout(async () => {
    const data = await chrome.storage.local.get(
      DEFAULT_SETTINGS
    );

    updateBadge(data.enabled);
  }, 2000);
}

// Check website scope
function isAllowedWebsite(url, scope) {
  if (scope === "all") {
    return true;
  }

  try {
    const hostname = new URL(url).hostname;

    return (
      hostname === "jiohotstar.com" ||
      hostname.endsWith(".jiohotstar.com") ||
      hostname === "hotstar.com" ||
      hostname.endsWith(".hotstar.com")
    );
  } catch {
    return false;
  }
}

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  const settings = await chrome.storage.local.get(
    DEFAULT_SETTINGS
  );

  // Toggle navigation
  if (command === "toggle-navigation") {
    const newState = !settings.enabled;

    await chrome.storage.local.set({
      enabled: newState
    });

    updateBadge(newState);

    return;
  }

  if (!settings.enabled) return;

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab || !tab.id) return;

  // Check selected website scope
  if (!isAllowedWebsite(tab.url || "", settings.scope)) {
    showTemporaryStatus(
      "HS",
      "Navigation is restricted to JioHotstar",
      "#D97706"
    );

    return;
  }

  try {
    if (command === "go-back") {
      await chrome.tabs.goBack(tab.id);

      showTemporaryStatus(
        "BACK",
        "Navigated Back",
        "#16A34A"
      );
    }

    if (command === "go-forward") {
      await chrome.tabs.goForward(tab.id);

      showTemporaryStatus(
        "NEXT",
        "Navigated Forward",
        "#16A34A"
      );
    }
  } catch (error) {
    showTemporaryStatus(
      "!",
      command === "go-back"
        ? "No previous page in history"
        : "No next page in history",
      "#D97706"
    );
  }
});

// Keep toolbar badge synchronized with settings
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    updateBadge(changes.enabled.newValue);
  }
});
