// requestStore.dev.js
console.log("🙏 requestStore.dev.js loaded");

const requestStore = (() => {
  const STORAGE_KEY = "requests";
  const ACK_KEY = "joined";
  const EXPIRATION_HOURS = 72;

  let requests = [];
  let joins = {};

  // ---- utils ----
  const now = () => Date.now();
  const hours = ms => ms / 36e5;
  const log = (...args) => console.log("🙏 RequestStore:", ...args);

  // ---- persistence ----
  function load() {
    requests = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    joins = JSON.parse(localStorage.getItem(ACK_KEY) || "{}");
    log("loaded", requests.length, "requests");
    expire();
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    localStorage.setItem(ACK_KEY, JSON.stringify(joins));
    log("saved");
  }

  // ---- core logic ----
  function add({ name, message, coordinates }) {
    const request = {
      id: "p_" + now(),
      name: name || "Anonymous",
      message: message || "",
      coordinates: coordinates || null, // [lat, lng]
      createdAt: now()
    };

    requests.push(request);
    save();
    log("added request:", request);
    return request;
  }

  function acknowledge(requestId) {
    joins[requestId] = true;
    save();
    log("acknowledged request:", requestId);
  }

  function expire() {
    const before = requests.length;
    requests = requests.filter(p => hours(now() - p.createdAt) <= EXPIRATION_HOURS);

    if (requests.length !== before) {
      save();
      log("expired", before - requests.length, "requests");
    }
  }

  function getActive() {
    return requests.map(p => ({
      ...p,
      joined: !!joins[p.id]
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

  // Exported API
  return {
    add,
    acknowledge, // previously 'join'
    getActive,
    withGeolocation,
    expire
  };
})();

export default requestStore;