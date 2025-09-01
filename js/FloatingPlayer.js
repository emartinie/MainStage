(function setupFloatingPlayer() {
  const playlist = [
    { title: "Torah", eng: "/audio/torah_eng.mp3", heb: "/audio/torah_heb.mp3", grk: "/audio/torah_grk.mp3" },
    { title: "Prophets", eng: "/audio/prophets_eng.mp3", heb: "/audio/prophets_heb.mp3", grk: "/audio/prophets_grk.mp3" },
    { title: "Gospels", eng: "/audio/gospels_eng.mp3", heb: "/audio/gospels_heb.mp3", grk: "/audio/gospels_grk.mp3" },
  ];

  let currentIndex = 0;
  let lang = "eng";

  const player = document.getElementById("floatingPlayer");
  const titleEl = document.getElementById("playerTitle");
  const audioEl = document.getElementById("playerAudio");
  const btnNext = document.getElementById("btnNext");
  const btnLang = document.getElementById("btnLang");

  function updatePlayer() {
    const track = playlist[currentIndex];
    titleEl.textContent = `${track.title} (${lang.toUpperCase()})`;
    audioEl.src = track[lang];
  }

  function playNext() {
    currentIndex = (currentIndex + 1) % playlist.length;
    updatePlayer();
    audioEl.play();
  }

  function cycleLanguage() {
    lang = lang === "eng" ? "heb" : lang === "heb" ? "grk" : "eng";
    updatePlayer();
    audioEl.play();
  }

  btnNext.addEventListener("click", playNext);
  btnLang.addEventListener("click", cycleLanguage);
  audioEl.addEventListener("ended", playNext);

  // --- Dragging (mouse + touch) ---
  let isDragging = false, startX, startY, origX, origY;

  const startDrag = (x, y) => {
    isDragging = true;
    startX = x;
    startY = y;
    const rect = player.getBoundingClientRect();
    origX = rect.left;
    origY = rect.top;
    document.body.style.userSelect = "none";
  };

  const onDrag = (x, y) => {
    if (!isDragging) return;
    const dx = x - startX;
    const dy = y - startY;
    player.style.left = `${origX + dx}px`;
    player.style.top = `${origY + dy}px`;
    player.style.right = "auto"; // prevent snapping back
    player.style.bottom = "auto";
  };

  const endDrag = () => {
    isDragging = false;
    document.body.style.userSelect = "";
  };

  player.addEventListener("mousedown", e => startDrag(e.clientX, e.clientY));
  window.addEventListener("mousemove", e => onDrag(e.clientX, e.clientY));
  window.addEventListener("mouseup", endDrag);

  player.addEventListener("touchstart", e => startDrag(e.touches[0].clientX, e.touches[0].clientY));
  window.addEventListener("touchmove", e => onDrag(e.touches[0].clientX, e.touches[0].clientY));
  window.addEventListener("touchend", endDrag);

  // --- Initialize ---
  updatePlayer();
  player.style.display = "block";
})();
