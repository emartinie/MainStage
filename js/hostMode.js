console.log("hostMode.js LOADED");

window.HostMode = {
  start() {
    const el = document.getElementById("hostOverlay");
    if (!el) {
      console.warn("hostOverlay not found");
      return;
    }
    el.style.display = "flex";
  },

  stop() {
    const el = document.getElementById("hostOverlay");
    if (!el) return;
    el.style.display = "none";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const exitBtn = document.getElementById("exitHostOverlay");
  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      window.HostMode.stop();
    });
  }
});