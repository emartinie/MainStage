console.log("🙏 PrayTogetherButton loaded");

let prayMap = null;

document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("prayTogetherBtn");
  const modal = document.getElementById("prayTogetherModal");
  const closeBtn = document.getElementById("closePrayTogether");
  const flipBtn = document.getElementById("flipPrayTogetherBtn");
  const flipWrapper = document.getElementById("prayTogether-flipWrapper");

  if (!modal) {
    console.warn("prayTogetherModal not found");
    return;
  }

  // -------------------------
  // MAP INIT (safe + once)
  // -------------------------
  function initPrayMap() {
    const mapDiv = document.getElementById("prayTogetherMap");
    if (!mapDiv) return;
    if (prayMap) return; // prevent duplicate creation

    prayMap = L.map(mapDiv).setView([36.1, -86.7], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(prayMap);

    const clusterGroup = L.markerClusterGroup();
    clusterGroup.addLayer(
      L.marker([36.2, -86.8]).bindPopup("Sample Prayer")
    );
    prayMap.addLayer(clusterGroup);

    // ensure correct sizing after modal opens
    setTimeout(() => prayMap.invalidateSize(), 100);
  }

  // -------------------------
  // OPEN MODAL
  // -------------------------
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      initPrayMap();
    });
  }

  // -------------------------
  // CLOSE MODAL
  // -------------------------
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
      if (flipWrapper) flipWrapper.classList.remove("is-flipped");
    });
  }

  // -------------------------
  // FLIP MODAL
  // -------------------------
  if (flipBtn && flipWrapper) {
    flipBtn.addEventListener("click", () => {
      flipWrapper.classList.toggle("is-flipped");
    });
  }

});

