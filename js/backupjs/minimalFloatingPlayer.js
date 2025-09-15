// MinimalFloatingPlayer.js — accept loader playlist + ensure buttons work
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    // Find mount point: try floating-player-root then mainAudioPlayer
    const mount = document.getElementById("floating-player-root") || document.getElementById("floating-player") || document.getElementById("mainAudioPlayer");
    if (!mount) {
      console.warn("FloatingPlayer: no mount element found (floating-player-root|floating-player|mainAudioPlayer)");
      return;
    }

    // If mount is an <audio> element by mistake, we create a wrapper DIV next to it
    const isAudioTag = mount.tagName && mount.tagName.toLowerCase() === "audio";
    const container = isAudioTag ? (function(){ const d=document.createElement('div'); d.id='floating-player-root'; mount.parentNode.insertBefore(d, mount.nextSibling); return d; })() : mount;

    // Basic HTML structure if it's currently blank or missing buttons
    if (!container.querySelector(".fp-controls")) {
      container.innerHTML = `
        <div class="fp-shell" style="position:relative;width:190px;height:190px;border-radius:50%;background:rgba(17,24,39,0.9);display:flex;align-items:center;justify-content:center;">
          <div class="fp-play" style="position:absolute;font-size:32px;color:#fff;cursor:pointer;z-index:3">▶️</div>
          <div class="fp-title" style="position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);color:#fff;font-size:12px;">No tracks</div>
          <div class="fp-controls" style="position:absolute;bottom:12px;display:flex;gap:8px;z-index:4">
            <button class="fp-lang" title="Language" style="padding:6px">🌐</button>
            <button class="fp-next" title="Next" style="padding:6px">⏭</button>
            <button class="fp-sleep" title="Auto-next" style="padding:6px">🌙</button>
          </div>
          <audio style="display:none" class="fp-audio"></audio>
        </div>
      `;
    }

    // Elements
    const playBtn = container.querySelector(".fp-play");
    const nextBtn = container.querySelector(".fp-next");
    const langBtn = container.querySelector(".fp-lang");
    const sleepBtn = container.querySelector(".fp-sleep");
    const titleEl = container.querySelector(".fp-title");
    const audio = container.querySelector(".fp-audio");

    // State
    let fpPlaylist = [];
    let idx = 0;
    let lang = "eng";
    let autoNext = true;

    // Helpers
    function normalize(list) {
      return (list||[]).map(i => ({
        title: i.title || i.label || "Untitled",
        eng: i.eng||i.src||"",
        heb: i.heb||i.src||"",
        grk: i.grk||i.src||"",
        src: i.src||i.eng||i.heb||i.grk||""
      }));
    }
    function current() { return fpPlaylist[idx] || null; }
    function srcFor(item) {
      if (!item) return "";
      return (item[lang] && item[lang].length) ? item[lang] : (item.src || "");
    }
    function setTitle(item) {
      titleEl.textContent = item ? `${item.title} (${lang.toUpperCase()})` : "No tracks";
    }

    function loadTrack(autoplay=true) {
      const it = current();
      const src = srcFor(it);
      setTitle(it);
      if (!it || !src) {
        audio.removeAttribute("src");
        playBtn.textContent = "▶️";
        return;
      }
      if (audio.src !== src) audio.src = src;
      if (autoplay) {
        audio.play().then(()=>playBtn.textContent="⏸️").catch(()=>playBtn.textContent="▶️");
      } else {
        playBtn.textContent = audio.paused ? "▶️" : "⏸️";
      }

      // notify other parts of app
      window.dispatchEvent(new CustomEvent("player:nowPlaying", { detail: { title: it.title, lang, src, index: idx } }));
    }

    // Controls wiring
    playBtn.addEventListener("click", (e)=>{
      e.stopPropagation();
      if (!audio.src) { loadTrack(true); return; }
      if (audio.paused) audio.play().then(()=> playBtn.textContent="⏸️").catch(()=> playBtn.textContent="▶️");
      else { audio.pause(); playBtn.textContent="▶️"; }
    });

    nextBtn.addEventListener("click", ()=> { if (!fpPlaylist.length) return; idx = (idx+1) % fpPlaylist.length; loadTrack(true); });

    langBtn.addEventListener("click", ()=> {
      lang = (lang === "eng") ? "heb" : (lang === "heb") ? "grk" : "eng";
      loadTrack(false);
    });

    sleepBtn.addEventListener("click", ()=> {
      autoNext = !autoNext;
      sleepBtn.style.opacity = autoNext ? "1" : "0.55";
    });

    audio.addEventListener("ended", ()=>{
      playBtn.textContent = "▶️";
      if (autoNext && fpPlaylist.length) { idx = (idx+1) % fpPlaylist.length; loadTrack(true); }
    });

    // Accept playlist from loader
    window.addEventListener("player:updatePlaylist", (ev)=>{
      const pl = normalize(ev.detail?.playlist || ev.detail || []);
      fpPlaylist = pl;
      idx = 0;
      loadTrack(false);
    });

    // Backwards compatibility: allow loader to set window.mainPlaylist directly
    if (window.mainPlaylist && Array.isArray(window.mainPlaylist)) {
      window.dispatchEvent(new CustomEvent("player:updatePlaylist", { detail: window.mainPlaylist }));
    }

    // Expose minimal API for the loader or console debugging
    window.floatingPlayer = {
      setPlaylist: (newList)=> window.dispatchEvent(new CustomEvent("player:updatePlaylist",{detail:{playlist:newList}})),
      play: ()=> audio.play(),
      pause: ()=> audio.pause(),
      next: ()=> { if (fpPlaylist.length) { idx=(idx+1)%fpPlaylist.length; loadTrack(true); } },
      setLanguage: (L)=> { lang = String(L||"eng").toLowerCase(); loadTrack(false); },
      getState: ()=> ({ playlist: fpPlaylist, idx, lang, src: audio.src })
    };

    // DEV: quick test log if nothing loaded
    if (!fpPlaylist.length) console.info("FloatingPlayer: waiting for playlist (player:updatePlaylist event).");
  });
})();
