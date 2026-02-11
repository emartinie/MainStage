// ---------------- PrayerStore ----------------
const PrayerStore = (() => {
  const STORAGE_KEY = "prayers";
  const ACK_KEY = "prayedFor";
  const EXPIRATION_HOURS = 72;

  let prayers = [];
  let acknowledgments = {};

  // ---- utils ----
  const now = () => Date.now();
  const hours = ms => ms / 36e5;

  const log = (...args) => console.log("🙏 PrayerStore:", ...args);
  // comment out ↑ when stable

  // ---- persistence ----
  function load() {
    prayers = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    acknowledgments = JSON.parse(localStorage.getItem(ACK_KEY) || "{}");

    log("loaded", prayers.length, "prayers");
    expire();
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prayers));
    localStorage.setItem(ACK_KEY, JSON.stringify(acknowledgments));
    log("saved");
  }

  // ---- core logic ----
  function add({ name, message, coordinates }) {
    const prayer = {
      id: "p_" + now(),
      name: name || "Anonymous",
      message,
      coordinates, // [lat, lng]
      createdAt: now()
    };

    prayers.push(prayer);
    save();

    log("added", prayer);
    return prayer;
  }

  function acknowledge(prayerId) {
    acknowledgments[prayerId] = true;
    save();
    log("acknowledged", prayerId);
  }

  function expire() {
    const before = prayers.length;
    prayers = prayers.filter(p => hours(now() - p.createdAt) <= EXPIRATION_HOURS);

    if (prayers.length !== before) {
      save();
      log("expired", before - prayers.length, "prayers");
    }
  }

  function getActive() {
    return prayers.map(p => ({
      ...p,
      acknowledged: !!acknowledgments[p.id]
    }));
  }

  // ---- geolocation helper ----
  function withGeolocation(cb) {
    if (!navigator.geolocation) {
      log("geolocation unavailable");
      cb(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        log("geolocation acquired", coords);
        cb(coords);
      },
      err => {
        console.warn("📍 Geolocation error", err);
        cb(null);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  // ---- init ----
  load();

  return {
    add,
    acknowledge,
    getActive,
    withGeolocation,
    expire
  };
})()