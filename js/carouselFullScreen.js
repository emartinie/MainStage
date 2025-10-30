const cardsData = [
  { title: "Bible Study", content: "Genesis commentary goes here..." },
  { title: "Trivia Game", content: "1001 questions loaded dynamically..." },
  { title: "Prepper Skills", content: "Survival tips, recipes, etc." },
  { title: "Scripture Reader", content: "Load Bible API verses..." },
  { title: "Podcast Player", content: "Embedded podcast playlist..." },
  { title: "Video Card", content: "Video content or popups..." },
  { title: "Prophecy Map", content: "Interactive map goes here..." },
  { title: "Weekly JSON", content: "Content for week1.json..." },
  { title: "Audio Player", content: "Orbital badass player content..." },
  { title: "Extra Card", content: "Future content placeholder..." }
];

const track = document.getElementById("carouselTrack");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let currentIndex = 0;

// Render cards
cardsData.forEach((item, i) => {
  const card = document.createElement("div");
  card.classList.add("card");
  if (i === 0) card.classList.add("active");

  card.innerHTML = `
    <h2>${item.title}</h2>
    <p>${item.description}</p>
  `;
  track.appendChild(card);
});

function updateCarousel() {
  const offset = -currentIndex * 100;
  track.style.transform = `translateX(${offset}%)`;

  document.querySelectorAll(".card").forEach((card, i) => {
    card.classList.toggle("active", i === currentIndex);
  });
}

prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + cardsData.length) % cardsData.length;
  updateCarousel();
});

nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % cardsData.length;
  updateCarousel();
});