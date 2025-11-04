(function () {  
  console.log("🌌 Orbit Media Module initializing...");  

  const orbitContainer = document.getElementById("floatingPlayer");  
  if (!orbitContainer) {  
    console.warn("❌ Floating player not found.");  
    return;  
  }  

  // --- LOGO ---  
  const logo = document.createElement("img");  
  logo.id = "orbitLogo";  
  logo.src = "/images/logo.png"; // change to your logo path  
  logo.classList.add("orbit-face-item");  
  orbitContainer.appendChild(logo);  

  // --- VIDEO ---  
  const video = document.createElement("video");  
  video.id = "orbitVideo";  
  video.src = "/videos/firevideos.mp4"; // change to your video path  
  video.loop = true;  
  video.playsInline = true;  
  video.autoplay = false;  
  video.classList.add("orbit-face-item", "hidden"); // hidden initially  
  orbitContainer.appendChild(video);  

  // --- PLAY/PAUSE BUTTON ---  
  const playBtn = document.createElement("button");  
  playBtn.id = "orbitPlayBtn";  
  playBtn.textContent = "▶";  
  playBtn.classList.add("orbit-button");  
  orbitContainer.appendChild(playBtn);  

  // --- TOGGLE LOGO / VIDEO ---  
  playBtn.addEventListener("click", () => {  
    if (video.classList.contains("hidden")) {  
      video.classList.remove("hidden");  
      logo.classList.add("hidden");  
      video.play();  
      playBtn.textContent = "⏸";  
    } else {  
      video.pause();  
      video.classList.add("hidden");  
      logo.classList.remove("hidden");  
      playBtn.textContent = "▶";  
    }  
  });  

  console.log("✅ Orbit Media ready.");  
})();  