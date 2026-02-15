console.log("🙏 prayerModal.dev.js loaded");

let prayMapInstance = null;

window.openPrayTogether = function () {
  console.log("🙏 Opening Pray Together modal");

  const overlay = document.createElement("div");
  overlay.id = "prayTogetherOverlay";
  overlay.className = "fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center";

  const modal = document.createElement("div");
  modal.className = "relative w-[95vw] h-[92vh] rounded-2xl overflow-hidden";

  const mapClone = document.createElement("div");
  mapClone.id = "prayTogetherMap";
  mapClone.style.width = "100%";
  mapClone.style.height = "100%";

  modal.appendChild(mapClone);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "✕";
  closeBtn.className = "absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-lg";
  closeBtn.onclick = window.closePrayTogether;
  modal.appendChild(closeBtn);

  const originalMap = window.map;

  prayMapInstance = L.map("prayTogetherMap", {
    center: originalMap.getCenter(),
    zoom: originalMap.getZoom()
  });

  originalMap.eachLayer(layer => {
    if (layer instanceof L.TileLayer) {
      layer.addTo(prayMapInstance);
    }
  });

  setTimeout(() => prayMapInstance.invalidateSize(), 100);
};

window.closePrayTogether = function () {
  if (prayMapInstance) {
    prayMapInstance.remove();
    prayMapInstance = null;
  }

  const overlay = document.getElementById("prayTogetherOverlay");
  if (overlay) overlay.remove();
};
