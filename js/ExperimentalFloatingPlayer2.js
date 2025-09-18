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