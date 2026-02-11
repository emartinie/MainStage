import { PrayerMap } from './prayerMap.dev.js';

//window.map = window.map || L.map("mapContainer").setView([39.5, -98.35], 4);
console.log("🧪 typeof window.map BEFORE:", typeof window.map, window.map);

console.log("🧭 HG map.dev.js START");

// ---- container check ----
const container =
  document.getElementById("mapContainer") ||
  document.getElementById("map");

console.log("📦 map container found:", container);

if (!container) {
  console.error("❌ No map container in DOM");
} else {
  console.log("📐 container height:", getComputedStyle(container).height);
}

// ---- Leaflet check ----
if (!window.L) {
  console.error("❌ Leaflet NOT available in HG map");
} else {
  console.log("✅ Leaflet available in HG map");
}

// ---- map creation ----
if (!window.map && window.L && container) {
  console.log("🗺️ Creating HG map…");

  window.map = L.map(container).setView([39.5, -98.35], 4);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18
  }).addTo(window.map);

  console.log("✅ HG map CREATED", window.map);
} else {
  console.log("♻️ HG map already exists, reusing", window.map);
}

console.log("🟢 Initializing PrayerMap");
PrayerMap.init(window.map);

// ---- final sanity ----
setTimeout(() => {
  if (window.map) {
    console.log("🔍 HG map size invalidate");
    window.map.invalidateSize();
  } else {
    console.error("❌ HG map never existed");
  }
}, 500);



console.log("🧭 HG map.dev.js ENDED");

console.log("🧪 Marker sanity test marker starting");

const testMarker = L.marker([39.5, -98.35]).addTo(window.map);

testMarker.bindPopup("✅ Eddie's Map pipeline works").openPopup();

console.log("🧪 Test marker added", testMarker);

// --- HG GeoJSON markers ---
function loadHomeGroupMarkers() {
  if (!window.map) {
    console.error("❌ Cannot load markers: map not initialized");
    return;
  }

  // Cluster group for markers
  const markers = L.markerClusterGroup();

  fetch("./HomeGroupsMap.geojson")
    .then((response) => {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then((data) => {
      data.features.forEach((feature, idx) => {
        const coordsStr = feature.properties.Coordinates;
        if (!coordsStr) {
          console.warn(`⚠️ Feature ${idx} missing Coordinates`);
          return;
        }
        const coords = coordsStr.split(",").map(Number);
        if (coords.length < 2) {
          console.warn(`⚠️ Feature ${idx} has invalid Coordinates`);
          return;
        }
        const [lon, lat] = coords;

        const marker = L.marker([lat, lon]);
        marker.bindPopup(`<strong>${feature.properties.Name || "Unnamed"}</strong>`);
        markers.addLayer(marker);

        // Optional: also add special PrayerMap marker
        if (window.PrayerMap) {
          PrayerMap.createPrayerMarker({
            coordinates: [lat, lon],
            name: feature.properties.Name,
            message: feature.properties.Message || ""
          });
        }
      });

      window.map.addLayer(markers);
      console.log(`📦 ${data.features.length} GeoJSON markers loaded`);
    })
    .catch((err) => console.error("❌ Error loading GeoJSON:", err));
}

// Call after map is ready
loadHomeGroupMarkers();

// ----------------- Initialize PrayerMap -----------------
if (window.PrayerMap) {
  console.log("🟢 Initializing PrayerMap");
  PrayerMap.init(window.map);
} else {
  console.warn("⚠️ PrayerMap not found on window");
}