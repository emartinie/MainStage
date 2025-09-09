// FloatingPlayer.js

document.addEventListener("DOMContentLoaded", () => {
  const player = document.getElementById("floating-player");
  const playBtn = document.getElementById("play-btn");
  const progressBar = document.getElementById("progress-bar");
  const progress = document.getElementById("progress");
  const title = document.getElementById("track-title");
  const audio = document.getElementById("audio");

  // --- Play/Pause Toggle ---
  playBtn.textContent = "▶️"; // initial state

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      playBtn.textContent = "⏸️";
    } else {
      audio.pause();
      playBtn.textContent = "▶️";
    }
  });

  // --- Progress Bar Update ---
  audio.addEventListener("timeupdate", () => {
    const percentage = (audio.currentTime / audio.duration) * 100;
    progress.style.width = percentage + "%";
  });

  progressBar.addEventListener("click", (e) => {
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newTime = (offsetX / rect.width) * audio.duration;
    audio.currentTime = newTime;
  });

  // --- Optional: Smooth styling (can tune later with Tailwind) ---
  progressBar.style.borderRadius = "8px";
  progress.style.borderRadius = "8px";
  progress.style.transition = "width 0.2s ease";
});
