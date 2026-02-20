// appCompanion.dev.js
console.log("✨ appCompanion.dev.js loaded");

export const Companion = {
  // reference to existing elements / functions
  init() {
    this.orbitFace = document.getElementById("orbitPlayer"); // or your Orbit player container
    this.cards = document.querySelectorAll(".card"); // whatever selector you use
    this.prayerButton = document.getElementById("prayerButton");
    this.joinButton = document.getElementById("joinButton");
    this.prayTogetherButton = document.getElementById("prayTogetherBtn");

    console.log("🛠 Companion initialized with app elements");
  },

  // animate the orbit face to show companion active
  activateFace() {
    if (!this.orbitFace) return;
    this.orbitFace.classList.add("companion-active");
    console.log("🎛 Companion face activated");
    // Optional: add canvas animation here later
  },

  deactivateFace() {
    if (!this.orbitFace) return;
    this.orbitFace.classList.remove("companion-active");
    console.log("🎛 Companion face deactivated");
  },

  // helper functions: simulate user clicking buttons
  goToCard(cardIndex) {
    if (!this.cards || !this.cards[cardIndex]) return;
    this.cards[cardIndex].scrollIntoView({ behavior: "smooth", block: "center" });
    console.log(`📖 Companion navigated to card #${cardIndex}`);
  },

  openPrayerForm() {
    if (this.prayerButton) this.prayerButton.click();
    console.log("🙏 Companion opened prayer form");
  },

  openJoinForm() {
    if (this.joinButton) this.joinButton.click();
    console.log("👥 Companion opened join form");
  },

  openPrayTogether() {
    if (this.prayTogetherButton) this.prayTogetherButton.click();
    console.log("🌐 Companion opened PrayTogether modal");
  },

  // you can extend more helper functions here...
};