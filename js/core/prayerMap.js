// ---------------- PrayerMap.Dev.js ----------------
console.log("🔥 prayerMap.dev.js LOADED");

const PrayerMap = (() => {
  const PRAYER_EXPIRATION_HOURS = 72;
  let prayerLayer = null;
  let prayers = [];

  // Track prayers the user has acknowledged
  const localAcknowledgments = JSON.parse(localStorage.getItem("prayedFor") || "{}");

  // ---------------- Helpers ----------------
  const now = () => new Date();
  const hoursDiff = (d1, d2) => (d1 - d2) / 36e5;

  // ---------------- Core Functions ----------------
  function addPrayer({ name, message, coordinates }) {
    if (!prayerLayer) return;

    const prayer = {
      id: "p" + Date.now(),
      name: name || "Anonymous",
      message,
      coordinates,
      createdAt: now().toISOString()
    };

    prayers.push(prayer);

    const marker = L.circleMarker(coordinates, {
      radius: 7,
      color: "#22c55e",
      fillColor: "#4ade80",
      fillOpacity: 0.85,
      weight: 1.5
    });

    const acknowledged = localAcknowledgments[prayer.id];

    marker.bindPopup(`
      <div style="max-width:220px">
        <strong>${prayer.name}</strong><br>
        <p style="margin:6px 0; font-size:13px;">${prayer.message}</p>
        <button
          style="padding:6px 10px; border-radius:6px; background:${acknowledged ? '#94a3b8' : '#2563eb'}; color:white; font-size:12px; border:none; cursor:pointer;"
          ${acknowledged ? "disabled" : ""}
          onclick="PrayerMap.acknowledgePrayer('${prayer.id}', this)">
          ${acknowledged ? "🙏 Prayed" : "🙏 I prayed"}
        </button>
      </div>
    `);

    prayerLayer.addLayer(marker);
  }

  function acknowledgePrayer(prayerId, btn) {
    localAcknowledgments[prayerId] = true;
    localStorage.setItem("prayedFor", JSON.stringify(localAcknowledgments));
    if (btn) {
      btn.disabled = true;
      btn.textContent = "🙏 Prayed";
      btn.style.background = "#94a3b8";
    }
  }

  function cleanExpiredPrayers() {
    const nowDate = now();
    prayers = prayers.filter(p => hoursDiff(nowDate, new Date(p.createdAt)) <= PRAYER_EXPIRATION_HOURS);
    if (!prayerLayer) return;
    prayerLayer.clearLayers();
    prayers.forEach(p => addPrayer(p));
  }

  function setupPrayerForm(map) {
    const tryHook = () => {
      const form = document.getElementById("prayerForm");
      if (!form) {
        console.log("⏳ Waiting for prayerForm...");
        return false;
      }

      form.addEventListener("submit", e => {
        e.preventDefault();
        console.log("🙏 Prayer form submitted");

        const name =
          document.getElementById("prayerName")?.value.trim() || "Anonymous";
        const message =
          document.getElementById("prayerMessage")?.value.trim();

        if (!message) {
          alert("Please enter a prayer request.");
          return;
        }

        const center = map.getCenter();
        addPrayer({
          name,
          message,
          coordinates: [center.lat, center.lng]
        });

        form.reset();
        closePrayer();
      });

      console.log("🙏 Prayer form hooked");
      return true;
    };

    if (!tryHook()) {
      const interval = setInterval(() => {
        if (tryHook()) clearInterval(interval);
      }, 200);
    }
  }

  // ---------------- Overlay Controls ----------------
  function openPrayer() {
    document.getElementById("prayerOverlay")?.classList.remove("hidden");
  }

  function closePrayer() {
    document.getElementById("prayerOverlay")?.classList.add("hidden");
  }

  // ---------------- Init ----------------
  function init(map) {
    console.log("🔥 Dev PrayerMap.init CALLED", map);
    if (prayerLayer) return; // prevent double init

    prayerLayer = L.layerGroup().addTo(map);
    //prayerLayer.bringToFront();

    console.log("🙏 PrayerMap.Dev initialized");

    setupPrayerForm(map);

    // Clean expired prayers every hour
    setInterval(() => cleanExpiredPrayers(), 60 * 60 * 1000);
  }

  // ---------------- Exposed Methods ----------------
  return {
    init,
    addPrayer,
    acknowledgePrayer,
    openPrayer,
    closePrayer
  };
  
})();

