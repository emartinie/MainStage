// orbitFloatingPlayer.js
import { registerResource } from "/js/core/resourceManager.js";

let player, audio, glowInterval, orbitInterval;

function setupFloatingPlayer() {
  // SAFETY: prevent duplicates
  const existing = document.getElementById("floatingPlayer");
  if (existing) existing.remove();

  // =========================
  // CREATE ELEMENTS
  // =========================
  player = document.createElement("div");
  player.id = "floatingPlayer";
  document.body.appendChild(player);

  audio = document.createElement("audio");
  audio.preload = "metadata";
  player.appendChild(audio);

  // =========================
  // STATE
  // =========================
  let playlist = [];
  let currentIndex = 0;
  let currentLang = "eng";
  let autoNext = true;

  // =========================
  // FUNCTIONS
  // =========================
  function loadTrack() {
    const item = playlist[currentIndex];
    if (!item) return;

    audio.src = item[currentLang] || "";
    audio.play().catch(()=>{});
  }

  function normalize(list) {
    return (list || []).map(i => ({
      title: i.label || i.title || "Untitled",
      eng: i.eng || i.src || "",
      heb: i.heb || i.src || "",
      grk: i.grk || i.src || ""
    }));
  }

  // =========================
  // EVENTS
  // =========================
  audio.addEventListener("ended", () => {
    if (!autoNext || !playlist.length) return;
    currentIndex = (currentIndex + 1) % playlist.length;
    loadTrack();
  });

  window.addEventListener("player:updatePlaylist", e => {
    playlist = normalize(e.detail.playlist || []);
    currentIndex = 0;
    loadTrack();
  });

  // =========================
  // AUTO LOAD
  // =========================
  if (window.weekData?.sections?.audio_playlist) {
    playlist = normalize(window.weekData.sections.audio_playlist);
  }

  loadTrack();
}

// =========================
// DESTROY
// =========================
function destroyFloatingPlayer() {
  if (audio) {
    audio.pause();
    audio.src = "";
  }
  if (player) {
    player.remove();
  }
  clearInterval(glowInterval);
  clearInterval(orbitInterval);
}

// =========================
// REGISTER
// =========================
registerResource("player", {
  init: setupFloatingPlayer,
  destroy: destroyFloatingPlayer
});