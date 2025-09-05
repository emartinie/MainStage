// FloatingPlayer.js
document.addEventListener("DOMContentLoaded", () => {
  // Create floating player container
  const player = document.createElement("div");
  player.id = "floating-player";
  player.style.position = "fixed";
  player.style.bottom = "20px";
  player.style.right = "20px";
  player.style.width = "100px";
  player.style.height = "100px";
  player.style.borderRadius = "50%";
  player.style.background = "#222";
  player.style.display = "flex";
  player.style.alignItems = "center";
  player.style.justifyContent = "center";
  player.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
  player.style.cursor = "pointer";
  player.style.zIndex = "9999";

  // Add SVG circle for progress
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "100");
  svg.setAttribute("height", "100");

  const circleBG = document.createElementNS(svgNS, "circle");
  circleBG.setAttribute("cx", "50");
  circleBG.setAttribute("cy", "50");
  circleBG.setAttribute("r", "45");
  circleBG.setAttribute("stroke", "#444");
  circleBG.setAttribute("stroke-width", "6");
  circleBG.setAttribute("fill", "none");
  svg.appendChild(circleBG);

  const circleProgress = document.createElementNS(svgNS, "circle");
  circleProgress.setAttribute("cx", "50");
  circleProgress.setAttribute("cy", "50");
  circleProgress.setAttribute("r", "45");
  circleProgress.setAttribute("stroke", "#1db954"); // Spotify green
  circleProgress.setAttribute("stroke-width", "6");
  circleProgress.setAttribute("fill", "none");
  circleProgress.setAttribute("stroke-dasharray", `${2 * Math.PI * 45}`);
  circleProgress.setAttribute("stroke-dashoffset", `${2 * Math.PI * 45}`);
  circleProgress.setAttribute("transform", "rotate(-90 50 50)");
  svg.appendChild(circleProgress);

  player.appendChild(svg);

  // Add play/pause button text
  const playBtn = document.createElement("div");
  playBtn.id = "play-btn";
  playBtn.style.position = "absolute";
  playBtn.style.fontSize = "32px";
  playBtn.style.color = "#fff";
  playBtn.style.userSelect = "none";
  playBtn.textContent = "▶️"; // initial state
  player.appendChild(playBtn);

  // Add title text
  const title = document.createElement("div");
  title.id = "player-title";
  title.style.position = "absolute";
  title.style.bottom = "-25px";
  title.style.left = "50%";
  title.style.transform = "translateX(-50%)";
  title.style.color = "#fff";
  title.style.fontSize = "12px";
  title.textContent = "Track Title";
  player.appendChild(title);

  // Append to body
  document.body.appendChild(player);

  // Audio element
  const audio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");

  let isPlaying = false;
  const circumference = 2 * Math.PI * 45;

  // Toggle play/pause
  player.addEventListener("click", () => {
    if (!isPlaying) {
      audio.play();
      playBtn.textContent = "⏸️";
      isPlaying = true;
    } else {
      audio.pause();
      playBtn.textContent = "▶️";
      isPlaying = false;
    }
  });

  // Update progress
  audio.addEventListener("timeupdate", () => {
    const progress = audio.currentTime / audio.duration;
    circleProgress.setAttribute(
      "stroke-dashoffset",
      circumference - progress * circumference
    );
  });

  audio.addEventListener("ended", () => {
    isPlaying = false;
    playBtn.textContent = "▶️";
    circleProgress.setAttribute("stroke-dashoffset", circumference);
  });
});
