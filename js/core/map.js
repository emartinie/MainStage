(() => {



  // ---------------- Map Initialization ----------------

  window.map = L.map("mapContainer", { zoomControl: true }).setView([39.5, -98.35], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "© OpenStreetMap"
  }).addTo(window.map);

  if(window.PrayerMap) {
    PrayerMap.init(window.map);
    console.log("🧩 PrayerMap.init invoked from map.dev.js");
  } else {
    console.warn("⚠️ PrayerMap not found on window");
  }

  // ---------------- Layer Groups ----------------
  const staticLayer = L.layerGroup().addTo(map);   // HomeGroups.geojson
  const helloLayer = L.layerGroup().addTo(map);   // Hello/interactive
  const allItems = [];                          // For community panel / search

  // ---------------- UUID Helper ----------------
  function generateUUID() {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, () =>
      Math.floor(Math.random() * 16).toString(16)
    );
  }

  // ---------------- HomeGroups (Community) ----------------
  function loadCommunityGeoJSON(url) {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data?.features)) {
          console.error("Invalid GeoJSON", data);
          return;
        }

        data.features.forEach(f => {
          let lat, lng;

          // 1️⃣ Standard GeoJSON: geometry.coordinates = [lng, lat]
          if (Array.isArray(f.geometry?.coordinates)) {
            lng = Number(f.geometry.coordinates[0]);
            lat = Number(f.geometry.coordinates[1]);
          }

          // 2️⃣ Fallback: properties.Coordinates = "lat,lng" or "lng,lat"
          if ((!Number.isFinite(lat) || !Number.isFinite(lng)) &&
            typeof f.properties?.Coordinates === "string") {
            const parts = f.properties.Coordinates
              .split(",")
              .map(n => Number(n.trim()));

            if (parts.length >= 2) {
              if (Math.abs(parts[0]) <= 90) {
                lat = parts[0];
                lng = parts[1];
              } else {
                lng = parts[0];
                lat = parts[1];
              }
            }
          }

          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            console.warn("Skipping feature with invalid coords", f);
            return;
          }

          const coords = [lat, lng];

          // ---- Parse properties ----
          const name = f.properties?.Name || "A Friend";
          const desc = f.properties?.description || "";

          const cityMatch = desc.match(/City:\s*([^\n<]+)/i);
          const noteMatch = desc.match(/Comments:\s*([^\n<]+)/i);

          const city = cityMatch ? cityMatch[1].trim() : "";
          const note = noteMatch
            ? noteMatch[1].trim()
            : "Walking a similar path.";

          // ---- Popup ----
          const popupHTML = `
          <div style="max-width:220px; color:#e5e7eb">
            <strong>${name}</strong><br>
            <span style="color:#94a3b8">${city}</span>
            <p style="margin-top:6px; font-size:13px;">${note}</p>
          </div>
        `;

          // ---- Marker ----
          const marker = L.circleMarker(coords, {
            radius: 7,
            color: "#38bdf8",
            fillColor: "#0ea5e9",
            fillOpacity: 0.85,
            weight: 1.5
          }).bindPopup(popupHTML);

          communityLayer.addLayer(marker);

          // ✅ REGISTER FOR COMMUNITY PANEL
          allItems.push({
            type: "community",
            name,
            city,
            message: note,
            timestamp: Date.now(),
            marker
          });
        });

        // ---- Render panel list AFTER load ----
        renderCommunityList();
      })
      .catch(err => console.error("GeoJSON load error:", err));
  }

  // Usage example
  const communityLayer = L.layerGroup().addTo(map);
  loadCommunityGeoJSON("./HomeGroupsMap.geojson", map, communityLayer);

  // ---------------- Hello Layer ----------------
  function renderHello(hello) {
    const marker = L.circleMarker(hello.coordinates, {
      radius: 7,
      color: "#facc15",
      fillColor: "#fcd34d",
      fillOpacity: 0.85
    });
    const popupHTML = `<strong>${hello.name}</strong><br><p>${hello.message || "👋 says hello!"}</p>`;
    marker.bindPopup(popupHTML);
    helloLayer.addLayer(marker);

    allItems.push({ type: "hello", ...hello, marker });
  }

  function addHello({ name, message, coordinates }) {
    const hello = { id: generateUUID(), timestamp: Date.now(), name, message, coordinates };
    renderHello(hello);
  }

  // ---------------- Community Panel ----------------
  function renderCommunityList(filter = "") {
    const list = document.getElementById("communityList");
    if (!list) return;

    const q = filter.toLowerCase();
    list.innerHTML = "";

    const filtered = allItems
      .filter(i => i.name.toLowerCase().includes(q) || (i.message || "").toLowerCase().includes(q))
      .sort((a, b) => b.timestamp - a.timestamp);

    if (!filtered.length) {
      list.innerHTML = `<div class="text-slate-500 text-center py-6">Nothing here right now 🌱</div>`;
      return;
    }

    filtered.forEach(item => {
      const div = document.createElement("div");
      div.className = "p-2 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer";
      div.innerHTML = `
        <div class="font-medium text-slate-200">${item.type === "hello" ? "👋" : "📍"} ${item.name}</div>
        <div class="text-slate-400 text-xs truncate">${item.message || ""}</div>
      `;
      div.onclick = () => {
        map.setView(item.marker.getLatLng(), 10);
        item.marker.openPopup();
      };
      list.appendChild(div);
    });
  }

  // ---------------- Search ----------------
  document.getElementById("mapSearch")?.addEventListener("input", e => renderCommunityList(e.target.value));

  // ---------------- Example Hellos ----------------
  addHello({ name: "Test Friend", message: "👋 Hello from nowhere!", coordinates: [40, -95] });

  // ---------------- Optional Geolocation ----------------
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      L.circleMarker([latitude, longitude], {
        radius: 10,
        color: "#22c55e",
        fillColor: "#4ade80",
        fillOpacity: 0.9
      }).addTo(map).bindPopup("📍 You are here.<br>Zoom out to find people nearby.").openPopup();
    });
  }

  // ---------------- Initialize ----------------
  //loadStaticGeoJSON("./HomeGroupsMap.geojson");

// 🔗 Explicit PrayerMap boot
//setTimeout(() => {
 // console.log("🧩 Forcing PrayerMap.init");
//  PrayerMap.init(window.map);
//}, 0);

})();