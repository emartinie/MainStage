const activeTrack = document.querySelector('.carousel-track');
const prevBtnA = document.getElementById('prevBtn');
const nextBtnA = document.getElementById('nextBtn');
const dotsContainerA = document.getElementById('dots');

const cardsDataA = [
  { title: "Card 1", description: "Description for card 1" },
  { title: "Card 2", description: "Description for card 2" },
  { title: "Card 3", description: "Description for card 3" },
  { title: "Card 4", description: "Description for card 4" },
  { title: "Card 5", description: "Description for card 5" },
  { title: "Card 6", description: "Description for card 6" },
  { title: "Card 7", description: "Description for card 7" },
  { title: "Card 8", description: "Description for card 8" },
  { title: "Card 9", description: "Description for card 9" },
  { title: "Card 10", description: "Description for card 10" },
];

let currentIndexA = 0;

function buildCards() {
  track.innerHTML = "";
  dotsContainer.innerHTML = "";

  cardsData.forEach((card, index) => {
    // Create card
    const cardEl = document.createElement('div');
    cardEl.className = 'card' + (index === currentIndex ? ' active' : ' inactive');
    cardEl.innerHTML = `<h2>${card.title}</h2><p>${card.description}</p>`;
    track.appendChild(cardEl);

    // Create dot
    const dot = document.createElement('div');
    dot.className = 'dot' + (index === currentIndex ? ' active' : '');
    dot.addEventListener('click', () => {
      currentIndex = index;
      updateCarousel();
    });
    dotsContainer.appendChild(dot);
  });
}

function updateCarousel() {
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    card.classList.toggle('active', index === currentIndex);
    card.classList.toggle('inactive', index !== currentIndex);
  });

  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot, index) => dot.classList.toggle('active', index === currentIndex));

  const cardWidth = cards[0].offsetWidth + 20; // margin included
  track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
}

prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + cardsData.length) % cardsData.length;
  updateCarousel();
});

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % cardsData.length;
  updateCarousel();
});

// Initialize
buildCards();
updateCarousel();