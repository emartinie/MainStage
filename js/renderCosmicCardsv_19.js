console.log("[RenderCosmicCardsv19] Initializing...");

document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById("carousel");


  const cardData = [
    { id: 1, title: "📖 Scripture", desc: "Dynamic Bible API integration" },
    { id: 2, title: "❓ Trivia Game", desc: "Bible trivia fun and learning" },
    { id: 3, title: "🎧 Audio Player", desc: "Cosmic floating player" },
    { id: 4, title: "🗺️ Prophecy Map", desc: "Interactive location-based prophecies" },
    { id: 5, title: "🕯️ Weekly Study", desc: "Load weekly JSON study cards" },
    { id: 6, title: "📅 Calendar", desc: "Auto-loaded current week view" },
    { id: 7, title: "🔍 Search Scripture", desc: "Bible search powered by API" },
    { id: 8, title: "🎙️ Podcasts", desc: "Featured faith-based podcasts" },
    { id: 9, title: "⚒️ Prepper Skills", desc: "Survival, wisdom, and readiness" },
    { id: 10, title: "💫 Cosmic Player", desc: "Animated orbiting control interface" }
  ];

  cardData.forEach(card => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h2 class="text-3xl font-bold mb-2">${card.title}</h2>
      <p class="opacity-80 text-lg">${card.desc}</p>
    `;
    carousel.appendChild(div);
  });

  // Carousel logic
  let index = 0;
  const total = cardData.length;

  const updateCarousel = () => {
    carousel.style.transform = `translateX(-${index * 100}%)`;
  };

  document.querySelector(".prev-btn").addEventListener("click", () => {
    index = (index - 1 + total) % total;
    updateCarousel();
  });

  document.querySelector(".next-btn").addEventListener("click", () => {
    index = (index + 1) % total;
    updateCarousel();
  });

  console.log("[RenderCosmicCards v5] Loaded successfully.");
});