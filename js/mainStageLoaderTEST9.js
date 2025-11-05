// --- Fresh MainLoader ---  
const START_DATE = new Date("2024-10-19T00:00:00Z");  
const TOTAL_WEEKS = 52;  

// DOM references  
const weekSelect = document.getElementById("weekSelect");  
const mainStage = document.getElementById("mainStage");  
const mainStageTitle = document.getElementById("mainStageTitle");  
const mainStageSub = document.getElementById("Sub");  
const mainStagePlaylist = document.getElementById("Playlist");  
const mainStageChapters = document.getElementById("Chapters");  
const cardsContainer = document.getElementById("cardsContainer");  

// --- Utility Functions ---  
function calculateCurrentWeek() {  
  const now = new Date();  
  const diffMs = now - START_DATE;  
  const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));  
  return Math.min(Math.max(diffWeeks + 1, 1), TOTAL_WEEKS);  
}  

function populateWeekSelect(currentWeek) {  
  weekSelect.innerHTML = "";  
  for (let i = 1; i <= TOTAL_WEEKS; i++) {  
    const option = document.createElement("option");  
    option.value = i;  
    option.textContent = `Week ${i}`;  
    if (i === currentWeek) option.selected = true;  
    weekSelect.appendChild(option);  
  }  
}  

// --- Loaders ---  
async function loadWeekContent(week) {  
  console.log(`📂 Loading content for week ${week}...`);  

  // Commentary  
  try {  
    const commentaryRes = await fetch(`commentary/week${week}.html`);  
    mainStage.innerHTML = await commentaryRes.text();  
    console.log(`✅ Commentary for week ${week} loaded.`);  
  } catch (err) {  
    console.warn(`Failed to load commentary for week ${week}:`, err);  
    mainStage.innerHTML = "<p>Commentary not found.</p>";  
  }  

  // Playlist  
  try {  
    const playlistRes = await fetch(`playlist/week${week}.html`);  
    mainStagePlaylist.innerHTML = await playlistRes.text();  
  } catch (err) {  
    mainStagePlaylist.innerHTML = "";  
  }  

  // Chapters  
  try {  
    const chaptersRes = await fetch(`chapters/week${week}.html`);  
    mainStageChapters.innerHTML = await chaptersRes.text();  
  } catch (err) {  
    mainStageChapters.innerHTML = "";  
  }  

  // Cards (questions, etc.)  
  try {  
    const cardsRes = await fetch(`cards/week${week}.html`);  
    cardsContainer.innerHTML = await cardsRes.text();  
    console.log(`🎴 Week ${week} cards loaded.`);  
  } catch (err) {  
    cardsContainer.innerHTML = "";  
  }  
}  

// --- Initialization ---  
function initLoader() {  
  const currentWeek = calculateCurrentWeek();  
  populateWeekSelect(currentWeek);  
  loadWeekContent(currentWeek);  

  weekSelect.addEventListener("change", () => {  
    const selectedWeek = parseInt(weekSelect.value);  
    console.log(`📅 Week updated to: ${selectedWeek}`);  
    loadWeekContent(selectedWeek);  
  });  
}  

document.addEventListener("DOMContentLoaded", initLoader);  