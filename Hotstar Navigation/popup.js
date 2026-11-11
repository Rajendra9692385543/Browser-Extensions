
const enableToggle = document.getElementById("enableToggle");

const statusCard = document.getElementById("statusCard");
const statusIcon = document.getElementById("statusIcon");
const statusHeading = document.getElementById("statusHeading");
const statusDescription = document.getElementById("statusDescription");

const scopeDescription = document.getElementById("scopeDescription");
const scopeButtons = document.querySelectorAll(".scope-button");

let settings = {
  enabled: true,
  scope: "hotstar"
};

// Load saved settings
async function loadSettings() {
  settings = await chrome.storage.local.get({
    enabled: true,
    scope: "hotstar"
  });

  render();
}

// Update popup interface
function render() {
  enableToggle.checked = settings.enabled;

  statusCard.classList.toggle(
    "disabled",
    !settings.enabled
  );

  statusIcon.textContent = settings.enabled ? "✓" : "−";

  statusHeading.textContent = settings.enabled
    ? "Extension Enabled"
    : "Extension Disabled";

  statusDescription.textContent = settings.enabled
    ? "Keyboard shortcuts are active"
    : "Keyboard shortcuts are paused";

  scopeDescription.textContent =
    settings.scope === "hotstar"
      ? "Shortcuts work only on JioHotstar."
      : "Shortcuts work on all websites.";

  scopeButtons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.scope === settings.scope
    );
  });
}

// Show notification on current webpage
async function notifyCurrentPage(enabled) {
  try {
    await chrome.runtime.sendMessage({
      type: "NOTIFY_ACTIVE_TAB",

      status: enabled ? "success" : "disabled",

      message: enabled
        ? "Extension enabled successfully"
        : "Extension disabled"
    });
  } catch (error) {
    console.error("Notification failed:", error);
  }
}

// Enable / Disable toggle
enableToggle.addEventListener("change", async () => {
  settings.enabled = enableToggle.checked;

  await chrome.storage.local.set({
    enabled: settings.enabled
  });

  render();

  await notifyCurrentPage(settings.enabled);
});

// Website scope selection
scopeButtons.forEach(button => {
  button.addEventListener("click", async () => {
    settings.scope = button.dataset.scope;

    await chrome.storage.local.set({
      scope: settings.scope
    });

    render();
  });
});

// Open Chrome keyboard shortcut settings
document
  .getElementById("shortcutsLink")
  .addEventListener("click", () => {
    chrome.tabs.create({
      url: "chrome://extensions/shortcuts"
    });
  });

// Synchronize popup if keyboard shortcut changes settings
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled || changes.scope) {
    loadSettings();
  }
});

// Initialize
loadSettings();
