// --- Config ---
const START_DATE = new Date("2024-10-19T00:00:00Z");
const TOTAL_WEEKS = 52;

// --- Helper: Current Week ---
function getCurrentWeekNumber() {
    const now = new Date();
    const diffMs = now - START_DATE;
    if (diffMs < 0) return 1;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)) % TOTAL_WEEKS + 1;
}

// --- DOM Elements ---
let weekSelect, weekInfo, prevBtn, nextBtn, cardsContainer;
let mainStageTitle, mainStageSub, mainStagePlaylist, mainStageChapters, mainStageVideo, mainStageIframe;

// --- Initialize DOM Elements ---
function cacheDOM() {
    weekSelect = document.getElementById("weekSelect");
    weekInfo = document.getElementById("weekInfo");
    prevBtn = document.getElementById("prevWeek");
    nextBtn = document.getElementById("nextWeek");
    cardsContainer = document.getElementById("cardsContainer");

    mainStageTitle = document.getElementById("mainStageTitle");
    mainStageSub = document.getElementById("mainStageSub");
    mainStagePlaylist = document.getElementById("mainStagePlaylist");
    mainStageChapters = document.getElementById("mainStageChapters");
    mainStageVideo = document.getElementById("mainStageVideo");
    mainStageIframe = mainStageVideo ? mainStageVideo.querySelector("iframe") : null;
}

if (!window.globalAudio) window.globalAudio = new Audio();
const audio = window.globalAudio;

// --- Populate week select ---
function populateWeekSelect() {
    weekSelect.innerHTML = "";
    for (let i = 1; i <= TOTAL_WEEKS; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = Week ${i};
        weekSelect.appendChild(opt);
    }
    weekSelect.value = getCurrentWeekNumber();
}

// --- Parse scripture from filename ---
function parseScriptureFromFilename(filename) {
    const bookNames = [
        "Genesis","Exodus","Leviticus","Numbers","Deuteronomy",
        "Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings",
        "2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah",
        "Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
        "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea",
        "Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk",
        "Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark",
        "Luke","John","Acts","Romans","1 Corinthians","2 Corinthians",
        "Galatians","Ephesians","Philippians","Colossians","1 Thessalonians",
        "2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews",
        "James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"
    ];

    const match = filename.match(/(\d{2})(\d{3})(\d{3})-(\d{2})(\d{3})(\d{3})/);
    if (!match) return filename;

    const startBookNum = parseInt(match[1], 10);
    const startChapter = parseInt(match[2], 10);
    const startVerse = parseInt(match[3], 10);
    const endBookNum = parseInt(match[4], 10);
    const endChapter = parseInt(match[5], 10);
    const endVerse = parseInt(match[6], 10);

    const startBookName = bookNames[startBookNum-1] || Book ${startBookNum};
    const endBookName = bookNames[endBookNum-1] || Book ${endBookNum};

    if (startBookNum === endBookNum) {
        return ${startBookName} ${startChapter}:${startVerse}-${endChapter}:${endVerse};
    } else {
        return ${startBookName} ${startChapter}:${startVerse} - ${endBookName} ${endChapter}:${endVerse};
    }
}

// --- Generic collapsible card ---
function createCard(title, contentHTML) {
    const card = document.createElement("section");
    card.className = "card border rounded-2xl shadow-lg bg-white dark:bg-gray-800 p-4 transition transform hover:scale-[1.02] hover:shadow-2xl duration-300";

    const header = document.createElement("h2");
    header.className = "text-xl font-bold mb-2 cursor-pointer flex justify-between items-center";
    header.innerHTML = ${title} <span class="text-gray-400">▼</span>;

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

// --- Recursive JSON renderer ---
function renderObject(key, value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number") return <p>${value}</p>;
    if (Array.isArray(value)) return value.map(item => renderObject(key, item)).join("");
    if (typeof value === "object") {
        return Object.keys(value).map(k => <div class="mb-2"><strong>${k}:</strong> ${renderObject(k, value[k])}</div>).join("");
    }
    return "";
}

// --- Render cards for a week ---
function renderWeekCards(data) {
    if (!cardsContainer) return;
    cardsContainer.innerHTML = "";

    Object.keys(data).forEach(key => {
        if (["week","english","hebrew","transliteration","title","sections","video"].includes(key)) return;
        cardsContainer.appendChild(createCard(key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()), renderObject(key, data[key])));
    });

    if (data.sections) {
        Object.keys(data.sections).forEach(sec => {
            if (["audio_playlist","chapter_outlines"].includes(sec)) return;
            cardsContainer.appendChild(createCard(sec.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()), renderObject(sec, data.sections[sec])));
        });
    }
}

// --- MainStage Renderer ---
async function loadMainStageWeek(weekData) {
    if (!weekData) return;

    mainStageTitle.textContent = weekData.title || Week ${weekData.week};
    mainStageSub.textContent = ${weekData.english || ''} / ${weekData.hebrew || ''} / ${weekData.transliteration || ''};

    // --- Playlist ---
    mainStagePlaylist.innerHTML = '';
    const playlist = weekData.sections?.audio_playlist || [];

    const fpPlaylist = playlist.map(item => ({
        title: item.label || item.title || item.name || "Untitled",
        eng: item.eng || item.src || "",
        heb: item.heb || item.src || "",
        grk: item.grk || item.src || "",
        src: item.src || item.eng || item.heb || item.grk || ""
    }));

    window.dispatchEvent(new CustomEvent("player:updatePlaylist", { detail: { playlist: fpPlaylist } }));
    window.mainPlaylist = fpPlaylist;

    playlist.forEach(track => {
        const card = document.createElement('div');
        card.className = "p-2 border rounded shadow-sm bg-gray-100 dark:bg-gray-700 flex items-center justify-between mb-2";

        const playBtn = document.createElement('button');
        playBtn.className = "px-2 py-1 bg-blue-600 dark:bg-blue-400 text-white rounded mr-2";
        playBtn.textContent = "▶";

        const label = document.createElement('span');
        label.className = "font-medium text-gray-800 dark:text-gray-200";
        label.textContent = track.label;

        const scriptureText = parseScriptureFromFilename(track.src);
        const scriptureSpan = document.createElement('span');
        scriptureSpan.className = "ml-2 text-sm text-blue-600 dark:text-blue-400 underline cursor-pointer";
        scriptureSpan.textContent = scriptureText;
        scriptureSpan.addEventListener('click', () => window.open(track.src, '_blank'));

        playBtn.addEventListener('click', () => {
            audio.src = track.src;
            audio.play().catch(err => console.warn("Autoplay prevented:", err));
            const nowPlayingLabel = document.getElementById("nowPlaying");
            if(nowPlayingLabel) nowPlayingLabel.textContent = Now Playing: ${track.label} — ${scriptureText};
        });

        card.appendChild(playBtn);
        card.appendChild(label);
        card.appendChild(scriptureSpan);
        mainStagePlaylist.appendChild(card);
    });

    if (playlist.length > 0) {
        audio.src = playlist[0