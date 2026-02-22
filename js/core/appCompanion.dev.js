// appCompanion.dev.js
console.log("✨ appCompanion.dev.js loaded");

export const Companion = {

  // reference to existing elements / functions
  init() {
    this.orbitFace = document.getElementById("orbitPlayer");
    this.cards = document.querySelectorAll(".card");
    this.prayerButton = document.getElementById("prayerButton");
    this.joinButton = document.getElementById("joinButton");
    this.prayTogetherButton = document.getElementById("prayTogetherBtn");

    console.log("🛠 Companion initialized with app elements");

    // Optional: auto-create a commands panel for users
    this.createCommandPanel();
  },

  // animate the orbit face
  activateFace() {
    if (!this.orbitFace) return;
    this.orbitFace.classList.add("companion-active");
    console.log("🎛 Companion face activated");
  },

  deactivateFace() {
    if (!this.orbitFace) return;
    this.orbitFace.classList.remove("companion-active");
    console.log("🎛 Companion face deactivated");
  },

  // helper functions
  goToCard(cardIndex) {
    if (!this.cards || !this.cards[cardIndex]) return;
    this.cards[cardIndex].scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
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

runCommand(input) {
  if (!input) return;

  const normalized = input.toLowerCase().trim();

  for (const key in Companion.commands) {
    if (normalized.includes(key)) {
      this.activateFace();

      // Run the command
      Companion.commands[key]();

      // Auto-deactivate the face after 1.5 seconds
      setTimeout(() => {
        this.deactivateFace();
      }, 1500);

      console.log(`🤖 Companion executed command: "${normalized}"`);
      return;
    }
  }

    console.log(`❌ Companion didn't understand: "${normalized}"`);
  },

  // create a simple panel showing all commands
  createCommandPanel() {
    if (document.getElementById("companionPanel")) return; // already exists

    const panel = document.createElement("div");
    panel.id = "companionPanel";
    panel.style.position = "fixed";
    panel.style.top = "129px";
    panel.style.left = "9px";
    panel.style.background = "rgba(30,30,30,0.9)";
    panel.style.color = "white";
    panel.style.padding = "12px";
    panel.style.borderRadius = "10px";
    panel.style.zIndex = 9999;
    panel.style.fontSize = "14px";
    panel.style.maxWidth = "200px";
    panel.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
    panel.innerHTML = `<strong>AI Commands</strong><br/>`;

    for (const key in Companion.commands) {
      const btn = document.createElement("button");
      btn.innerText = key;
      btn.style.display = "block";
      btn.style.margin = "4px 0";
      btn.style.width = "100%";
      btn.style.padding = "4px 6px";
      btn.style.fontSize = "13px";
      btn.style.cursor = "pointer";
      btn.onclick = () => Companion.runCommand(key);
      panel.appendChild(btn);
    }

    document.body.appendChild(panel);
  }
};

// 👇 Commands MUST be defined AFTER the object
Companion.commands = {
  "go to study card": () => Companion.goToCard(2),   // card 3
  "open prayer form": () => Companion.openPrayerForm(),
  "join community": () => Companion.openJoinForm(),
  "pray together": () => Companion.openPrayTogether(),
  "activate face": () => Companion.activateFace(),
  "deactivate face": () => Companion.deactivateFace()
};

// 👇 Safe button wiring
document.addEventListener("DOMContentLoaded", () => {
  Companion.init();

  const runBtn = document.getElementById("companionRun");
  const input = document.getElementById("companionInput");

  if (runBtn && input) {
    runBtn.onclick = () => {
      Companion.runCommand(input.value);
    };
  }
});
