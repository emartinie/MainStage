// --- Config ---
const START_DATE = new Date("2024-10-19T00:00:00Z");
const TOTAL_WEEKS = 52;

// --- Helpers ---
function calculateCurrentWeek() {
  const now = new Date();
  const diffWeeks = Math.floor((now - START_DATE) / (1000 * 60 * 60 * 24 * 7));
  return Math.min(Math.max(diffWeeks + 1, 1), TOTAL_WEEKS);
}

// --- Main Loader ---
async function mainStageLoader() {
  const mainStage = document.getElementById("mainStage");
  const weekSelect = document.getElementById("weekSelect");

  if (!mainStage || !weekSelect) {
    console.warn("Missing #mainStage or #weekSelect in DOM");
    return;
  }

  // 1️⃣ Populate dropdown before anything else
  weekSelect.innerHTML = "";
  for (let i = 1; i <= TOTAL_WEEKS; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = Week ${i};
    weekSelect.appendChild(opt);
  }
  console.log("🗓️ Week selector populated.");

  // 2️⃣ Determine initial week (safe from NaN)
  let currentWeek = calculateCurrentWeek() || 1;
  weekSelect.value = currentWeek;
  console.log(🔢 Initial week set to: ${currentWeek});

  // 3️⃣ Load all content for the selected week
  await loadAllWeekContent(currentWeek);

  // 4️⃣ Attach listener AFTER options exist
  weekSelect.addEventListener("change", async () => {
    const newWeek = parseInt(weekSelect.value, 10);
    if (!isNaN(newWeek)) {
      currentWeek = newWeek;
      console.log(📅 Week changed to: ${newWeek});
      await loadAllWeekContent(newWeek);
    } else {
      console.warn("⚠️ Invalid week selection:", weekSelect.value);
    }
  });
}

// --- Combined Content Loader ---
async function loadAllWeekContent(week) {
  console.log📂 Loading all content for week ${week}...`);

  // Commentary
  try {
    await loadCommentary(week);
  } catch (err) {
    console.warn(❌ Commentary failed for week ${week}:, err);
  }

  // Cards
  try {
    const res = await fetch(weeks/week${week}.json);
    if (!res.ok) throw new Error(HTTP ${res.status});
    const data = await res.json();

    const mainStage = document.getElementById("mainStage");
    if (!mainStage) return;

    mainStage.innerHTML += `
      <div class="cards-section fade-slide">
        ${data.cards ? data.cards.map(c => <div class="card">${c.text}</div>).join("") : ""}
      </div>
    `;
    console.log🎴 Week ${week} cards loaded:`, data.cards || []);
  } catch (err) {
    console.warn(⚠️ Cards failed for week ${week}:, err);
  }

  // Video
  if (window.loadWeekVideo) {
    try {
      await loadWeekVideo(week);
      console.log🎥 Video loaded for week ${week}`);
    } catch (err) {
      console.warn(⚠️ Video failed for week ${week}:, err);
    }
  }

  console.log(✅ All content loaded for week ${week});
}

// --- Start ---
mainStageLoader();