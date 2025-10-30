document.addEventListener("DOMContentLoaded", () => {
  const orbitContainer = document.getElementById("orbitContainer");
  const numCards = 10;
  const radius = 220;
  const cards = [];

  // Create cards dynamically
  for (let i = 0; i < numCards; i++) {
    const card = document.createElement("div");
    card.className = "orbit-card";
    card.textContent = "Card " + (i + 1);
    orbitContainer.appendChild(card);
    cards.push(card);
  }

  let angle = 0;

  // Animate rotation
  function animate() {
    angle += 0.005; // rotation speed
    cards.forEach((card, index) => {
      const theta = angle + (index * (2 * Math.PI / numCards));
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * radius * 0.5; // vertical oval shape
      const z = Math.sin(theta) * 100; // for depth illusion
      card.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
      card.style.zIndex = Math.round(z);
    });
    requestAnimationFrame(animate);
  }

  animate();
});