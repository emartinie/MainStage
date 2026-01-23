// today.js
console.log("today.js LOADED");

(function () {
  const OVERLAY_ID = "todayOverlay";
  const PANEL_ID = "todayPanel";
  const DATE_ID = "todayDate";
  const LISTEN_BTN_ID = "todayListenBtn";
  const AUDIO_ID = "todayAudioPlayer";

  function getTodayDateText() {
    const d = new Date();
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function getSabbathStatusText() {
    const now = new Date();
    const day = now.getDay(); // 0 Sun - 6 Sat

    if (day === 6) {
      return "Today is Sabbath.";
    }

    if (day === 5) {
      return "Today is Friday. Sabbath begins at sunset.";
    }

    return "Today is not Sabbath.";
  }

  function renderToday() {
    const dateEl = document.getElementById(DATE_ID);
    if (dateEl) {
      dateEl.textContent = getTodayDateText();
    }

    const sabbathEl = document.getElementById("todaySabbath");
    if (sabbathEl) {
      sabbathEl.textContent = getSabbathStatusText();
    }
  }

  function openToday() {
    const overlay = document.getElementById(OVERLAY_ID);
    const panel = document.getElementById(PANEL_ID);
    if (!overlay || !panel) return;

    renderToday();
    overlay.classList.remove("hidden");

    requestAnimationFrame(() => {
      panel.classList.remove("opacity-0", "scale-95");
      panel.classList.add("opacity-100", "scale-100");
    });
  }

  function renderToday(container) {
  if (!container) return;

  container.innerHTML = `
    <h4 class="font-semibold mb-1">Today</h4>
    <p class="text-slate-400 text-sm mb-1">${getTodayDateText()}</p>
    <p class="text-slate-300 text-sm">${getSabbathStatusText()}</p>
  `;
}

  function closeToday() {
    const overlay = document.getElementById(OVERLAY_ID);
    const panel = document.getElementById(PANEL_ID);
    if (!overlay || !panel) return;

    panel.classList.remove("opacity-100", "scale-100");
    panel.classList.add("opacity-0", "scale-95");

    setTimeout(() => {
      overlay.classList.add("hidden");
    }, 250);
  }

  function setupAudio() {
    const btn = document.getElementById(LISTEN_BTN_ID);
    const player = document.getElementById(AUDIO_ID);
    if (!btn || !player) return;

    btn.addEventListener("click", () => {
      player.src =
        "https://emartinie.github.io/MainStage/audio/Zack/GN1TLV.m4a";
      player.play().catch(err =>
        console.warn("Audio play failed:", err)
      );
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("todayBtn")?.addEventListener("click", openToday);
    document
      .getElementById("todayCloseBtn")
      ?.addEventListener("click", closeToday);

    document.getElementById(OVERLAY_ID)?.addEventListener("click", e => {
      if (e.target.id === OVERLAY_ID) closeToday();
    });

    setupAudio();
    renderToday();
  });

  // Expose minimal API if needed later
  window.Today = {
    open: openToday,
    close: closeToday,
    render: renderToday
  };
})();