// --- Load Week ---
async function loadWeek(weekNum) {
    try {
        const res = await fetch(`data/week${weekNum}.json`);
        if (!res.ok) throw new Error("Failed to fetch week data");
        const data = await res.json();
        await loadMainStageWeek(data);
        renderWeekCards(data);
    } catch (err) {
        console.error("Error loading week:", err);
    }
}

// --- Example Loader in mainWeekLoader.js ---
function loadCalendarCard(weekData) {
  const nextHolyDayEl = document.getElementById("nextHolyDay");
  const daysToPrepareEl = document.getElementById("daysToPrepare");
  const locationHintEl = document.getElementById("locationHint");

  // Use main calendar as the source
  const mainCalendar = weekData.calendar || {};
  const nextHolyDay = mainCalendar.nextHolyDay || { name: "N/A", date: null, location: "" };
  
  nextHolyDayEl.textContent = `{nextHolyDay.name} — ${nextHolyDay.date || "TBD"}`;

  if (nextHolyDay.date) {
    const today = new Date();
    const holyDate = new Date(nextHolyDay.date);
    const diffDays = Math.ceil((holyDate - today) / (1000 * 60 * 60 * 24));
    daysToPrepareEl.textContent = `DaysToPrepare : ${diffDays}`;
  } else {
    daysToPrepareEl.textContent = "";
  }

  locationHintEl.textContent = `nextHolyDay.location ? Suggested location: ${nextHolyDay.location} : ""`;
  
  // Add optional mini-calendar rendering logic here
  renderMiniCalendar(mainCalendar);
}

// Dummy mini-calendar render (expand later)
function renderMiniCalendar(calendar) {
  const miniCal = document.getElementById("miniCalendar");
  miniCal.textContent = "Mini calendar will render here…";
}

// Initialize after main week loader finishes
loadCalendarCard(window.weekData);

// --- Init ---
function init() {
    cacheDOM();
    populateWeekSelect();
    loadWeek(weekSelect.value);

    prevBtn.addEventListener("click", () => {
        let val = parseInt(weekSelect.value, 10);
        if (val > 1) weekSelect.value = val - 1;
        loadWeek(weekSelect.value);
    });

    nextBtn.addEventListener("click", () => {
        let val = parseInt(weekSelect.value, 10);
        if (val < TOTAL_WEEKS) weekSelect.value = val + 1;
        loadWeek(weekSelect.value);
    });

    weekSelect.addEventListener("change", () => loadWeek(weekSelect.value));
