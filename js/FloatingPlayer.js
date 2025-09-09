// FloatingPlayer.js — unified, mobile+desktop drag, snap, dock, progress, lang cycle, no default network requests.

(function () {
  /** =========================
   *  0) State / API
   *  ========================= */
  let playlist = [];         // no fallback => no accidental 404s
  let currentIndex = 0;
  let currentLang = "eng";   // 'eng' | 'heb' | 'grk'
  let autoNext = true;

  // Helpers to normalize incoming playlist items (from your week JSON)
  // Accepts [{label, src, eng, heb, grk}, ...]
  function normalize(list) {
    return (list || []).map(item => {
      const title = item.label || item.title || "Untitled";
      // If languages provided, use them; otherwise reuse src for all
      const eng = item.eng || item.src || "";
      const heb = item.heb || item.src || "";
      const grk = item.grk || item.src || "";
      return { title, eng, heb, grk };
    });
  }

  /** =========================
   *  1) DOM build
   *  ========================= */
  function setup() {
    const existing = document.getElementById("floating-player");
    if (existing) existing.remove();

    // Container
    const player = document.createElement("div");
    player.id = "floating-player";
    Object.assign(player.style, {
      position: "fixed",
      bottom: "1rem",
      right: "1rem",
      width: "190px",
      height: "190px",
      borderRadius: "50%",
      backdropFilter: "blur(8px)",
      background:
        "radial-gradient(120% 120% at 30% 30%, rgba(31,41,55,0.95), rgba(17,24,39,0.9))",
      boxShadow:
        "0 12px 28px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.06)",
      display: "grid",
      gridTemplateRows: "1fr auto",
      alignItems: "center",
      justifyItems: "center",
      color: "#fff",
      padding: "10px",
      cursor: "grab",
      zIndex: 9999,
      userSelect: "none",
      overflow: "hidden",
    });

    // Glow ring background
    const ring = document.createElement("div");
    Object.assign(ring.style, {
      position: "absolute",
      inset: "8px",
      borderRadius: "50%",
      background:
        "conic-gradient(from 0deg, rgba(59,130,246,0.25), rgba(34,197,94,0.25), rgba(59,130,246,0.25))",
      filter: "blur(8px)",
      opacity: "0.6",
      pointerEvents: "none",
    });
    player.appendChild(ring);

    // SVG progress ring
    const svgNS = "http://www.w3.org/2000/svg";
    const size = 170;
    const r = 76;
    const C = 2 * Math.PI * r;

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    Object.assign(svg.style, {
      position: "absolute",
      top: "10px",
      left: "50%",
      transform: "translateX(-50%)",
      overflow: "visible",
      pointerEvents: "none", // important: clicks pass through
    });

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
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);

    const circleBg = document.createElementNS(svgNS, "circle");
    circleBg.setAttribute("cx", size / 2);
    circleBg.setAttribute("cy", size / 2);
    circleBg.setAttribute("r", r);
    circleBg.setAttribute("stroke", "rgba(255,255,255,0.15)");
    circleBg.setAttribute("stroke-width", "6");
    circleBg.setAttribute("fill", "none");

    const circleProgress = document.createElementNS(svgNS, "circle");
    circleProgress.setAttribute("cx", size / 2);
    circleProgress.setAttribute("cy", size / 2);
    circleProgress.setAttribute("r", r);
    circleProgress.setAttribute("stroke", "url(#fpGrad)");
    circleProgress.setAttribute("stroke-width", "6");
    circleProgress.setAttribute("fill", "none");
    circleProgress.setAttribute("stroke-linecap", "round");
    circleProgress.setAttribute("stroke-dasharray", C.toString());
    circleProgress.setAttribute("stroke-dashoffset", C.toString());
    circleProgress.setAttribute(
      "transform",
      `rotate(-90 ${size / 2} ${size / 2})`
    );

    svg.appendChild(defs);
    svg.appendChild(circleBg);
    svg.appendChild(circleProgress);
    player.appendChild(svg);

    // Top-right dock (⫶)
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
      cursor: "pointer",
      zIndex: 2,
    });
    dockBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    player.appendChild(dockBtn);

    // Center content
    const center = document.createElement("div");
    Object.assign(center.style, {
      display: "grid",
      placeItems: "center",
      textAlign: "center",
      width: "100%",
      height: "100%",
      zIndex: 1,
    });

    // Title
    const titleEl = document.createElement("div");
    Object.assign(titleEl.style, {
      fontWeight: "600",
      lineHeight: "1.1",
      padding: "0 12px",
      maxWidth: "90%",
      color: "#e5e7eb",
      fontSize: "clamp(12px, 2.4vw, 16px)",
      textShadow: "0 1px 1px rgba(0,0,0,0.5)",
      marginBottom: "6px",
    });
    titleEl.textContent = "No tracks";
    center.appendChild(titleEl);

    // Controls row
    const controls = document.createElement("div");
    Object.assign(controls.style, {
      display: "flex",
      gap: "8px",
      alignItems: "center",
      justifyContent: "center",
      marginTop: "2px",
      zIndex: 3,
    });

    const makeBtn = (label, title) => {
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
      });
      // prevent drag when tapping buttons
      b.addEventListener("pointerdown", (e) => e.stopPropagation());
      return b;
    };

    const playBtn = makeBtn("▶️", "Play/Pause");
    const langBtn = makeBtn("🌐", "Language");
    const nextBtn = makeBtn("⏭", "Next");
    const sleepBtn = makeBtn("🌙", "Auto-next on/off");
    sleepBtn.dataset.active = "1";

    controls.appendChild(playBtn);
    controls.appendChild(langBtn);
    controls.appendChild(nextBtn);
    controls.appendChild(sleepBtn);
    center.appendChild(controls);

    // Hidden audio
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.style.display = "none";
    center.appendChild(audio);

    // A transparent drag pad that DOESN'T cover the controls
    const dragPad = document.createElement("div");
    Object.assign(dragPad.style, {
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      zIndex: 0, // behind controls
    });
    player.appendChild(dragPad);

    // Mount
    document.body.appendChild(player);

    /** =========================
     *  2) Behavior
     *  ========================= */
    function updateProgress() {
      if (!audio.duration || isNaN(audio.duration)) {
        circleProgress.setAttribute("stroke-dashoffset", C.toString());
        return;
      }
      const p = audio.currentTime / audio.duration;
      circleProgress.setAttribute(
        "stroke-dashoffset",
        (C * (1 - p)).toString()
      );
    }

    function currentItem() {
      return playlist[currentIndex] || null;
    }

    function srcFor(item, lang) {
      if (!item) return "";
      return (item[lang] || "").trim();
    }

    function setTitle(item) {
      if (!item) {
        titleEl.textContent = "No tracks";
        return;
      }
      titleEl.textContent = `${item.title} (${currentLang.toUpperCase()})`;
    }

    function loadTrack(autoPlay = true) {
      const item = currentItem();
      const src = srcFor(item, currentLang);

      setTitle(item);
      circleProgress.setAttribute("stroke-dashoffset", C.toString());

      if (!item || !src) {
        audio.removeAttribute("src");
        playBtn.textContent = "▶️";
        return;
      }

      audio.src = src;
      if (autoPlay) {
        audio
          .play()
          .then(() => (playBtn.textContent = "⏸️"))
          .catch(() => {
            // Autoplay blocked; keep as paused
            playBtn.textContent = "▶️";
          });
      } else {
        playBtn.textContent = "▶️";
      }

      // Broadcast "now playing" to anything listening (e.g., your marquee)
      window.dispatchEvent(
        new CustomEvent("player:nowPlaying", {
          detail: {
            title: item.title || "",
            lang: currentLang,
            src: src || "",
            index: currentIndex,
          },
        })
      );
    }

    function playPause() {
      if (!audio.src) return;
      if (audio.paused) {
        audio.play().then(() => (playBtn.textContent = "⏸️"));
      } else {
        audio.pause();
        playBtn.textContent = "▶️";
      }
    }

    function nextTrack() {
      if (!playlist.length) return;
      currentIndex = (currentIndex + 1) % playlist.length;
      loadTrack(true);
    }

    function cycleLang() {
      currentLang = currentLang === "eng" ? "heb" : currentLang === "heb" ? "grk" : "eng";
      loadTrack(false); // keep paused state; user can press play
    }

    // Wire controls
    playBtn.addEventListener("click", playPause);
    nextBtn.addEventListener("click", nextTrack);
    langBtn.addEventListener("click", cycleLang);
    sleepBtn.addEventListener("click", () => {
      autoNext = !autoNext;
      sleepBtn.style.opacity = autoNext ? "1" : "0.55";
      sleepBtn.style.borderColor = autoNext
        ? "rgba(255,255,255,0.15)"
        : "rgba(255,255,255,0.35)";
    });

    // Audio events
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("progress", updateProgress);
    audio.addEventListener("ended", () => {
      playBtn.textContent = "▶️";
      if (autoNext) nextTrack();
    });

    /** =========================
     *  3) Drag + Snap
     *  ========================= */
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
      const clientX = e.type.startsWith("touch")
        ? e.touches[0].clientX
        : e.clientX;
      const clientY = e.type.startsWith("touch")
        ? e.touches[0].clientY
        : e.clientY;
      player.style.left = origX + (clientX - startX) + "px";
      player.style.top = origY + (clientY - startY) + "px";
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

      const dLeft = rect.left;
      const dRight = vw - rect.right;
      const dTop = rect.top;
      const dBottom = vh - rect.bottom;

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

    dragPad.addEventListener("mousedown", onPointerDown);
    dragPad.addEventListener("touchstart", onPointerDown, { passive: false });
    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchend", onPointerUp);

    /** =========================
     *  4) Dock / Mini-mode
     *  ========================= */
    let docked = false;
    function toggleDock() {
      docked = !docked;
      if (docked) {
        Object.assign(player.style, {
          width: "100%",
          maxWidth: "520px",
          height: "72px",
          borderRadius: "14px",
          left: "50%",
          bottom: "10px",
          right: "auto",
          top: "auto",
          transform: "translateX(-50%)",
        });
        svg.style.display = "none";
        ring.style.display = "none";
        titleEl.style.fontSize = "clamp(12px, 2.2vw, 15px)";
      } else {
        Object.assign(player.style, {
          width: "190px",
          height: "190px",
          borderRadius: "50%",
          bottom: "1rem",
          right: "1rem",
          left: "auto",
          top: "auto",
          transform: "none",
        });
        svg.style.display = "";
        ring.style.display = "";
        snapToEdge();
      }
    }
    dockBtn.addEventListener("click", toggleDock);
    dockBtn.addEventListener("pointerdown", (e) => e.stopPropagation());

    /** =========================
     *  5) External API + Events
     *  ========================= */
    function setPlaylist(newList) {
      const norm = normalize(newList);
      playlist = norm;
      currentIndex = 0;
      loadTrack(false);
    }
    function setLanguage(lang) {
      const l = String(lang || "").toLowerCase();
      if (!["eng", "heb", "grk"].includes(l)) return;
      currentLang = l;
      loadTrack(false);
    }

    // Backward-compatible custom events if your loader already uses them
    window.addEventListener("player:updatePlaylist", (e) => {
      if (!e.detail) return;
      setPlaylist(e.detail.playlist || []);
    });
    window.addEventListener("player:setLang", (e) => {
      if (!e.detail) return;
      setLanguage(e.detail.lang || "eng");
    });

    // Export API
    window.floatingPlayer = {
      setPlaylist,
      setLanguage,
      play: () => audio.play().then(() => (playBtn.textContent = "⏸️")),
      pause: () => {
        audio.pause();
        playBtn.textContent = "▶️";
      },
      next: nextTrack,
      toggleDock,
      getState: () => ({
        playlist,
        currentIndex,
        currentLang,
        autoNext,
        src: audio.src || "",
        paused: audio.paused,
      }),
    };

    // Initial render (no auto network call)
    loadTrack(false);
  }

  // Boot
  document.addEventListener("DOMContentLoaded", setup);
})();
