// floatingPlayer-v3.js
(function () {
  // Ensure single global audio
  if (!window.globalAudio) window.globalAudio = new Audio();

  // boot
  function setupFloatingPlayer() {
    // container root from HTML (div placeholder)
    var root = document.getElementById("fp-hero-glass-root");
    if (!root) {
      console.error("fp-hero-glass-root not found");
      return;
    }

    // remove old player if exists
    var existing = document.querySelector(".fp-player");
    if (existing) existing.remove();

    // Create player DOM
    var player = document.createElement("div");
    player.className = "fp-player docked"; // start docked
    player.setAttribute("role", "region");
    player.setAttribute("aria-label", "Floating audio player");

        

    // ring (svg)
    var ringWrap = document.createElement("div");
    ringWrap.className = "fp-ring";
    ringWrap.innerHTML = [
      '<svg class="fp-orb-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
      '  <defs>',
      '    <linearGradient id="fpGrad" x1="0%" y1="0%" x2="100%" y2="0%">',
      '      <stop offset="0%" stop-color="#60a5fa"/>',
      '      <stop offset="100%" stop-color="#34d399"/>',
      '    </linearGradient>',
      '  </defs>',
      '  <circle cx="100" cy="100" r="88" stroke="rgba(255,255,255,0.06)" stroke-width="8" fill="none"/>',
      '  <circle id="fpProgressCircle" cx="100" cy="100" r="88" stroke="url(#fpGrad)" stroke-width="8" fill="none" stroke-linecap="round" transform="rotate(-90 100 100)" stroke-dasharray="552" stroke-dashoffset="552"/>',
      '</svg>'
    ].join("");
    player.appendChild(ringWrap);

    // center area
    var center = document.createElement("div");
    center.className = "fp-center";

    var title = document.createElement("div");
    title.className = "fp-title";
    title.textContent = "Untitled";

    // controls container for expanded layout
    var controlsRow = document.createElement("div");
    controlsRow.className = "fp-controls fp-hidden";

    // left small area (buttons for docked)
    var leftButtons = document.createElement("div");
    leftButtons.style.display = "flex";
    leftButtons.style.gap = "8px";
    leftButtons.style.alignItems = "center";

    // create buttons
    function makeBtn(id, label, cls) {
      var b = document.createElement("button");
      b.id = id;
      b.className = "fp-btn " + (cls || "");
      b.type = "button";
      b.textContent = label;
      return b;
    }

    var playBtn = makeBtn("fp_play_btn", "▶", "circle");
    var nextBtn = makeBtn("fp_next_btn", "⏭");
    var langBtn = makeBtn("fp_lang_btn", "🌐");
    var speedBtn = makeBtn("fp_speed_btn", "1x");
    var dockBtn = makeBtn("fp_dock_btn", "⫶", "circle");

    leftButtons.appendChild(playBtn);

    // progress bar (for expanded)
    var progressWrap = document.createElement("div");
    progressWrap.className = "fp-progress-bar-wrap fp-hidden";
    var progressBar = document.createElement("div");
    progressBar.className = "fp-progress-bar";
    progressWrap.appendChild(progressBar);

    controlsRow.appendChild(leftButtons);
    controlsRow.appendChild(progressWrap);

    // small right side quick buttons in expanded layout
    var rightButtons = document.createElement("div");
    rightButtons.style.display = "flex";
    rightButtons.style.gap = "8px";
    rightButtons.style.alignItems = "center";
    rightButtons.appendChild(nextBtn);
    rightButtons.appendChild(langBtn);
    rightButtons.appendChild(speedBtn);

    controlsRow.appendChild(rightButtons);

    center.appendChild(title);
    center.appendChild(controlsRow);

    // append dock button onto player so visible in docked state too
    var dockWrap = document.createElement("div");
    dockWrap.style.position = "absolute";
    dockWrap.style.top = "8px";
    dockWrap.style.right = "8px";
    dockWrap.appendChild(dockBtn);
    player.appendChild(dockWrap);

    player.appendChild(center);
    root.appendChild(player);

    // state
    var playlist = [];
    var currentIndex = 0;
    var currentLang = "eng";
    var autoNext = true;
    var isExpanded = false;

    // Access circle for orb progress
    var progressCircle = document.getElementById("fpProgressCircle");
    var circleCircumference = 2 * Math.PI * 88; // r=88 => C ~ 552

    // normalize playlist helper
    function normalize(list) {
      var out = [];
      for (var i = 0; i < (list || []).length; i++) {
        var it = list[i] || {};
        out.push({
          title: it.label || it.title || "Untitled",
          eng: it.eng || it.src || "",
          heb: it.heb || it.src || "",
          grk: it.grk || it.src || "",
          src: it.src || it.eng || it.heb || it.grk || ""
        });
      }
      return out;
    }

    // loadTrack
    function loadTrack() {
      var item = playlist[currentIndex] || {};
      var src = item[currentLang] || item.src || "";
      title.textContent = (item.title || "Untitled") + " (" + currentLang.toUpperCase() + ")";
      if (src) {
        window.globalAudio.src = src;
        // try to play but catch
        window.globalAudio.play().catch(function () {});
      } else {
        window.globalAudio.pause();
      }
      // reset ring
      if (progressCircle) progressCircle.setAttribute("stroke-dashoffset", circleCircumference.toString());

      // broadcast now playing
      window.dispatchEvent(new CustomEvent("player:nowPlaying", {
        detail: {
          title: item.title || "",
          lang: currentLang,
          src: src,
          index: currentIndex
        }
      }));
    }

    // update UI for expanded/docked
    function setExpanded(exp) {
      isExpanded = !!exp;
      if (isExpanded) {
        player.classList.remove("docked");
        player.classList.add("expanded");
        controlsRow.classList.remove("fp-hidden");
        progressWrap.classList.remove("fp-hidden");
      } else {
        player.classList.remove("expanded");
        player.classList.add("docked");
        controlsRow.classList.add("fp-hidden");
        progressWrap.classList.add("fp-hidden");
      }
    }

    // toggle dock/undock
    function toggleDock() {
      setExpanded(!isExpanded);
    }

    // play/pause toggle
    function togglePlay() {
      if (!window.globalAudio.src) {
        // if no source, try to load first track
        if (playlist.length > 0) {
          currentIndex = 0;
          loadTrack();
          return;
        }
        return;
      }
      if (window.globalAudio.paused) {
        window.globalAudio.play().then(function () {
          playBtn.textContent = "⏸";
        }).catch(function () {
          playBtn.textContent = "▶";
        });
      } else {
        window.globalAudio.pause();
        playBtn.textContent = "▶";
      }
    }

    // next
    function playNext() {
      if (playlist.length === 0) return;
      currentIndex = (currentIndex + 1) % playlist.length;
      loadTrack();
    }

    // cycle language
    function cycleLang() {
      currentLang = (currentLang === "eng" ? "heb" : (currentLang === "heb" ? "grk" : "eng"));
      loadTrack();
    }

    // speed toggle
    var speeds = [1, 1.25, 1.5, 2];
    function toggleSpeed() {
      var idx = speeds.indexOf(window.globalAudio.playbackRate);
      if (idx < 0) idx = 0;
      var next = speeds[(idx + 1) % speeds.length];
      window.globalAudio.playbackRate = next;
      speedBtn.textContent = next + "x";
    }

    // update ring progress
    function updateOrbProgress() {
      if (!window.globalAudio.duration || isNaN(window.globalAudio.duration)) {
        if (progressCircle) progressCircle.setAttribute("stroke-dashoffset", circleCircumference.toString());
        return;
      }
      var p = window.globalAudio.currentTime / window.globalAudio.duration;
      var offset = circleCircumference * (1 - p);
      if (progressCircle) progressCircle.setAttribute("stroke-dashoffset", offset.toString());
      // expanded bar
      if (progressBar) progressBar.style.width = Math.max(0, Math.min(100, p * 100)) + "%";
    }

    // attach UI listeners
    playBtn.addEventListener("click", function (e) { e.stopPropagation(); togglePlay(); });
    playBtn.addEventListener("touchend", function (e) { e.preventDefault(); e.stopPropagation(); togglePlay(); });

    nextBtn.addEventListener("click", function (e) { e.stopPropagation(); playNext(); });
    nextBtn.addEventListener("touchend", function (e) { e.preventDefault(); e.stopPropagation(); playNext(); });

    langBtn.addEventListener("click", function (e) { e.stopPropagation(); cycleLang(); });
    langBtn.addEventListener("touchend", function (e) { e.preventDefault(); e.stopPropagation(); cycleLang(); });

    speedBtn.addEventListener("click", function (e) { e.stopPropagation(); toggleSpeed(); });
    speedBtn.addEventListener("touchend", function (e) { e.preventDefault(); e.stopPropagation(); toggleSpeed(); });

    dockBtn.addEventListener("click", function (e) { e.stopPropagation(); toggleDock(); });
    dockBtn.addEventListener("touchend", function (e) { e.preventDefault(); e.stopPropagation(); toggleDock(); });

    // allow clicking the whole player to expand/contract
    player.addEventListener("click", function (e) {
      // if click on a button, ignore
      if (e.target.tagName.toLowerCase() === "button") return;
      setExpanded(true);
    });
    player.addEventListener("touchend", function (e) {
      if (e.target.tagName && e.target.tagName.toLowerCase() === "button") return;
      setExpanded(true);
    });

    // audio progress events
    window.globalAudio.addEventListener("timeupdate", updateOrbProgress, false);
    window.globalAudio.addEventListener("loadedmetadata", updateOrbProgress, false);
    window.globalAudio.addEventListener("progress", updateOrbProgress, false);
    window.globalAudio.addEventListener("ended", function () {
      playBtn.textContent = "▶";
      if (autoNext && playlist.length > 0) {
        currentIndex = (currentIndex + 1) % playlist.length;
        loadTrack();
      }
    }, false);

    // make sure initial UI state is docked
    setExpanded(false);

    // External hooks
    window.addEventListener("player:updatePlaylist", function (ev) {
      var pl = normalize((ev && ev.detail && ev.detail.playlist) || []);
      if (pl.length) {
        playlist = pl;
        currentIndex = 0;
        loadTrack();
      }
    });

    window.addEventListener("player:setLang", function (ev) {
      var l = (ev && ev.detail && ev.detail.lang) || "";
      l = ("" + l).toLowerCase();
      if (["eng", "heb", "grk"].indexOf(l) >= 0) {
        currentLang = l;
        loadTrack();
      }
    });

    // toggle play event
    window.addEventListener("player:togglePlay", function () { togglePlay(); });

    // nowPlaying updates the local marquee/title if other code dispatches it
    window.addEventListener("player:nowPlaying", function (ev) {
      var d = (ev && ev.detail) || {};
      title.textContent = (d.title || "Untitled") + " (" + ((d.lang || currentLang).toUpperCase()) + ")";
    });

    // if weekData exists at load time, auto-populate
    if (window.weekData && window.weekData.sections && window.weekData.sections.audio_playlist) {
      playlist = normalize(window.weekData.sections.audio_playlist);
      if (playlist.length) loadTrack();
    }

    // expose small API
    window.floatingPlayerV3 = {
      loadPlaylist: function (pl) { playlist = normalize(pl || []); currentIndex = 0; loadTrack(); },
      togglePlay: togglePlay,
      toggleDock: toggleDock,
      setLang: function (lang) { currentLang = lang; loadTrack(); }
    };
  }

  // init on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupFloatingPlayer);
  } else {
    setupFloatingPlayer();
  }
})();