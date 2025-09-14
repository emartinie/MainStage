function setupFloatingPlayer() {
  const existing = document.getElementById("floatingPlayer");
  if (existing) existing.remove();

  // --- Player container ---
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
    display: "grid",
    gridTemplateRows: "1fr auto",
    alignItems: "center",
    justifyItems: "center",
    color: "#fff",
    padding: "10px",
    cursor: "grab",
    zIndex: 9999,
    userSelect: "none",
    overflow: "visible"
  });

  // --- Center div ---
  const center = document.createElement("div");
  Object.assign(center.style, {
    display: "grid",
    placeItems: "center",
    width: "100%",
    height: "100%",
    position: "relative"
  });

  player.appendChild(center);

  // --- Button helper ---
  const btn = (label, title, cb) => {
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
      fontSize: "12px",
      cursor: "pointer",
      pointerEvents: "auto",
      userSelect: "none",
      touchAction: "manipulation",
      zIndex: 5
    });
    b.addEventListener("pointerdown", e => e.stopPropagation());
    b.addEventListener("click", cb);
    b.addEventListener("touchend", e => { e.preventDefault(); cb(e); });
    return b;
  };

  // --- State ---
  let docked = false;
  const playPauseBtn = btn("▶", "Play / Pause", () => { /* play/pause logic */ });
  const nextBtn = btn("⏭", "Next", () => { /* next track */ });
  const langBtn = btn("🌐", "Language", () => { /* language switch */ });
  const sleepBtn = btn("🌙", "Auto-next on/off", () => { sleepBtn.dataset.active = sleepBtn.dataset.active === "1" ? "0" : "1"; });

  // --- Dock Button ---
  const dockBtn = btn("⫶", "Dock / Undock", () => {
    docked = !docked;
    const dockContainer = document.getElementById("floating-player-root");
    if (docked && dockContainer) {
      dockContainer.appendChild(player);
      Object.assign(player.style, {
        position: "relative",
        width: "100%",
        maxWidth: "520px",
        height: "72px",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px"
      });
    } else {
      document.body.appendChild(player);
      Object.assign(player.style, {
        position: "fixed",
        width: "190px",
        height: "190px",
        bottom: "1rem",
        right: "1rem",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0"
      });
    }
    // safely adjust center button size if defined
    if (window.centerBtn) {
      window.centerBtn.style.width = docked ? "48px" : "64px";
      window.centerBtn.style.height = docked ? "48px" : "64px";
      window.centerBtn.style.fontSize = docked ? "20px" : "24px";
    }
  });

  // --- Controls container ---
  const controls = document.createElement("div");
  Object.assign(controls.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 4
  });

  // --- Add orbit buttons ---
  const orbitButtons = [dockBtn, nextBtn, langBtn, sleepBtn];
  orbitButtons.forEach(b => {
    b.style.pointerEvents = "auto";
    controls.appendChild(b);
  });
  center.appendChild(controls);

  // --- Circular placement ---
  const radius = 70;
  orbitButtons.forEach((b, i) => {
    const angle = (i / orbitButtons.length) * 2 * Math.PI;
    Object.assign(b.style, {
      position: "absolute",
      left: `${50 + radius * Math.cos(angle)}%`,
      top: `${50 + radius * Math.sin(angle)}%`,
      transform: "translate(-50%,-50%)"
    });
  });

  // --- Append to DOM ---
  document.body.appendChild(player);

  // --- Safe update popup buttons ---
  function updatePopupButtonPositions() {
    const buttons = document.querySelectorAll(".popup-button");
    if (!buttons.length) return; // skip if none exist
    buttons.forEach(btn => {
      // adjust button positions here if needed
    });
  }
  updatePopupButtonPositions(); // call once safely
  window.updatePopupButtonPositions = updatePopupButtonPositions; // make globally callable
}

document.addEventListener("DOMContentLoaded", setupFloatingPlayer);
