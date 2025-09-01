// FloatingPlayer.js

const playlist = [
  { title: "Torah", eng: "/audio/torah_eng.mp3", heb: "/audio/torah_heb.mp3", grk: "/audio/torah_grk.mp3" },
  { title: "Prophets", eng: "/audio/prophets_eng.mp3", heb: "/audio/prophets_heb.mp3", grk: "/audio/prophets_grk.mp3" },
  { title: "Writings", eng: "/audio/gospels_eng.mp3", heb: "/audio/gospels_heb.mp3", grk: "/audio/gospels_grk.mp3" },
  { title: "Gospels", eng: "/audio/gospels_eng.mp3", heb: "/audio/gospels_heb.mp3", grk: "/audio/gospels_grk.mp3" },
  { title: "Revelation", eng: "/audio/gospels_eng.mp3", heb: "/audio/gospels_heb.mp3", grk: "/audio/gospels_grk.mp3" },
  { title: "Psalms", eng: "/audio/gospels_eng.mp3", heb: "/audio/gospels_heb.mp3", grk: "/audio/gospels_grk.mp3" }
];

function setupFloatingPlayer() {
  const existing = document.getElementById("floatingPlayer");
  if (existing) existing.remove();

  // Create container
  const player = document.createElement("div");
  player.id = "floatingPlayer";
  player.style.position = "fixed";
  player.style.bottom = "1rem";
  player.style.right = "1rem";
  player.style.width = "180px";
  player.style.height = "180px";
  player.style.borderRadius = "50%";
  player.style.background = "#1f2937"; // dark gray
  player.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
  player.style.display = "flex";
  player.style.flexDirection = "column";
  player.style.alignItems = "center";
  player.style.justifyContent = "center";
  player.style.color = "#fff";
  player.style.padding = "10px";
  player.style.cursor = "grab";
  player.style.zIndex = 9999;

  // Title
  const titleEl = document.createElement("p");
  titleEl.style.fontWeight = "bold";
  titleEl.style.marginBottom = "6px";
  titleEl.style.textAlign = "center";
  player.appendChild(titleEl);

  // Audio
  const audio = document.createElement("audio");
  audio.controls = true;
  audio.style.width = "90%";
  audio.style.borderRadius = "10px";
  player.appendChild(audio);

  // Buttons container
  const btnContainer = document.createElement("div");
  btnContainer.style.display = "flex";
  btnContainer.style.justifyContent = "space-between";
  btnContainer.style.width = "90%";
  btnContainer.style.marginTop = "6px";

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.style.flex = "1";
  nextBtn.style.marginRight = "4px";
  nextBtn.style.padding = "4px";
  nextBtn.style.borderRadius = "6px";
  nextBtn.style.background = "#2563eb";
  nextBtn.style.color = "#fff";
  nextBtn.style.border = "none";

  const langBtn = document.createElement("button");
  langBtn.textContent = "Lang";
  langBtn.style.flex = "1";
  langBtn.style.padding = "4px";
  langBtn.style.borderRadius = "6px";
  langBtn.style.background = "#16a34a";
  langBtn.style.color = "#fff";
  langBtn.style.border = "none";

  btnContainer.appendChild(nextBtn);
  btnContainer.appendChild(langBtn);
  player.appendChild(btnContainer);

  document.body.appendChild(player);

  // Circular progress
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "80");
  svg.setAttribute("height", "80");
  svg.style.position = "absolute";
  svg.style.top = "10px";
  svg.style.left = "50%";
  svg.style.transform = "translateX(-50%)";

  const circleBg = document.createElementNS(svgNS, "circle");
  circleBg.setAttribute("cx", "40");
  circleBg.setAttribute("cy", "40");
  circleBg.setAttribute("r", "36");
  circleBg.setAttribute("stroke", "#555");
  circleBg.setAttribute("stroke-width", "4");
  circleBg.setAttribute("fill", "none");

  const circleProgress = document.createElementNS(svgNS, "circle");
  circleProgress.setAttribute("cx", "40");
  circleProgress.setAttribute("cy", "40");
  circleProgress.setAttribute("r", "36");
  circleProgress.setAttribute("stroke", "#00f");
  circleProgress.setAttribute("stroke-width", "4");
  circleProgress.setAttribute("fill", "none");
  circleProgress.setAttribute("stroke-dasharray", 2 * Math.PI * 36);
  circleProgress.setAttribute("stroke-dashoffset", 2 * Math.PI * 36);
  circleProgress.setAttribute("transform", "rotate(-90 40 40)");

  svg.appendChild(circleBg);
  svg.appendChild(circleProgress);
  player.appendChild(svg);

  // State
  let currentIndex = 0;
  let currentLang = "eng";

  function loadTrack() {
    const track = playlist[currentIndex];
    titleEl.textContent = `${track.title} (${currentLang.toUpperCase()})`;
    audio.src = track[currentLang];
    audio.play().catch(() => {}); // auto play
  }

  function playNext() {
    currentIndex = (currentIndex + 1) % playlist.length;
    loadTrack();
  }

  function cycleLang() {
    currentLang = currentLang === "eng" ? "heb" : currentLang === "heb" ? "grk" : "eng";
    loadTrack();
  }

  nextBtn.addEventListener("click", playNext);
  langBtn.addEventListener("click", cycleLang);

  // Auto-next on track end
  audio.addEventListener("ended", playNext);

  // Circular progress update
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const progress = audio.currentTime / audio.duration;
    circleProgress.setAttribute("stroke-dashoffset", 2 * Math.PI * 36 * (1 - progress));
  });

  // Drag/touch support
  let isDragging = false;
  let startX, startY, origX, origY;

  function onPointerDown(e) {
    isDragging = true;
    const rect = player.getBoundingClientRect();
    origX = rect.left;
    origY = rect.top;
    startX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    startY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
    player.style.cursor = "grabbing";
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
    player.style.left = origX + (clientX - startX) + "px";
    player.style.top = origY + (clientY - startY) + "px";
  }

  function onPointerUp() {
    isDragging = false;
    player.style.cursor = "grab";
  }

  player.addEventListener("mousedown", onPointerDown);
  player.addEventListener("touchstart", onPointerDown);
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("touchmove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);
  window.addEventListener("touchend", onPointerUp);

  // Initial load
  loadTrack();
}

// Initialize player
document.addEventListener("DOMContentLoaded", setupFloatingPlayer);
