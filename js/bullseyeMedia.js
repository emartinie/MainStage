(function () {
  console.log("🌟 Orbit Logo/Video Toggle Module initializing...");

  const logoSrc = "./images/HGHouses.png"; // path to your logo
  const videoSrc = "./videos/build_your_kingdom_here.mp4"; // path to your video

  let logoEl, videoEl;
  let showingVideo = false;

  // Wait for floating player
  const waitForPlayer = setInterval(() => {
    const floatingPlayer = document.getElementById("floatingPlayer");
    if (!floatingPlayer) return;

    clearInterval(waitForPlayer);
    console.log("✅ Floating player found, adding logo and video...");

    // Create logo
    logoEl = document.createElement("img");
    logoEl.id = "orbitLogo";
    logoEl.src = logoSrc;
    logoEl.style.position = "absolute";
    logoEl.style.top = "50%";
    logoEl.style.left = "50%";
    logoEl.style.transform = "translate(-50%, -50%)";
    logoEl.style.width = "150px";
    logoEl.style.height = "140px";
    logoEl.style.pointerEvents = "none";
    logoEl.style.zIndex = "10000";
    floatingPlayer.appendChild(logoEl);

    // Create video (hidden initially)
    videoEl = document.createElement("video");
    videoEl.id = "orbitVideo";
    videoEl.src = videoSrc;
    videoEl.autoplay = false;
    videoEl.loop = false;
    videoEl.muted = false;
    videoEl.playsInline = true;
    videoEl.style.position = "absolute";
    videoEl.style.borderRadius = "50%";
    videoEl.style.objectFit = "cover";
    videoEl.style.top = "50%";
    videoEl.style.left = "50%";
    videoEl.style.transform = "translate(-50%, -50%)";
    videoEl.style.width = "190px";
    videoEl.style.height = "190px";
    videoEl.style.pointerEvents = "none";
    videoEl.style.zIndex = "10000";
    videoEl.classList.add("hidden"); // initially hidden
    floatingPlayer.appendChild(videoEl);

    console.log("🌟 Logo and video elements added.");

    // Toggle function
    function toggleVideo() {
      showingVideo = !showingVideo;
      if (showingVideo) {
        logoEl.classList.add("hidden");
        videoEl.classList.remove("hidden");
        videoEl.play();
        console.log("▶ Video playing, logo hidden.");
      } else {
        videoEl.pause();
        videoEl.classList.add("hidden");
        logoEl.classList.remove("hidden");
        console.log("🛑 Video hidden, logo visible.");
      }
    }

    // Expose toggle in console
    window.toggleOrbitVideo = toggleVideo;
    console.log("ℹ Use `toggleOrbitVideo()` in console to switch logo/video.");
  }, 200);

})();


