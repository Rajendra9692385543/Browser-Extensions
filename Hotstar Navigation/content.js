
window.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.altKey ||
      event.shiftKey || event.metaKey) return;

  const target = event.target;

  if (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  ) return;

  if (event.code === "KeyB") {
    event.preventDefault();
    event.stopImmediatePropagation();
    chrome.runtime.sendMessage({ action: "back" });
  }

  if (event.code === "KeyN") {
    event.preventDefault();
    event.stopImmediatePropagation();
    chrome.runtime.sendMessage({ action: "forward" });
  }
}, true);
