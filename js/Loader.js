// --- Config ---
const START_DATE = new Date("2024-10-19T00:00:00Z");
const TOTAL_WEEKS = 52;

// --- Helper: Current Week ---
function getCurrentWeekNumber() {
  const now = new Date();
  const diffMs = now - START_DATE;
  if (diffMs < 0) return 1; // before start date
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)) % TOTAL_WEEKS + 1;
}

// --- Global State ---
let currentWeek = getCurrentWeekNumber();
console.log(`🔢 Initial week calculated: ${currentWeek}`);

// --- DOM Elements ---
const mainStage = document.getElementById("mainStage");
const weekSelect = document.getElementById("weekSelect");
const nextWeekBtn = document.getElementById("nextWeekBtn");
const prevWeekBtn = document.getElementById("prevWeekBtn");

// --- Utility: Update Week Display & Controls ---
function updateWeekDisplay() {
  if (weekSelect) {
    weekSelect.value = currentWeek;
  }
  console.log(`📅 Week updated to: ${currentWeek}`);
  loadWeekContent(currentWeek);
}

// --- Load Commentary ---
async function loadCommentary(week) {
  if (!mainStage) return console.warn("#mainStage not found");

  const commentaryUrl = `commentary/week${week}.html`;

  try {
    const res = await fetch(commentaryUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    let container = mainStage.querySelector(".commentary-card");

    if (!container) {
      container = document.createElement("div");
      container.className = "glass-panel fade-slide commentary-card hidden";
      mainStage.appendChild(container);
    }

    container.innerHTML = html;
    console.log(`✅ Commentary for week ${week} loaded.`);
  } catch (err) {
    mainStage.innerHTML = `
      <div class="commentary-placeholder visible">
        ⚠️ Commentary for week ${week} not found.
      </div>
    `;
    console.warn(`Commentary fetch failed for week ${week}:`, err);
  }

  // Toggle logic
  const toggleBtn = document.getElementById("toggleCommentaryBtn");
  const container = mainStage.querySelector(".commentary-card");

  if (toggleBtn && container) {
    toggleBtn.onclick = () => {
      container.classList.toggle("hidden");
      toggleBtn.textContent = container.classList.contains("hidden")
        ? "📘 Show Commentary"
        : "📘 Hide Commentary";
    };
    console.log("💡 Commentary toggle initialized");
  }
}

// --- Load Week Content (Cards, Videos, etc.) ---
async function loadWeekContent(week) {
  console.log(`📂 Loading content for week ${week}...`);
  
  // Load commentary
  loadCommentary(week);

  // Load week JSON
  try {
    const res = await fetch(`data/week${week}.json`);
    if (!res.ok) throw new Error(`Week ${week} JSON not found`);
    const data = await res.json();

    renderCards(data.cards || []);
    console.log(`🎴 Week ${week} cards loaded:`, data.cards || []);
  } catch (err) {
    console.warn(err);
    mainStage.innerHTML = `
      <div class="placeholder visible">
        ⚠️ Week ${week} content not found.
      </div>
    `;
  }
}

// --- Render Cards ---
function renderCards(cards) {
  const container = document.createElement("div");
  container.className = "cards-container";

  cards.forEach(card => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${card.title}</h3>
      <p>${card.description || ""}</p>
      ${card.video ? `<video src="${card.video}" controls></video>` : ""}
    `;
    container.appendChild(div);
  });

  // Clear old cards
  const old = mainStage.querySelector(".cards-container");
  if (old) old.remove();
  mainStage.appendChild(container);
}

// --- Week Navigation ---
function nextWeek() {
  currentWeek = currentWeek >= TOTAL_WEEKS ? 1 : currentWeek + 1;
  updateWeekDisplay();
}

function prevWeek() {
  currentWeek = currentWeek <= 1 ? TOTAL_WEEKS : currentWeek - 1;
  updateWeekDisplay();
}

// --- Event Listeners ---
if (nextWeekBtn) nextWeekBtn.onclick = nextWeek;
if (prevWeekBtn) prevWeekBtn.onclick = prevWeek;
if (weekSelect) {
  weekSelect.onchange = () => {
    const val = parseInt(weekSelect.value);
    if (!isNaN(val)) {
      currentWeek = val;
      updateWeekDisplay();
    }
  };
}

// --- Initial Load ---
updateWeekDisplay();