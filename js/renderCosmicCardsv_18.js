console.log("[RenderCosmicCards v5] Initializing...");

document.addEventListener("DOMContentLoaded", () => {
  const carouselContainer = document.getElementById("carouselContainer");
  if (!carouselContainer) {
    console.error("[RenderCosmicCards v5] ❌ No #carouselContainer found");
    return;
  }

  // ---- Data for the 10 cards ----
  const cosmicCards = [
    { id: "trivia", title: "Trivia Game", desc: "Test your Bible knowledge", color: "#8ecae6" },
    { id: "prepper", title: "Prepper Skills", desc: "Learn survival wisdom", color: "#219ebc" },
    { id: "scripture", title: "Scripture Study", desc: "Daily verses and devotionals", color: "#023047" },
    { id: "podcasts", title: "Podcasts", desc: "Listen and grow your faith", color: "#ffb703" },
    { id: "videos", title: "Videos", desc: "Watch teachings & messages", color: "#fb8500" },
    { id: "bibleApi", title: "Bible API", desc: "Explore Bible versions", color: "#6a4c93" },
    { id: "map", title: "Prophecy Map", desc: "See biblical prophecies worldwide", color: "#8338ec" },
    { id: "weeklies", title: "Weekly JSON", desc: "Study guides & readings", color: "#3a86ff" },
    { id: "music", title: "Cosmic Player", desc: "Play and orbit your tracks", color: "#ff006e" },
    { id: "calendar", title: "Calendar", desc: "Plan your study schedule", color: "#fb5607" }
  ];

  // ---- Build the carousel structure ----
  carouselContainer.innerHTML = `
    <div class="carousel-wrapper cosmic-carousel">
      <button class="nav-btn prev-btn">⟵</button>
      <div class="carousel-track"></div>
      <button class="nav-btn next-btn">⟶</button>
    </div>
    <div class="card-detail cosmic-card-detail"></div>
  `;

  const track = carouselContainer.querySelector(".carousel-track");
  const detail = carouselContainer.querySelector(".card-detail");
  let currentIndex = 0;

  // ---- Create all cards ----
  cosmicCards.forEach(card => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "cosmic-card";
    cardDiv.style.background = card.color;
    cardDiv.innerHTML = `
      <h2>${card.title}</h2>
      <p>${card.desc}</p>
      <button class="open-card" data-id="${card.id}">Open</button>
    `;
    track.appendChild(cardDiv);
  });

  const cards = track.querySelectorAll(".cosmic-card");

  // ---- Navigation logic ----
  const prevBtn = carouselContainer.querySelector(".prev-btn");
  const nextBtn = carouselContainer.querySelector(".next-btn");

  function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCarousel();
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCarousel();
  });

  // ---- Card expansion logic ----
  track.addEventListener("click", e => {
    if (e.target.classList.contains("open-card")) {
      const id = e.target.getAttribute("data-id");
      const card = cosmicCards.find(c => c.id === id);
      renderCardDetail(card);
    }
  });

  function renderCardDetail(card) {
    detail.innerHTML = `
      <div class="detail-content cosmic-expand">
        <h3>${card.title}</h3>
        <p>${card.desc}</p>
        <button class="close-detail">✕ Close</button>
        <div class="dynamic-area">
          <p>[Dynamic content for <strong>${card.id}</strong> will load here]</p>
        </div>
      </div>
    `;
    detail.classList.add("active");
  }

  detail.addEventListener("click", e => {
    if (e.target.classList.contains("close-detail")) {
      detail.classList.remove("active");
    }
  });

  console.log("[RenderCosmicCards v5] ✅ Loaded");
});


// ---- Basic Cosmic Carousel Styles ----
const style = document.createElement("style");
style.textContent = `
.cosmic-carousel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  height: 100vh;
  background: radial-gradient(circle at center, #0a0a1a, #000);
  color: #fff;
}

.carousel-track {
  display: flex;
  transition: transform 0.6s ease-in-out;
  width: 100%;
  height: 100%;
}

.cosmic-card {
  min-width: 100%;
  padding: 80px 40px;
  text-align: center;
  border-radius: 16px;
  box-shadow: 0 0 25px rgba(255,255,255,0.15);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.cosmic-card:hover {
  transform: scale(1.03);
  box-shadow: 0 0 35px rgba(255,255,255,0.25);
}

.cosmic-card h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.open-card {
  background: #fff;
  color: #000;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}
.open-card:hover {
  background: #ddd;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.15);
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  z-index: 5;
  padding: 10px 18px;
  border-radius: 10px;
  transition: background 0.3s;
}
.nav-btn:hover { background: rgba(255,255,255,0.3); }

.prev-btn { left: 10px; }
.next-btn { right: 10px; }

.cosmic-card-detail {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  max-height: 70vh;
  background: rgba(10,10,30,0.95);
  backdrop-filter: blur(10px);
  color: #fff;
  padding: 20px;
  transform: translateY(100%);
  transition: transform 0.5s ease;
  overflow-y: auto;
}

.cosmic-card-detail.active {
  transform: translateY(0);
}

.detail-content {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.close-detail {
  background: transparent;
  color: #fff;
  border: 2px solid #fff;
  border-radius: 8px;
  padding: 8px 18px;
  cursor: pointer;
  margin-top: 10px;
}
.close-detail:hover {
  background: #fff;
  color: #000;
}
`;
document.head.appendChild(style);