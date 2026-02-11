import { registerResource, getResource } from "/js/core/resourceManager.js";

// --- Journey Steps ---
const journeySteps = [
  {
    id: "welcome",
    title: "Welcome",
    html: `
      <p>You’re not here by accident.</p>
      <p>This is a space to rest, learn, and connect.</p>
    `,
    nextLabel: "Begin"
  },
  {
    id: "rest",
    title: "🪑 Rest",
    html: `
      <p>Start with peace.</p>
      <p>Tap TODAY whenever you need calm and grounding.</p>
      <button data-action="showToday">Show Me</button>
    `,
    arrow: "#todayBtn"
  },
  {
    id: "join",
    title: "🤝 Join",
    html: `
      <p>You don’t have to walk alone.</p>
      <button data-action="openMap">Open Map</button>
    `,
    arrow: "#mapCard"
  },
  {
    id: "speak",
    title: "🗣️ Speak",
    html: `
      <p>Your voice matters.</p>
      <button data-action="openSpeak">Try Speaking</button>
    `
  },
  {
    id: "learn",
    title: "📖 Learn",
    html: `
      <p>Grow at your own pace.</p>
      <button data-action="openLearning">Open Learning</button>
    `,
    arrow: "#openScriptureHeaderBtn"
  },
  {
    id: "listen",
    title: "🎧 Listen",
    html: `
      <p>Sometimes, it’s best to just listen.</p>
      <button data-action="openPlayer">Open Player</button>
    `
  },
  {
    id: "customize",
    title: "Make It Yours",
    html: `
      <p>You can explore however you like.</p>
      <p>There’s no wrong path here.</p>
    `
  },
  {
    id: "finish",
    title: "You're Ready",
    html: `
      <p>You’ve seen the doors.</p>
      <p>Now walk freely.</p>
    `,
    nextLabel: "Finish"
  }
];

// --- Track progress ---
let journeyIndex = Number(localStorage.getItem("journeyStep")) || 0;

// --- Render current step ---
function renderStep() {
  const contentEl = document.getElementById("journeyContent");
  if (!contentEl) return;

  const step = journeySteps[journeyIndex];
  if (!step) return;

  contentEl.innerHTML = step.html;

  // Enable/disable navigation buttons
  const prevBtn = document.getElementById("journeyPrevBtn");
  const nextBtn = document.getElementById("journeyNextBtn");
  if (prevBtn) prevBtn.disabled = journeyIndex === 0;
  if (nextBtn) {
    nextBtn.disabled = journeyIndex === journeySteps.length - 1;
    nextBtn.textContent = step.nextLabel || "Next";
  }

  attachStepActions(step);
}

// --- Attach step-specific button actions ---
function attachStepActions(step) {
  const contentEl = document.getElementById("journeyContent");
  if (!contentEl) return;

  // TODAY button
  const showTodayBtn = contentEl.querySelector("[data-action='showToday']");
  if (showTodayBtn) {
    showTodayBtn.addEventListener("click", () => {
      console.log("CLICK");
      highlight("#todayBtn");
      softMinimize(() => console.log("DONE"));
    });
  }

  // Open Map
  const openMapBtn = contentEl.querySelector("[data-action='openMap']");
  if (openMapBtn) openMapBtn.addEventListener("click", () => goToCard("mapCard"));

  // Open Speak
  const openSpeakBtn = contentEl.querySelector("[data-action='openSpeak']");
  if (openSpeakBtn) openSpeakBtn.addEventListener("click", () => openPorchPanel('Speak', '<p>Messaging coming soon 🌱</p>'));

  // Open Learning
  const openLearningBtn = contentEl.querySelector("[data-action='openLearning']");
  if (openLearningBtn) openLearningBtn.addEventListener("click", () => openDockCModal());

  // Open Player
  const openPlayerBtn = contentEl.querySelector("[data-action='openPlayer']");
  if (openPlayerBtn) openPlayerBtn.addEventListener("click", () => openPlayerPanel());
}

// --- Soft minimize helper ---
function softMinimize(callback) {
  const panel = document.getElementById("journeyPanel");
  if (!panel) return;

  panel.classList.add("journey-soft-minimized");
  panel.style.transition = "transform 0.3s ease, opacity 0.3s ease";
  panel.style.transform = "scale(0.9)";
  panel.style.opacity = "0.8";

  if (typeof callback === "function") callback();
}

// --- Save progress ---
function saveJourneyStep() {
  localStorage.setItem("journeyStep", journeyIndex);
}

// --- Resource functions ---
registerResource("journey", {
  openJourney() {
    const panel = document.getElementById("journeyPanel");
    if (!panel) return console.warn("Journey panel missing");

    panel.classList.remove("hidden");
    panel.classList.remove("journey-soft-minimized");
    renderStep();
  },

  closeJourney() {
    const panel = document.getElementById("journeyPanel");
    if (!panel) return;
    panel.classList.add("hidden");
  },

  minimizeJourney() {
    softMinimize();
  },

  nextStep() {
    if (journeyIndex < journeySteps.length - 1) {
      journeyIndex++;
      renderStep();
      saveJourneyStep();
    }
  },

  prevStep() {
    if (journeyIndex > 0) {
      journeyIndex--;
      renderStep();
      saveJourneyStep();
    }
  }
});

// --- Attach navigation buttons ---
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("journeyCloseBtn")?.addEventListener("click", () => {
    getResource("journey")?.closeJourney();
  });

  document.getElementById("journeyMinimizeBtn")?.addEventListener("click", () => {
    getResource("journey")?.minimizeJourney();
  });

  document.getElementById("journeyNextBtn")?.addEventListener("click", () => {
    getResource("journey")?.nextStep();
  });

  document.getElementById("journeyPrevBtn")?.addEventListener("click", () => {
    getResource("journey")?.prevStep();
  });
});

// --- Highlight helper ---
function highlight(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.classList.add("highlighted");
  setTimeout(() => el.classList.remove("highlighted"), 1000);
}