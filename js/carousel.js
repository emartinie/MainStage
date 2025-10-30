const carouselContainer = document.getElementById('carouselContainer');
const track = carouselContainer.querySelector('.carousel-track');
const prevBtn = carouselContainer.querySelector('.prev-btn');
const nextBtn = carouselContainer.querySelector('.next-btn');

let cards = [];
let currentIndex = 0;

// Sample dynamic data (replace with your JSON)
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

// Create cards dynamically
function renderCards(data) {
  track.innerHTML = '';
  cards = data.map((item, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    if(index === 0) card.classList.add('active');
    card.innerHTML = `<h2>${item.title}</h2><p>${item.description}</p>`;
    track.appendChild(card);
    return card;
  });
}
renderCards(cardData);

// Update carousel position
function updateCarousel() {
  const cardWidth = cards[0].offsetWidth + 40; // card + margin
  track.style.transform = `translateX(${-currentIndex * cardWidth}px)`;
  cards.forEach((card, i) => card.classList.toggle('active', i === currentIndex));
}

prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  updateCarousel();
});

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % cards.length;
  updateCarousel();
});