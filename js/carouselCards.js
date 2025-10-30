const cardsData = [
  { title: "Trivia Game", description: "Test your Bible knowledge."},
  { title: "Prepper Skills", description: "Learn vital survival skills." },
  { title: "Audio/ Video Teaching", description: "Listen to weekly episodes." },
  { title: "Scripture Study", description: "Dive deep into the Word." },
  { title: "Video Lessons", description: "Watch powerful teachings." },
  { title: "Search Scripture", description: "Quickly find verses." },
  { title: "Prophecy Map", description: "Explore biblical prophecy." },
  { title: "Bible API", description: "Access multiple translations." },
  { title: "Weekly Bible Studies", description: "See all weekly content." },
  { title: "Extras", description: "Bonus materials and content." }
];

const track = document.querySelector(".carousel-track");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");
const dotsContainer = document.querySelector(".dots");

let currentIndex = 0;

// Build Cards
cardsData.forEach((card, idx) => {
  const cardEl = document.createElement("div");
  cardEl.classList.add("card");
  if(idx === 0) cardEl.classList.add("active");
  cardEl.innerHTML = `<h2>${card.title}</h2><p>${card.description}</p>`;
  track.appendChild(cardEl);
  function buildCards(cardsData) {
  const track = document.querySelector('.carousel-track');
  track.innerHTML = ''; // clear existing cards

  cardsData.forEach(card => {
    const cardType = card.type || 'default';
    const icon = cardIcons[cardType] || cardIcons.default;
    const glowColor = cardGlowColors[cardType] || cardGlowColors.default;

    const cardEl = document.createElement('div');
    cardEl.classList.add('card');
    cardEl.innerHTML = `
      <div class="card-icon">${icon}</div>
      <h2 class="card-title">${card.title}</h2>
      <p class="card-desc">${card.description}</p>
    `;

    // Apply glow color as a CSS variable
    cardEl.style.setProperty('--card-glow', glowColor);

    track.appendChild(cardEl);
  });
}

  // Dot
  const dot = document.createElement("span");
  dot.classList.add("dot");
  if(idx === 0) dot.classList.add("active");
  dot.addEventListener("click", () => goToCard(idx));
  dotsContainer.appendChild(dot);
});



const cards = document.querySelectorAll(".card");
const dots = document.querySelectorAll(".dot");

function updateCarousel() {
  const width = track.clientWidth;
  track.style.transform = `translateX(-${currentIndex * width}px)`;
  cards.forEach((c, i) => c.classList.toggle("active", i === currentIndex));
  dots.forEach((d, i) => d.classList.toggle("active", i === currentIndex));
}

function goToCard(idx) {
  currentIndex = idx;
  updateCarousel();
}

prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  updateCarousel();
});

nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % cards.length;
  updateCarousel();
});

// Make first card visible
updateCarousel();