import { registerResource, getResource } from "/js/core/resourceManager.js";

// Internal state
let overlay, titleEl, contentEl;

function setupCourtesyPanel() {
  if (overlay) return; // already created

  overlay = document.createElement("div");
  overlay.id = "courtesyPanelOverlay";
  overlay.className = "hidden";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "1rem",
  });

  titleEl = document.createElement("h2");
  titleEl.style.color = "#fff";
  overlay.appendChild(titleEl);

  contentEl = document.createElement("div");
  contentEl.style.color = "#fff";
  overlay.appendChild(contentEl);

  document.body.appendChild(overlay);
}

// Show panel
function show() {
  setupCourtesyPanel();

  const html = `
    <div class="space-y-3 text-left">
      <p class="text-slate-200 font-semibold">Quick heads-up</p>
      <p class="text-slate-300 text-sm">
        I’m going to tuck the player out of your way so you can explore the app easier. What would you prefer?
      </p>

      <div class="flex gap-2">
        <button id="pcpOk"
          class="flex-1 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium">
          Hide Player
        </button>

        <button id="pcpCancel"
          class="flex-1 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700">
          Keep Playing
        </button>
      </div>

      <p class="text-xs text-slate-500">You can bring it back anytime. I will remember your preference.</p>
    </div>
  `;

  titleEl.textContent = "Player Courtesy";
  contentEl.innerHTML = html;
  overlay.classList.remove("hidden");

  // Wait for the DOM to render buttons
  setTimeout(() => attachButtonHandlers(), 50);
}

function attachButtonHandlers() {
  const player = getResource("player");
  const panel = getResource("porchPanel");

  document.getElementById("pcpOk")?.addEventListener("click", () => {
    if (player && typeof player.dock === "function") player.dock();
    if (panel && typeof panel.closePorchPanel === "function") panel.closePorchPanel();
    localStorage.setItem("playerCourtesyDismissed", "true");
    overlay.classList.add("hidden");
  });

  document.getElementById("pcpCancel")?.addEventListener("click", () => {
    if (panel && typeof panel.closePorchPanel === "function") panel.closePorchPanel();
    localStorage.setItem("playerCourtesyDismissed", "true");
    overlay.classList.add("hidden");
  });
}

// Optional: clean up DOM
function destroy() {
  overlay?.remove();
  overlay = titleEl = contentEl = null;
}

// Register resource
registerResource("playerCourtesy", {
  init: setupCourtesyPanel,
  destroy,
  show
});