// prayTogetherButton.dev.js
console.log("🙏 PrayTogetherButton loaded");

// Open/Close modal
function openPrayTogetherModal() {
  const modal = document.getElementById("prayTogetherModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // lock scroll

  // Initialize Leaflet map inside modal
  const mapDiv = document.getElementById("prayTogetherMap");
  if (mapDiv && !mapDiv._leaflet_map) { // avoid re-creating map
    const map = L.map(mapDiv).setView([36.1, -86.7], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // mark that map is initialized to prevent duplicates
    mapDiv._leaflet_map = map;

    // Example: one fake prayer marker
    L.circleMarker([36.2, -86.8], { color: "#22c55e", radius: 7 }).addTo(map)
      .bindPopup("Sample Prayer: 'Peace and love'");
  }
}

function closePrayTogetherModal() {
  const modal = document.getElementById("prayTogetherModal");
  if (!modal) return;
  modal.classList.add("hidden");
  document.body.style.overflow = ""; // restore scroll
}

// Attach listeners immediately
document.getElementById("prayTogetherBtn")?.addEventListener("click", openPrayTogetherModal);
document.getElementById("closePrayTogether")?.addEventListener("click", closePrayTogetherModal);