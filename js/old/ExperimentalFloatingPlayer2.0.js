// Experimental Floating Player 2.0
document.addEventListener("DOMContentLoaded", () => {
  const player = document.getElementById("floating-player");
  if (!player) return;

  // Create dock/undock button
  const dockBtn = document.createElement("button");
  dockBtn.className = "dock-btn";
  dockBtn.textContent = "⇲"; // dock icon
  player.appendChild(dockBtn);

  // Add glassy style + expand/dock states
  player.classList.add("floating-player-2", "expanded");

  dockBtn.addEventListener("click", () => {
    if (player.classList.contains("expanded")) {
      player.classList.remove("expanded");
      player.classList.add("docked");
      dockBtn.textContent = "⇱"; // undock icon
    } else {
      player.classList.remove("docked");
      player.classList.add("expanded");
      dockBtn.textContent = "⇲"; // dock icon
    }
  });
});

const player = document.querySelector(".exp-player");
const playBtn = document.getElementById("playBtn");
const dockBtn = document.getElementById("dockBtn");
const progressBar = document.querySelector(".exp-progress-bar");

window.globalAudio = window.globalAudio || new Audio();

playBtn.addEventListener("click", () => {
  if (window.globalAudio.paused) {
    window.globalAudio.play();
    playBtn.textContent = "⏸";
  } else {
    window.globalAudio.pause();
    playBtn.textContent = "▶";
  }
});

dockBtn.addEventListener("click", () => {
  player.classList.toggle("docked");
});

// Simple progress bar update
window.globalAudio.addEventListener("timeupdate", () => {
  if (window.globalAudio.duration) {
    const progress = (window.globalAudio.currentTime / window.globalAudio.duration) * 100;
    progressBar.style.width = progress + "%";
  }
});