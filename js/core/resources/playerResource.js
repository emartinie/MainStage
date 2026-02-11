import { registerResource } from "/js/core/resourceManager.js";

console.log("✅ playerResource loaded WITH dock");

function dock() {
  // this is your existing logic
  if (typeof window.closePlayerPanel === "function") {
    window.closePlayerPanel();
  }
}

function openPanel() {
  if (typeof window.openPlayerPanel === "function") {
    window.openPlayerPanel();
  }
}

registerResource("player", {
  init() {
    console.log("🎧 Player resource init");
  },
  destroy() {
    console.log("🗑 Player resource destroy");
  },
  dock,
  openPanel
});