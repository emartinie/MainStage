(function () {
  console.log("🌟 Orbit Logo Module initializing...");

  const logoSrc = "/images/HGHouses.png"; // path to your logo
  let logoEl;

  // Wait for floating player to exist in DOM
  const waitForPlayer = setInterval(() => {
    const floatingPlayer = document.getElementById("floatingPlayer");
    if (!floatingPlayer) return;

    clearInterval(waitForPlayer);
    console.log("✅ Floating player found, adding logo overlay...");

    // Create logo element
    logoEl = document.createElement("img");
    logoEl.id = "orbitLogo";
    logoEl.src = logoSrc;
    logoEl.style.position = "absolute";
    logoEl.style.top = "50%";
    logoEl.style.left = "50%";
    logoEl.style.transform = "translate(-50%, -50%)";
    logoEl.style.width = "150px"; // adjust size as needed
    logoEl.style.height = "auto";
    logoEl.style.pointerEvents = "none"; // allows clicks to pass through
    logoEl.style.zIndex = "10000"; // above everything

    floatingPlayer.appendChild(logoEl);
    console.log("🌟 Logo added to floating player.");
  }, 200);
})();