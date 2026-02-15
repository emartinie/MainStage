// fullscreenMap.dev.js
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("fullscreenMapBtn");
  const mapContainer = document.getElementById("mapContainer");

  if (!btn || !mapContainer) {
    console.warn("⚠️ Fullscreen map button or mapContainer missing");
    return;
  }

  let isFullscreen = false;

  btn.addEventListener("click", () => {
    isFullscreen = !isFullscreen;

    if (isFullscreen) {
      mapContainer.classList.add("fullscreen");
      btn.textContent = "❌ Exit Fullscreen";
    } else {
      mapContainer.classList.remove("fullscreen");
      btn.textContent = "🗺️ Fullscreen Map";
    }

    // Leaflet requires invalidateSize after resizing the container
    if (window.map) window.map.invalidateSize();
    console.log("🟢 Fullscreen toggled:", isFullscreen);
  });
});