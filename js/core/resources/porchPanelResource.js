// porchPanelResource.js
import { registerResource } from "/js/core/resourceManager.js";

// --- Internal state ---
let overlay, titleEl, contentEl;

// --- Setup / Init ---
function setupPorchPanel() {
  if (overlay) return; // already initialized

  // Create overlay
  overlay = document.createElement("div");
  overlay.id = "porchPanelOverlay";
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

// Card container
const panel = document.createElement("div");
panel.className = "panel";
overlay.appendChild(panel);

// Title
titleEl = document.createElement("h2");
titleEl.id = "porchPanelTitle";
panel.appendChild(titleEl);

// Content
contentEl = document.createElement("div");
contentEl.id = "porchPanelContent";
panel.appendChild(contentEl);


// Close button
const closeBtn = document.createElement("button");
closeBtn.id = "porchPanelClose";
closeBtn.textContent = "✖";
closeBtn.onclick = closePorchPanel;
panel.appendChild(closeBtn);


// Click outside to close
overlay.addEventListener("click", e => {
  if (e.target === overlay) closePorchPanel();
});

  document.body.appendChild(overlay);

  console.log("PorchPanel initialized ✅");
}

// --- Open / Close ---
function openPorchPanel(title = "Porch Panel", html = "") {
  if (!overlay) setupPorchPanel();
  titleEl.innerHTML = title;
  contentEl.innerHTML = html;
  overlay.classList.remove("hidden");
  pauseAllMedia();
}

function closePorchPanel() {
  overlay?.classList.add("hidden");
}

// --- Pause any playing media ---
function pauseAllMedia() {
  const mediaEls = document.querySelectorAll("audio, video");
  mediaEls.forEach(el => el.pause());
  console.log("All media paused:", mediaEls.length);
}

// --- Destroy ---
function destroyPorchPanel() {
  if (!overlay) return;
  overlay.remove();
  overlay = titleEl = contentEl = null;
  console.log("PorchPanel destroyed 🗑️");
}

// --- Register with Resource Manager ---
registerResource("porchPanel", {
  init: setupPorchPanel,
  destroy: destroyPorchPanel,
  openPorchPanel,
  closePorchPanel,
  pauseAllMedia
});