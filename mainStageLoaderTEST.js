// --- Config ---
const START_DATE = new Date("2024-10-26T00:00:00Z");
const TOTAL_WEEKS = 52;

// --- DOM Elements ---
const weekSelect = document.getElementById("weekSelect");
const prevBtn = document.getElementById("prevWeek");
const nextBtn = document.getElementById("nextWeek");
const mainStageTitle = document.getElementById("mainStageTitle");
const mainStageSub = document.getElementById("mainStageSub");
const mainStagePlaylist = document.getElementById("mainStagePlaylist");
const mainStageChapters = document.getElementById("mainStageChapters");
const mainStageVideo = document.getElementById("mainStageVideo");
const mainStageVideoFrame = mainStageVideo.querySelector("iframe");
const cardsContainer = document.getElementById("cardsContainer");

// --- Helpers ---
function getCurrentWeekNumber() {
  const today = new Date();
  const diffMs = today - START_DATE;
  if(diffMs < 0) return 1;
  const week = Math.floor(diffMs / (1000*60*60*24*7)) + 1;
  return week > TOTAL_WEEKS ? TOTAL_WEEKS : week;
}

function populateWeekSelect() {
  weekSelect.innerHTML = "";
  for(let i=1; i<=TOTAL_WEEKS; i++){
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `Week ${i}`;
    weekSelect.appendChild(opt);
  }
  weekSelect.value = getCurrentWeekNumber();
}

// --- Create card ---
function createCard(title, contentHTML) {
  const card = document.createElement("section");
  card.className = "border rounded-2xl shadow-lg bg-white dark:bg-gray-800 p-4";
  const header = document.createElement("h2");
  header.className = "text-xl font-bold mb-2 cursor-pointer text-gray-900 dark:text-gray-200";
  header.textContent = title;
  const content = document.createElement("div");
  content.innerHTML = contentHTML;
  card.appendChild(header);
  card.appendChild(content);
  return card;
}

// --- Load Main Stage ---
function loadMainStage(weekData) {
  mainStageTitle.textContent = `Week ${weekData.week}: ${weekData.title || 'Untitled'}`;
  mainStageSub.textContent = `${weekData.english || ''} / ${weekData.hebrew || ''} / ${weekData.transliteration || ''}`;

  // Playlist
  mainStagePlaylist.innerHTML = '';
  const playlist = weekData.sections?.audio_playlist || [];
  playlist.forEach(track => {
    const div = document.createElement("div");
    div.className = "p-2 border rounded shadow-sm bg-gray-100 dark:bg-gray-700";
    div.innerHTML = `<p>${track.label}</p><audio controls src="${track.src}" class="w-full"></audio>`;
    mainStagePlaylist.appendChild(div);
  });

  // Chapters
  mainStageChapters.innerHTML = '';
  const outlines = weekData.sections?.chapter_outlines || {};
  Object.keys(outlines).forEach(section => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${section}:</strong> ${outlines[section].join(', ')}`;
    mainStageChapters.appendChild(div);
  });

  // Video
  if (weekData.video) {
    mainStageVideoFrame.src = weekData.video.replace("watch?v=", "embed/");
    mainStageVideo.classList.remove("hidden");
  } else {
    mainStageVideo.classList.add("hidden");
  }
}

// --- Render JSON sections recursively ---
function renderObject(key,value){
  if(value===null||value===undefined) return "";
  if(typeof value==="string"||typeof value==="number") return `<p>${value}</p>`;
  if(Array.isArray(value)) return value.map(item=>renderObject(key,item)).join("");
  if(typeof value==="object") return Object.keys(value).map(k=>`<div><strong>${k}:</strong> ${renderObject(k,value[k])}</div>`).join("");
  return "";
}

// --- Render Week ---
function renderWeek(data){
  cardsContainer.innerHTML = "";
  populateWeekSelect();
  weekSelect.value = data.week;

  loadMainStage(data);

  // Render all other sections
  Object.keys(data).forEach(key=>{
    if(["week","english","hebrew","transliteration","title","sections","video"].includes(key)) return;
    const html = renderObject(key,data[key]);
    cardsContainer.appendChild(createCard(key.replace(/_/g," "), html));
  });
}

// --- Load week JSON ---
async function loadWeek(week=getCurrentWeekNumber()){
  try{
    const res = await fetch(`data/week${week}.json`);
    if(!res.ok) throw new Error("Week JSON not found");
    const data = await res.json();
    renderWeek(data);
  }catch(err){
    console.error("Error loading week:",err);
  }
}

// --- Navigation ---
weekSelect.addEventListener("change",()=>loadWeek(parseInt(weekSelect.value)));
prevBtn.addEventListener("click",()=>loadWeek(Math.max(1,parseInt(weekSelect.value)-1)));
nextBtn.addEventListener("click",()=>loadWeek(Math.min(TOTAL_WEEKS,parseInt(weekSelect.value)+1)));

// --- Language tabs ---
document.querySelectorAll(".langTab").forEach(tab => {
  tab.addEventListener("click",()=>{
    const lang = tab.dataset.lang;
    const currentWeek = parseInt(weekSelect.value);
    fetch(`data/week${currentWeek}.json`).then(r=>r.json()).then(data=>{
      mainStageSub.textContent = data[lang] || '';
    });
  });
});

// --- Initialize ---
populateWeekSelect();
document.addEventListener("DOMContentLoaded", () => {
    loadWeek();
});
