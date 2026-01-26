import { registerResource } from "/js/core/resourceManager.js";

registerResource("player", {
  init() {
    // If your player already exposes openPlayerPanel() or similar:
    if (typeof window.openPlayerPanel === "function") {
      window.openPlayerPanel();
    } else {
      console.warn("Player init function not found");
    }
  },
  destroy() {
    const el = document.getElementById("floatingPlayer");
    if (el) el.remove();

    // Also stop audio if present
    document.querySelectorAll("audio").forEach(a => {
      try { a.pause(); } catch(e){}
    });
  }
});