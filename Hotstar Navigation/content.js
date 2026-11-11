
chrome.runtime.onMessage.addListener((request) => {
  if (request.type !== "SHOW_TOAST") return;

  showToast(request.status, request.message);
});

function showToast(status, message) {
  const existing = document.getElementById(
    "hotstar-shortcut-toast"
  );

  if (existing) existing.remove();

  const host = document.createElement("div");

  host.id = "hotstar-shortcut-toast";

  host.style.cssText = `
    all: initial;
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 2147483647;
  `;

  const shadow = host.attachShadow({
    mode: "closed"
  });

  const icons = {
    success: "✓",
    disabled: "−",
    warning: "!"
  };

  const colors = {
    success: "#16a34a",
    disabled: "#64748b",
    warning: "#d97706"
  };

  const icon = icons[status] || "!";
  const color = colors[status] || colors.warning;

  shadow.innerHTML = `
    <style>
      * {
        box-sizing: border-box;
      }

      .toast {
        width: min(360px, calc(100vw - 32px));
        display: flex;
        align-items: center;
        gap: 13px;
        padding: 15px 17px;
        border: 1px solid #dbe3ef;
        border-radius: 13px;
        background: #ffffff;
        color: #172033;
        font-family: "Segoe UI", Arial, sans-serif;
        box-shadow: 0 12px 35px rgba(15,23,42,.18);
        animation: enter .3s ease;
      }

      .icon {
        width: 36px;
        height: 36px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: white;
        font-size: 20px;
        font-weight: bold;
      }

      .title {
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 4px;
      }

      .message {
        font-size: 12px;
        color: #64748b;
        line-height: 1.4;
      }

      @media (prefers-color-scheme: dark) {
        .toast {
          background: #101827;
          color: #f8fafc;
          border-color: #334155;
          box-shadow: 0 12px 35px rgba(0,0,0,.4);
        }

        .message {
          color: #cbd5e1;
        }
      }

      @keyframes enter {
        from {
          opacity: 0;
          transform: translateY(12px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    </style>

    <div class="toast">
      <div class="icon" style="background:${color}">
        ${icon}
      </div>

      <div>
        <div class="title">Hotstar Shortcut</div>
        <div class="message"></div>
      </div>
    </div>
  `;

  shadow.querySelector(".message").textContent = message;

  document.documentElement.appendChild(host);

  setTimeout(() => {
    host.style.transition = "opacity .3s ease";
    host.style.opacity = "0";

    setTimeout(() => {
      host.remove();
    }, 300);
  }, 3000);
}
