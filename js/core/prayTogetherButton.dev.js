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

  function addUserLocation(map) {
  if (!navigator.geolocation) {
    console.log("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const userLatLng = [lat, lng];

      // Move map to user
      map.setView(userLatLng, 10);

      // Add "You are here" marker
      const userMarker = L.circleMarker(userLatLng, {
        radius: 8,
        fillColor: "#4CAF50",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map);

      userMarker.bindPopup("You are here.<br>Zoom to see nearby prayer requests.").openPopup();
    },
    (error) => {
      console.log("Location error:", error);
    }
  );
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

        addUserLocation(prayMap);

});

