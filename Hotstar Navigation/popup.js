
const enableToggle = document.getElementById("enableToggle");
const scopeSelect = document.getElementById("scopeSelect");
const statusText = document.getElementById("statusText");
const scopeDescription = document.getElementById("scopeDescription");
const footerStatus = document.getElementById("footerStatus");

async function loadSettings() {
  const settings = await chrome.storage.local.get({
    enabled: true,
    scope: "hotstar"
  });

  enableToggle.checked = settings.enabled;
  scopeSelect.value = settings.scope;

  updateInterface(settings);
}

function updateInterface(settings) {
  statusText.textContent = settings.enabled
    ? "Navigation is enabled"
    : "Navigation is disabled";

  statusText.style.color = settings.enabled
    ? "#4ade80"
    : "#f87171";

  scopeDescription.textContent =
    settings.scope === "hotstar"
      ? "Works only on JioHotstar."
      : "Works on all websites.";

  footerStatus.textContent = settings.enabled
    ? "System Active"
    : "System Inactive";
}

// Enable / Disable navigation
enableToggle.addEventListener("change", async () => {
  const enabled = enableToggle.checked;

  await chrome.storage.local.set({ enabled });

  updateInterface({
    enabled,
    scope: scopeSelect.value
  });
});

// Change website scope
scopeSelect.addEventListener("change", async () => {
  const scope = scopeSelect.value;

  await chrome.storage.local.set({ scope });

  updateInterface({
    enabled: enableToggle.checked,
    scope
  });
});

// Keep popup synchronized with keyboard toggle
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled || changes.scope) {
    loadSettings();
  }
});

loadSettings();
