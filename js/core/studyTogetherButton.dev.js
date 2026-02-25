console.log("🙏 studyTogetherButton loaded");

let studyMap = null;

document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("studyTogetherBtn");
  const modal = document.getElementById("studyTogetherModal");
  const closeBtn = document.getElementById("closeStudyTogether");
  const flipBtn = document.getElementById("flipStudyTogetherBtn");
  const flipWrapper = document.getElementById("studyTogether-flipWrapper");

  if (!modal) {
    console.warn("studyTogetherModal not found");
    return;
  }

  // -------------------------
  // MAP INIT (safe + once)
  // -------------------------
  function initStudyMap() {
    const mapDiv = document.getElementById("studyTogetherMap");
    if (!mapDiv) return;
    if (studyMap) return; // prevent duplicate creation

    studyMap = L.map(mapDiv).setView([36.1, -86.7], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(studyMap);

    const clusterGroup = L.markerClusterGroup();
    clusterGroup.addLayer(
      L.marker([36.2, -86.8]).bindPopup("Sample studier")
    );
    studyMap.addLayer(clusterGroup);

    // ensure correct sizing after modal opens
    setTimeout(() => studyMap.invalidateSize(), 100);
  }

  function addUserLocation(studyMap) {
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
      studyMap.setView(userLatLng, 10);

      // Add "You are here" marker
      const userMarker = L.circleMarker(userLatLng, {
        radius: 8,
        fillColor: "#4CAF50",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(studyMap);

      userMarker.bindPopup("You are here.<br>Zoom to see nearby studier requests.").openPopup();
    },
    (error) => {
      console.log("Location error:", error);
    }
  );
}
      addUserLocation(studyMap);
  // -------------------------
  // OPEN MODAL
  // -------------------------
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
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

