// renderCosmicCards_v5.js
console.log("[RenderCosmicCards v5] Initializing...");

document.addEventListener("DOMContentLoaded", () => {
  const carouselContainer = document.getElementById("carouselContainer");

  if (!carouselContainer) {
    console.error("[RenderCosmicCards v5] ❌ Missing #carouselContainer in HTML!");
    return;
  }

  // Build minimal structure if not present
  if (!carouselContainer.querySelector(".carousel-track")) {
    carouselContainer.innerHTML = `
      <div class="carousel-wrapper cosmic-carousel">
        <button class="nav-btn prev-btn">⟵</button>
        <div class="carousel-track"></div>
        <button class="nav-btn next-btn">⟶</button>
      </div>
      <div class="card-detail"></div>
    `;
    console.log("[RenderCosmicCards v5] Auto-created carousel structure.");
  }

  // Re-query now that structure exists
  const safeTrack = carouselContainer.querySelector(".carousel-track");
  const safeDetail = carouselContainer.querySelector(".card-detail");
  const prevBtn = carouselContainer.querySelector(".prev-btn");
  const nextBtn = carouselContainer.querySelector(".next-btn");

  if (!safeTrack || !safeDetail) {
    console.error("[RenderCosmicCards v5] ❌ Missing carousel inner elements after creation.");
    return;
  }

  // Example: 10 dynamic cards
  const cardsData = [
    { title: "Bible Study", desc: "Weekly scripture outlines and study notes" },
    { title: "Trivia Game", desc: "Play Bible trivia with friends" },
    { title: "Prepper Skills", desc: "Practical skills for modern readiness" },
    { title: "Audio Player", desc: "Listen to devotionals and readings" },
    { title: "Video Lessons", desc: "Watch insightful teachings" },
    { title: "Scripture Search", desc: "Quick lookup across versions" },
    { title: "Prophecy Map", desc: "Interactive biblical prophecy map" },
    { title: "Podcasts", desc: "Bible discussions and interviews" },
    { title: "Bible API", desc: "Explore multiple Bible translations" },
    { title: "Weekly JSON", desc: "Structured content per study week" }
  ];

  // Populate the carousel track
  safeTrack.innerHTML = "";
  cardsData.forEach((card, i) => {
    const div = document.createElement("div");
    div.className = "carousel-card cosmic-card";
    div.dataset.index = i;
    div.innerHTML = `
      <h3>${card.title}</h3>
      <p>${card.desc}</p>
    `;
    div.addEventListener("click", () => showDetail(card));
    safeTrack.appendChild(div);
  });

  // Core navigation logic
  let currentIndex = 0;
  const total = cardsData.length;

  function updateCarousel() {
    const offset = -currentIndex * 100;
    safeTrack.style.transform = `translateX(${offset}%)`;
  }

  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + total) % total;
    updateCarousel();
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % total;
    updateCarousel();
  });

  function showDetail(card) {
    safeDetail.innerHTML = `
      <div class="detail-card cosmic-detail">
        <h2>${card.title}</h2>
        <p>${card.desc}</p>
        <button class="close-detail">Close</button>
      </div>
    `;
    const closeBtn = safeDetail.querySelector(".close-detail");
    closeBtn.addEventListener("click", () => {
      safeDetail.innerHTML = "";
    });
  }

  // Initial style setup
  safeTrack.style.display = "flex";
  safeTrack.style.transition = "transform 0.5s ease";
  safeTrack.style.width = `${cardsData.length * 100}%`;
  safeTrack.querySelectorAll(".carousel-card").forEach(card => {
    card.style.flex = "0 0 100%";
    card.style.textAlign = "center";
    card.style.padding = "2rem";
  });

  console.log("[RenderCosmicCards v5] ✅ Carousel initialized successfully.");
});