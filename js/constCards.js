const cardIcons = {
  bible: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/>
    </svg>
  `,
  trivia: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="gold" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" stroke="gold" stroke-width="2" fill="gold"/>
      <text x="12" y="16" text-anchor="middle" font-size="12" fill="#000">?</text>
    </svg>
  `,
  podcast: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="cyan">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6h6v13"/>
    </svg>
  `,
  video: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="magenta">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-6.338-3.633A1 1 0 007 8.364v7.272a1 1 0 001.414.914l6.338-3.633a1 1 0 000-1.732z"/>
    </svg>
  `,
  prepper: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="green" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l4 8H8l4-8zm0 10v10m-4-4h8"/>
    </svg>
  `,
  map: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="orange">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l6 3 6-3 6 3v12l-6-3-6 3-6-3V6z"/>
    </svg>
  `,
  search: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="lightblue">
      <circle cx="11" cy="11" r="8" stroke-width="2"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke-width="2"/>
    </svg>
  `,
  prophecy: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="violet">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2a10 10 0 0110 10H2a10 10 0 0110-10z"/>
    </svg>
  `,
  bibleAPI: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="yellow">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 4v16h14V4H5zm7 0v16"/>
    </svg>
  `,
  weekly: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8M8 11h8M8 15h8"/>
    </svg>
  `,
  default: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="grey" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" stroke-width="2"/>
    </svg>
  `
};

// Optional: glow colors per card
const cardGlowColors = {
  bible: "#00ffff",
  trivia: "gold",
  podcast: "cyan",
  video: "magenta",
  prepper: "green",
  map: "orange",
  search: "lightblue",
  prophecy: "violet",
  bibleAPI: "yellow",
  weekly: "white",
  default: "#888"
};

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