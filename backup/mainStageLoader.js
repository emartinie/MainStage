// --- Config ---
const START_DATE = new Date("2024-10-26T00:00:00Z");
const TOTAL_WEEKS = 52;

// --- DOM Elements ---
const weekSelect = document.getElementById("weekSelect");
const weekInfo = document.getElementById("weekInfo");
const prevBtn = document.getElementById("prevWeek");
const nextBtn = document.getElementById("nextWeek");
const cardsContainer = document.getElementById("cardsContainer");

const mainStageTitle = document.getElementById("mainStageTitle");
const mainStageSub = document.getElementById("mainStageSub");
const mainStagePlaylist = document.getElementById("mainStagePlaylist");
const mainStageChapters = document.getElementById("mainStageChapters");
const mainStageVideo = document.getElementById("mainStageVideo");
const mainStageIframe = mainStageVideo.querySelector("iframe");

// --- Helper: Current Week ---
function getCurrentWeekNumber() {
    const diffMs = new Date() - START_DATE;
    if (diffMs < 0) return 1;
    const week = Math.floor(diffMs / (1000*60*60*24*7)) + 1;
    return week > TOTAL_WEEKS ? TOTAL_WEEKS : week;
}

// --- Populate week select ---
function populateWeekSelect() {
    weekSelect.innerHTML = "";
    for (let i = 1; i <= TOTAL_WEEKS; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = `Week ${i}`;
        weekSelect.appendChild(opt);
    }
    weekSelect.value = getCurrentWeekNumber();
}

// --- Create generic collapsible card ---
function createCard(title, contentHTML) {
    const card = document.createElement("section");
    card.className = "border rounded-2xl shadow-lg bg-white dark:bg-gray-800 p-4 transition transform hover:scale-[1.02] hover:shadow-2xl duration-300";

    const header = document.createElement("h2");
    header.className = "text-xl font-bold mb-2 cursor-pointer flex justify-between items-center";
    header.innerHTML = `${title} <span class="text-gray-400">▼</span>`;

    const content = document.createElement("div");
    content.className = "collapse-content max-h-0 overflow-hidden transition-all duration-500";
    content.innerHTML = contentHTML;

    header.addEventListener("click", () => {
        const open = content.classList.contains("max-h-0");
        content.classList.toggle("max-h-0", !open);
        content.classList.toggle("max-h-screen", open);
        header.querySelector("span").textContent = open ? "▲" : "▼";
    });

    card.appendChild(header);
    card.appendChild(content);
    return card;
}

// --- Render main stage ---
function renderMainStage(data) {
    mainStageTitle.textContent = data.title || `Week ${data.week}`;
    mainStageSub.textContent = `${data.english || ''} / ${data.hebrew || ''} / ${data.transliteration || ''}`;

    // Playlist
    mainStagePlaylist.innerHTML = '';
    (data.sections?.audio_playlist || []).forEach(track => {
        const div = document.createElement("div");
        div.className = "p-2 border rounded shadow-sm bg-gray-100 dark:bg-gray-700 flex items-center justify-between";
        const label = document.createElement("span");
        label.textContent = track.label;
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.src = track.src;
        audio.className = "w-full ml-2";
        div.appendChild(label);
        div.appendChild(audio);
        mainStagePlaylist.appendChild(div);
    });

    // Chapter outlines
    mainStageChapters.innerHTML = '';
    const outlines = data.sections?.chapter_outlines || {};
    Object.keys(outlines).forEach(section => {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${section}</strong>: ${outlines[section].join(', ') || 'No entries'}`;
        mainStageChapters.appendChild(div);
    });

    // Video
    if (data.video) {
        mainStageVideo.classList.remove("hidden");
        mainStageIframe.src = data.video.replace("watch?v=", "embed/");
    } else {
        mainStageVideo.classList.add("hidden");
    }
}

// --- Recursive JSON renderer for other cards ---
function renderObject(key, value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number") return `<p>${value}</p>`;
    if (Array.isArray(value)) return value.map(item => renderObject(key, item)).join("");
    if (typeof value === "object") {
        return Object.keys(value).map(k => {
            return `<div class="mb-2"><strong>${k}:</strong> ${renderObject(k, value[k])}</div>`;
        }).join("");
    }
    return "";
}

function renderWeekCards(data) {
    cardsContainer.innerHTML = "";
    Object.keys(data).forEach(key => {
        if (["week","english","hebrew","transliteration","title","sections","video"].includes(key)) return;

        const contentHTML = renderObject(key, data[key]);
        cardsContainer.appendChild(createCard(key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()), contentHTML));
    });

    // Render sections not part of main stage
    if (data.sections) {
        Object.keys(data.sections).forEach(sec => {
            if (sec === "audio_playlist" || sec === "chapter_outlines") return; // skip main stage
            const sectionHTML = renderObject(sec, data.sections[sec]);
            cardsContainer.appendChild(createCard(sec.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()), sectionHTML));
        });
    }
}

// --- Load week JSON ---
async function loadWeek(week = getCurrentWeekNumber()) {
    try {
        weekSelect.value = week;
        const res = await fetch(`data/week${week}.json`);
        if (!res.ok) throw new Error("Week JSON not found");
        const data = await res.json();

        // Update main stage
        renderMainStage(data);
        // Render other cards
        renderWeekCards(data);

        weekInfo.textContent = `Week ${data.week}: ${data.english || ''}${data.hebrew ? ' / '+data.hebrew : ''}`;
    } catch(err) {
        console.error("Error loading week:", err);
    }
}

// --- Navigation ---
weekSelect.addEventListener("change", ()=>loadWeek(parseInt(weekSelect.value)));
prevBtn.addEventListener("click", ()=>loadWeek(Math.max(1,parseInt(weekSelect.value)-1)));
nextBtn.addEventListener("click", ()=>loadWeek(Math.min(TOTAL_WEEKS,parseInt(weekSelect.value)+1)));

// --- Initialize ---
populateWeekSelect();
loadWeek();
