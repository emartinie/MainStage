  // backupinitialFloatingPlayer.js
  document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("floating-player-root");
  if (!container) return;

  // Create player UI
  container.innerHTML = `
    <div id="floatingPlayer" class="fixed bottom-20 right-4 w-64 p-3 rounded-2xl shadow-lg 
         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex flex-col gap-2 cursor-move">
      <!-- Controls row -->
      <div class="flex items-center justify-between">
        <button id="fpPrev" class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">⏮</button>
        <button id="fpPlayPause" class="px-3 py-1 rounded-full bg-blue-600 text-white">▶</button>
        <button id="fpNext" class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">⏭</button>
      </div>
      
      <!-- Now Playing -->
      <div id="fpTitle" class="text-sm text-center truncate">No track loaded</div>

      <!-- Menu / Dock -->
      <div class="flex justify-center">
        <button id="fpDock" class="px-2 py-1 rounded bg-gray-300 dark:bg-gray-600">⋮</button>
      </div>
    </div>
  `;

  // References
  const audio = new Audio();
  const playPauseBtn = document.getElementById("fpPlayPause");
  const prevBtn = document.getElementById("fpPrev");
  const nextBtn = document.getElementById("fpNext");
  const titleEl = document.getElementById("fpTitle");
  const dockBtn = document.getElementById("fpDock");
  const playerEl = document.getElementById("floatingPlayer");
  const  playBtn = document.getElementById("▶", "Play/Pause");
    const  langBtn = document.getElementById("🌐", "Language");
    const  sleepBtn = document.getElementById("🌙", "Auto-next on/off");
    sleepBtn.dataset.active = "1";

    controls.appendChild(playBtn);
    controls.appendChild(langBtn);
    controls.appendChild(nextBtn);
    controls.appendChild(sleepBtn);
    center.appendChild(controls);


  // Dummy playlist for now (replace with real JSON later)
  const playlist = [
    { title: "Torah (English)", src: "audio/torah-en.mp3" },
    { title: "Prophets (Hebrew)", src: "audio/prophets-he.mp3" },
    { title: "Writings (Transliteration)", src: "audio/writings-tr.mp3" },
  ];
  let currentTrack = 0;

  function loadTrack(index) {
    const track = playlist[index];
    if (!track) return;
    audio.src = track.src;
    titleEl.textContent = track.title;
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play();
      playPauseBtn.textContent = "⏸";
    } else {
      audio.pause();
      playPauseBtn.textContent = "▶";
    }
  }

  playPauseBtn.addEventListener("click", togglePlay);

  prevBtn.addEventListener("click", () => {
    currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrack);
    audio.play();
    playPauseBtn.textContent = "⏸";
  });

  nextBtn.addEventListener("click", () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadTrack(currentTrack);
    audio.play();
    playPauseBtn.textContent = "⏸";
  });

  dockBtn.addEventListener("click", () => {
    playerEl.classList.toggle("w-16");
    playerEl.classList.toggle("h-16");
    playerEl.classList.toggle("p-1");
    playerEl.classList.toggle("overflow-hidden");
    titleEl.classList.toggle("hidden");
  });

  // Drag logic (desktop + touch)
  let isDragging = false, offsetX, offsetY;

  function startDrag(e) {
    isDragging = true;
    const rect = playerEl.getBoundingClientRect();
    offsetX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    offsetY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchmove", drag);
    document.addEventListener("touchend", stopDrag);
  }

  function drag(e) {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    playerEl.style.left = `${clientX - offsetX}px`;
    playerEl.style.top = `${clientY - offsetY}px`;
    playerEl.style.right = "auto";
    playerEl.style.bottom = "auto";
    playerEl.style.position = "fixed";
  }

  function stopDrag() {
    isDragging = false;
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchmove", drag);
    document.removeEventListener("touchend", stopDrag);
  }

  playerEl.addEventListener("mousedown", startDrag);
  playerEl.addEventListener("touchstart", startDrag);

  // Load first track
  loadTrack(currentTrack);
});
