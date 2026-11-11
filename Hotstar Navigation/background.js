
const DEFAULT_SETTINGS = {
  enabled: true,
  scope: "hotstar"
};

// Initialize settings
chrome.runtime.onInstalled.addListener(async () => {
  const settings = await chrome.storage.local.get(
    DEFAULT_SETTINGS
  );

  await chrome.storage.local.set({
    enabled: settings.enabled,
    scope: settings.scope
  });

  updateBadge(settings.enabled);
});

// Update extension toolbar badge
function updateBadge(enabled) {
  chrome.action.setBadgeText({
    text: enabled ? "ON" : "OFF"
  });

  chrome.action.setBadgeBackgroundColor({
    color: enabled ? "#16A34A" : "#DC2626"
  });

  chrome.action.setTitle({
    title: enabled
      ? "Hotstar Shortcut - Enabled"
      : "Hotstar Shortcut - Disabled"
  });
}

// Check whether the current website is Hotstar
function isHotstar(url) {
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

// Send notification to the current tab
async function notifyTab(tabId, status, message) {
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: "SHOW_TOAST",
      status,
      message
    });
  } catch {
    // The tab may not have a compatible content script.
  }
}

// Keep badge synchronized
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    updateBadge(changes.enabled.newValue);
  }
});

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  const settings = await chrome.storage.local.get(
    DEFAULT_SETTINGS
  );

  // Enable / Disable
  if (command === "toggle-navigation") {
    const enabled = !settings.enabled;

    await chrome.storage.local.set({
      enabled
    });

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (tab?.id) {
      await notifyTab(
        tab.id,
        enabled ? "success" : "disabled",
        enabled
          ? "Extension enabled successfully"
          : "Extension disabled"
      );
    }

    return;
  }

  // Stop navigation if extension is disabled
  if (!settings.enabled) return;

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab?.id || !tab.url) return;

  // Website scope restriction
  if (
    settings.scope === "hotstar" &&
    !isHotstar(tab.url)
  ) {
    await notifyTab(
      tab.id,
      "warning",
      "Navigation is available only on JioHotstar"
    );

    return;
  }

  try {
    if (command === "go-forward") {
      await chrome.tabs.goForward(tab.id);
    }

    if (command === "go-back") {
      await chrome.tabs.goBack(tab.id);
    }
  } catch {
    await notifyTab(
      tab.id,
      "warning",
      command === "go-forward"
        ? "No next page in browser history"
        : "No previous page in browser history"
    );
  }
});

// Handle notifications requested by popup
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.type === "NOTIFY_ACTIVE_TAB") {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }).then(async ([tab]) => {
        if (tab?.id) {
          await notifyTab(
            tab.id,
            request.status,
            request.message
          );
        }

        sendResponse({ success: true });
      }).catch(() => {
        sendResponse({ success: false });
      });

      return true;
    }
  }
);
