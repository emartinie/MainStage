// FloatingPlayer.js  —  no deps, mobile + desktop drag, edge snap, dock, circular progress

/* =======================
   1) Default (fallback) playlist
   ======================= */
let playlist = [
  { title: "Torah",      eng: "/audio/torah_eng.mp3",      heb: "/audio/torah_heb.mp3",      grk: "/audio/torah_grk.mp3" },
  { title: "Prophets",   eng: "/audio/prophets_eng.mp3",   heb: "/audio/prophets_heb.mp3",   grk: "/audio/prophets_grk.mp3" },
  { title: "Writings",   eng: "/audio/gospels_eng.mp3",    heb: "/audio/gospels_heb.mp3",    grk: "/audio/gospels_grk.mp3" },
  { title: "Gospels",    eng: "/audio/gospels_eng.mp3",    heb: "/audio/gospels_heb.mp3",    grk: "/audio/gospels_grk.mp3" },
  { title: "Revelation", eng: "/audio/gospels_eng.mp3",    heb: "/audio/gospels_heb.mp3",    grk: "/audio/gospels_grk.mp3" },
  { title: "Psalms",     eng: "/audio/gospels_eng.mp3",    heb: "/audio/gospels_heb.mp3",    grk: "/audio/gospels_grk.mp3" }
];

/* =======================
   2) Public helpers (optional)
   - update playlist dynamically
   - set language externally
   - listen for "now playing"
   ======================= */
function setFloatingPlaylist(newList) {
  if (Array.isArray(newList) && newList.length) {
    playlist = newList;
    // If player exists, reload from first track
    const evt = new CustomEvent("player:updatePlaylist", { detail: { playlist } });
    window.dispatchEvent(evt);
  }
}

function setFloatingLanguage(lang) {
  const evt = new CustomEvent("player:setLang", { detail: { lang } });
  window.dispatchEvent(evt);
}

// Expose to window for your loader or popup
window.setFloatingPlaylist = setFloatingPlaylist;
window.setFloatingLanguage = setFloatingLanguage;

/* =======================
   3) Player setup
   ======================= */
function setupFloatingPlayer() {
  const existing = document.getElementById("floatingPlayer");
  if (existing) existing.remove();

  // Container
  const player = document.createElement("div");
  player.id = "floatingPlayer";
  Object.assign(player.style, {
    position: "fixed",
    bottom: "1rem",
    right: "1rem",
    width: "190px",
    height: "190px",
    borderRadius: "50%",
    backdropFilter: "blur(8px)",
    background: "radial-gradient(120% 120% at 30% 30%, rgba(31,41,55,0.95), rgba(17,24,39,0.9))",
    boxShadow: "0 12px 28px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.06)",
    display: "grid",
    gridTemplateRows: "1fr auto",
    alignItems: "center",
    justifyItems: "center",
    color: "#fff",
    padding: "10px",
    cursor: "grab",
    zIndex: 9999,
    userSelect: "none",
    overflow: "hidden"
  });

  // Glow ring (progress lives on top of this)
  const ring = document.createElement("div");
  Object.assign(ring.style, {
    position: "absolute",
    inset: "8px",
    borderRadius: "50%",
    background: "conic-gradient(from 0deg, rgba(59,130,246,0.25), rgba(34,197,94,0.25), rgba(59,130,246,0.25))",
    filter: "blur(8px)",
    opacity: "0.6",
    pointerEvents: "none"
  });
  player.appendChild(ring);

  // Progress SVG
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  const size = 170;
  const r = 76;
  const C = 2 * Math.PI * r;
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  Object.assign(svg.style, {
    position: "absolute",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    overflow: "visible",
    pointerEvents: "none"
  });

  const circleBg = document.createElementNS(svgNS, "circle");
  circleBg.setAttribute("cx", (size/2));
  circleBg.setAttribute("cy", (size/2));
  circleBg.setAttribute("r", r);
  circleBg.setAttribute("stroke", "rgba(255,255,255,0.15)");
  circleBg.setAttribute("stroke-width", "6");
  circleBg.setAttribute("fill", "none");

  const circleProgress = document.createElementNS(svgNS, "circle");
  circleProgress.setAttribute("cx", (size/2));
  circleProgress.setAttribute("cy", (size/2));
  circleProgress.setAttribute("r", r);
  circleProgress.setAttribute("stroke", "url(#fpGrad)");
  circleProgress.setAttribute("stroke-width", "6");
  circleProgress.setAttribute("fill", "none");
  circleProgress.setAttribute("stroke-linecap", "round");
  circleProgress.setAttribute("stroke-dasharray", C.toString());
  circleProgress.setAttribute("stroke-dashoffset", C.toString());
  circleProgress.setAttribute("transform", `rotate(-90 ${size/2} ${size/2})`);

  // Gradient for progress
  const defs = document.createElementNS(svgNS, "defs");
  const grad = document.createElementNS(svgNS, "linearGradient");
  grad.setAttribute("id", "fpGrad");
  grad.setAttribute("x1", "0%");
  grad.setAttribute("y1", "0%");
  grad.setAttribute("x2", "100%");
  grad.setAttribute("y2", "0%");
  const stop1 = document.createElementNS(svgNS, "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "#60a5fa");
  const stop2 = document.createElementNS(svgNS, "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "#34d399");
  grad.appendChild(stop1); grad.appendChild(stop2);
  defs.appendChild(grad);

  svg.appendChild(defs);
  svg.appendChild(circleBg);
  svg.appendChild(circleProgress);
  player.appendChild(svg);

  // Inner content
  const center = document.createElement("div");
  Object.assign(center.style, {
    display: "grid",
    placeItems: "center",
    textAlign: "center",
    width: "100%",
    height: "100%"
  });

  // Title (auto-fit with clamp)
  const titleEl = document.createElement("div");
  titleEl.textContent = ""; // set in loadTrack
  Object.assign(titleEl.style, {
    fontWeight: "600",
    lineHeight: "1.1",
    padding: "0 12px",
    maxWidth: "90%",
    display: "block",
    color: "#e5e7eb",
    fontSize: "clamp(12px, 2.4vw, 16px)",
    textShadow: "0 1px 1px rgba(0,0,0,0.5)"
  });

  // Audio (hidden native, we’ll keep controls off for sleekness)
  const audio = document.createElement("audio");
  audio.setAttribute("preload", "metadata"); // faster progress calc
  audio.style.display = "none";

  // Controls row
  const controls = document.createElement("div");
  Object.assign(controls.style, {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "6px"
  });

  const btn = (label, title) => {
    const b = document.createElement("button");
    b.textContent = label;
    b.title = title;
    Object.assign(b.style, {
      padding: "6px 10px",
      borderRadius: "9999px",
      border: "1px solid rgba(255,255,255,0.15)",
      background: "rgba(255,255,255,0.08)",
      color: "#fff",
      backdropFilter: "blur(4px)",
      boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      fontSize: "12px"
    });
    b.onpointerdown = e => e.stopPropagation(); // avoid dragging when tapping buttons
    return b;
  };

  const nextBtn = btn("⏭", "Next");
  const langBtn = btn("🌐", "Language");
  const sleepBtn = btn("🌙", "Auto-next (sleep) on/off");
  sleepBtn.dataset.active = "1"; // default ON

  controls.appendChild(langBtn);
  controls.appendChild(nextBtn);
  controls.appendChild(sleepBtn);

  center.appendChild(titleEl);
  center.appendChild(controls);
  player.appendChild(center);

  // Invisible expanded hit target for drag on mobile
  const dragPad = document.createElement("div");
  Object.assign(dragPad.style, {
    position: "absolute",
    inset: 0,
    borderRadius: "50%"
  });
  player.appendChild(dragPad);

  document.body.appendChild(player);

  /* ====== State ====== */
  let currentIndex = 0;
  let currentLang = "eng";
  let autoNext = true;

  /* ====== Helpers ====== */
  function updateProgress() {
    if (!audio.duration || isNaN(audio.duration)) {
      circleProgress.setAttribute("stroke-dashoffset", C.toString());
      return;
    }
    const p = audio.currentTime / audio.duration; // 0..1
    const offset = C * (1 - p);
    circleProgress.setAttribute("stroke-dashoffset", offset.toString());
  }

  function loadTrack() {
    const item = playlist[currentIndex] || {};
    const src = item[currentLang];

    titleEl.textContent = `${item.title ?? "Untitled"} (${(currentLang || "eng").toUpperCase()})`;
    audio.src = src || "";
    circleProgress.setAttribute("stroke-dashoffset", C.toString()); // reset ring
    audio.play().catch(() => {/* ignored (autoplay may be blocked) */});

    // Broadcast "now playing" if anyone cares (e.g., your marquee)
    window.dispatchEvent(new CustomEvent("player:nowPlaying", {
      detail: {
        title: item.title || "",
        lang: currentLang,
        src: src || "",
        index: currentIndex
      }
    }));
  }

  function playNext() {
    currentIndex = (currentIndex + 1) % playlist.length;
    loadTrack();
  }

  function cycleLang() {
    currentLang = currentLang === "eng" ? "heb" : currentLang === "heb" ? "grk" : "eng";
    loadTrack();
  }

  /* ====== Wire native audio ====== */
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", updateProgress);
  audio.addEventListener("progress", updateProgress);
  audio.addEventListener("ended", () => {
    if (autoNext) playNext();
  });

  /* ====== Wire buttons ====== */
  nextBtn.addEventListener("click", playNext);
  langBtn.addEventListener("click", cycleLang);
  sleepBtn.addEventListener("click", () => {
    autoNext = !autoNext;
    sleepBtn.style.opacity = autoNext ? "1" : "0.55";
    sleepBtn.style.borderColor = autoNext ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.35)";
  });

  /* ====== Drag + Snap / Dock ====== */
  let isDragging = false;
  let startX, startY, origX, origY;

  function onPointerDown(e) {
    isDragging = true;
    const rect = player.getBoundingClientRect();
    origX = rect.left;
    origY = rect.top;
    startX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    startY = e.type.startsWith("touch") ? e.touches[0].clientY : e.clientY;
    player.style.cursor = "grabbing";
    e.preventDefault();
  }
  function onPointerMove(e) {
    if (!isDragging) return;
    const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.startsWith("touch") ? e.touches[0].clientY : e.clientY;
    player.style.left = origX + (clientX - startX) + "px";
    player.style.top  = origY + (clientY - startY) + "px";
    player.style.right = "auto";
    player.style.bottom = "auto";
  }
  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    player.style.cursor = "grab";
    snapToEdge();
  }

  function snapToEdge() {
    const rect = player.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 12;

    // Distance to each edge
    const dLeft = rect.left;
    const dRight = vw - (rect.right);
    const dTop = rect.top;
    const dBottom = vh - (rect.bottom);

    // Choose nearest edge
    const min = Math.min(dLeft, dRight, dTop, dBottom);

    if (min === dRight) {
      player.style.left = "auto";
      player.style.right = `${margin}px`;
    } else if (min === dLeft) {
      player.style.left = `${margin}px`;
      player.style.right = "auto";
    } else if (min === dTop) {
      player.style.top = `${margin}px`;
      player.style.bottom = "auto";
    } else {
      player.style.top = "auto";
      player.style.bottom = `${margin}px`;
    }
  }

  // Dock toggle via triple-dot area (top-right)
  const dockBtn = document.createElement("button");
  dockBtn.textContent = "⫶";
  Object.assign(dockBtn.style, {
    position: "absolute",
    top: "6px",
    right: "8px",
    padding: "2px 6px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(0,0,0,0.25)",
    color: "#fff",
    fontSize: "12px",
    lineHeight: "1",
    cursor: "pointer"
  });
  dockBtn.onpointerdown = e => e.stopPropagation();
  dockBtn.onclick = () => toggleDock();
  player.appendChild(dockBtn);

  let docked = false;
  function toggleDock() {
    docked = !docked;
    if (docked) {
      // bottom dock mini mode
      Object.assign(player.style, {
        width: "100%",
        maxWidth: "520px",
        height: "72px",
        borderRadius: "14px",
        left: "50%",
        bottom: "10px",
        right: "auto",
        top: "auto",
        transform: "translateX(-50%)"
      });
      svg.style.display = "none";
      ring.style.display = "none";
      center.style.marginTop = "0";
      titleEl.style.fontSize = "clamp(12px, 2.2vw, 15px)";
    } else {
      // restore circle
      Object.assign(player.style, {
        width: "190px",
        height: "190px",
        borderRadius: "50%",
        bottom: "1rem",
        right: "1rem",
        left: "auto",
        top: "auto",
        transform: "none"
      });
      svg.style.display = "";
      ring.style.display = "";
      center.style.marginTop = "0";
      snapToEdge();
    }
  }

  // Pointer listeners (mouse + touch)
  player.addEventListener("mousedown", onPointerDown);
  player.addEventListener("touchstart", onPointerDown, { passive: false });
  window.addEventListener("mousemove", onPointerMove, { passive: true });
  window.addEventListener("touchmove", onPointerMove, { passive: false });
  window.addEventListener("mouseup", onPointerUp);
  window.addEventListener("touchend", onPointerUp);

  /* ====== External event hooks (optional) ======
     - window.setFloatingPlaylist([...]) calls "player:updatePlaylist"
     - window.setFloatingLanguage('eng'|'heb'|'grk') calls "player:setLang"
     - your loader can also dispatch these directly.
  */
  function normalizeFromAudioPlaylist(list) {
    // Accepts [{label, src, eng, heb, grk}, ...] and maps to our shape
    return (list || []).map(item => ({
      title: item.label || item.title || "Untitled",
      eng: item.eng || item.src || "",
      heb: item.heb || item.src || "",
      grk: item.grk || item.src || ""
    }));
  }

  window.addEventListener("player:updatePlaylist", (e) => {
    const pl = e.detail?.playlist;
    if (Array.isArray(pl) && pl.length) {
      playlist = pl;
      currentIndex = 0;
      loadTrack();
    }
  });

  window.addEventListener("player:setLang", (e) => {
    const lang = (e.detail?.lang || "").toLowerCase();
    if (["eng","heb","grk"].includes(lang)) {
      currentLang = lang;
      loadTrack();
    }
  });

  // Bonus: if weekData already exists on window (from your loader), auto-pull it
  if (window.weekData?.sections?.audio_playlist) {
    const pl = normalizeFromAudioPlaylist(window.weekData.sections.audio_playlist);
    if (pl.length) {
      playlist = pl;
    }
  }

  // Initial load
  loadTrack();
}

/* =======================
   4) Boot
   ======================= */
document.addEventListener("DOMContentLoaded", setupFloatingPlayer);
