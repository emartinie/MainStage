"use strict";

/* ========= CONFIG ========= */
const START_DATE = new Date("2024-10-26T00:00:00Z");
const TOTAL_WEEKS = 52;

/* ========= DOM HELPERS ========= */
const $ = (id) => {
  const el = document.getElementById(id);
  if (!el) console.warn(`⚠️ Missing element #${id}`);
  return el;
};

const els = {
  weekSelect: $("#weekSelect"),
  prevBtn: $("#prevWeek"),
  nextBtn: $("#nextWeek"),
  weekInfo: $("#weekInfo"),
  cards: $("#cardsContainer"),

  mainTitle: $("#mainStageTitle"),
  mainSub: $("#mainStageSub"),
  playlist: $("#mainStagePlaylist"),
  chapters: $("#mainStageChapters"),
  videoWrapper: $("#mainStageVideo"),
};

const state = {
  currentWeek: null,
  data: null,
};

/* ========= UTIL ========= */
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function getCurrentWeekNumber() {
  const diffMs = Date.now() - START_DATE.getTime();
  if (diffMs < 0) return 1;
  const wk = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)) + 5; // keep your offset
  return clamp(wk, 1, TOTAL_WEEKS);
}

/* ========= WEEK SELECT ========= */
function populateWeekSelect() {
  const sel = els.weekSelect;
  if (!sel) return;

  sel.innerHTML = "";
  for (let i = 1; i <= TOTAL_WEEKS; i++) {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `Week ${i}`;
    sel.appendChild(opt);
  }
  sel.value = String(getCurrentWeekNumber());
}

/* ========= RENDER: MAIN STAGE ========= */
function ensureHeroAudio() {
  let audio = document.getElementById("heroAudio");
  if (!audio) {
    audio = document.createElement("audio");
    audio.id = "heroAudio";
    audio.controls = true;
    audio.className = "w-full mb-3";
    // insert just above the playlist if we can, otherwise at end of card
    const card = document.getElementById("mainStageCard");
    if (card) {
      if (els.playlist) {
        card.insertBefore(audio, els.playlist);
      } else {
        card.appendChild(audio);
      }
    }
  }
  return audio;
}

function setNowPlaying(label) {
  let np = document.getElementById("nowPlaying");
  if (!np) {
    np = document.createElement("div");
    np.id = "nowPlaying";
    np.className = "text-sm text-gray-500 dark:text-gray-400 mb-1";
    if (els.mainSub && els.mainSub.parentNode) {
      els.mainSub.parentNode.insertBefore(np, els.mainSub.nextSibling);
    }
  }
  np.textContent = label ? `Now playing: ${label}` : "";
}

function highlightActive(btn, container) {
  if (!container) return;
  container.querySelectorAll("button[data-src]").forEach(b => {
    b.classList.remove("ring-2", "ring-blue-500");
  });
  if (btn) btn.classList.add("ring-2", "ring-blue-500");
}

function renderOutlinesFor(label, outlinesObj, chaptersEl) {
  if (!chaptersEl) return;
  chaptersEl.innerHTML = "";
  const arr = outlinesObj?.[label] || [];
  if (!Array.isArray(arr) || arr.length === 0) {
    chaptersEl.textContent = "No entries";
    return;
  }
  arr.forEach(line => {
    const p = document.createElement("p");
    p.textContent = line;
    chaptersEl.appendChild(p);
  });
}

function renderMainStage(data) {
  // Header
  if (els.mainTitle) {
    els.mainTitle.textContent = data.title || `Week ${data.week ?? state.currentWeek ?? ""}`;
  }
  if (els.mainSub) {
    const sub = [data.english, data.hebrew, data.transliteration].filter(Boolean).join(" / ");
    els.mainSub.textContent = sub || "";
  }

  // Language tabs (only tweak the sub-line)
  document.querySelectorAll(".langTab").forEach(tab => {
    tab.addEventListener("click", () => {
      const lang = tab.dataset.lang;
      if (els.mainSub) {
        if (data[lang]) els.mainSub.textContent = data[lang];
        else els.mainSub.textContent = [data.english, data.hebrew, data.transliteration].filter(Boolean).join(" / ");
      }
    }, { passive: true });
  });

  // One hero audio
  const audio = ensureHeroAudio();

  // Playlist buttons
  if (els.playlist) {
    els.playlist.innerHTML = "";
    const tracks = data.sections?.audio_playlist || [];
    tracks.forEach((t, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.src = t.src || "";
      btn.className = "w-full text-left px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600";
      btn.textContent = t.label || `Track ${idx + 1}`;

      btn.addEventListener("click", () => {
        if (!btn.dataset.src) return;
        if (audio.src !== btn.dataset.src) audio.src = btn.dataset.src;
        audio.play().catch(e => console.warn("Audio play failed:", e));
        setNowPlaying(t.label || "");
        highlightActive(btn, els.playlist);
        renderOutlinesFor(t.label, data.sections?.chapter_outlines, els.chapters);
      }, { passive: true });

      els.playlist.appendChild(btn);

      // Autoselect first
      if (idx === 0 && t.src) {
        audio.src = t.src;
        setNowPlaying(t.label || "");
        highlightActive(btn, els.playlist);
        renderOutlinesFor(t.label, data.sections?.chapter_outlines, els.chapters);
      }
    });
  }

  // Video (optional)
  if (els.videoWrapper) {
    const iframe = els.videoWrapper.querySelector("iframe");
    if (data.video) {
      els.videoWrapper.classList.remove("hidden");
      if (iframe) {
        iframe.src = data.video.includes("watch?v=")
          ? data.video.replace("watch?v=", "embed/")
          : data.video;
      }
    } else {
      els.videoWrapper.classList.add("hidden");
      if (iframe) iframe.src = "";
    }
  }
}

/* ========= SIMPLE SECONDARY CARDS (MVP) ========= */
function createCard(title, html) {
  const card = document.createElement("section");
  card.className = "border rounded-2xl shadow-lg bg-white dark:bg-gray-800 p-4";
  const h = document.createElement("h2");
  h.className = "text-xl font-bold mb-2";
  h.textContent = title;
  const body = document.createElement("div");
  body.innerHTML = html;
  card.appendChild(h);
  card.appendChild(body);
  return card;
}

function renderSecondary(data) {
  if (!els.cards) return;
  els.cards.innerHTML = "";

  if (data.sections?.commentary) {
    const c = data.sections.commentary;
    const html = `
      ${c.quote ? `<p class="italic mb-2">${c.quote}</p>` : ""}
      ${c.content ? `<p>${c.content}</p>` : ""}
    `;
    els.cards.appendChild(createCard("Commentary", html));
  }

  if (data.sections?.deeper_learning) {
    els.cards.appendChild(createCard("Deeper Learning", `<p>${data.sections.deeper_learning}</p>`));
  }

  // leave the rest for later to keep the MVP tight & stable
}

/* ========= LOAD WEEK ========= */
async function loadWeek(week = getCurrentWeekNumber()) {
  try {
    // keep dropdown & label in sync immediately
    if (els.weekSelect) els.weekSelect.value = String(week);
    if (els.weekInfo) els.weekInfo.textContent = `Loading week ${week}…`;

    const res = await fetch(`data/week${week}.json?ts=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    state.currentWeek = week;
    state.data = data;

    if (els.weekInfo) {
      const titleLine =
        `Week ${data.week ?? week}: ` +
        [data.english, data.hebrew].filter(Boolean).join(" / ");
      els.weekInfo.textContent = titleLine;
    }

    renderMainStage(data);
    renderSecondary(data);
  } catch (err) {
    console.error("Error loading week:", err);
    if (els.weekInfo) els.weekInfo.textContent = `Error loading week ${week}`;
  }
}

/* ========= NAV ========= */
function wireNav() {
  els.weekSelect?.addEventListener("change", () => {
    const w = parseInt(els.weekSelect.value, 10) || 1;
    loadWeek(clamp(w, 1, TOTAL_WEEKS));
  });

  els.prevBtn?.addEventListener("click", () => {
    const w = (parseInt(els.weekSelect?.value, 10) || getCurrentWeekNumber()) - 1;
    loadWeek(clamp(w, 1, TOTAL_WEEKS));
  }, { passive: true });

  els.nextBtn?.addEventListener("click", () => {
    const w = (parseInt(els.weekSelect?.value, 10) || getCurrentWeekNumber()) + 1;
    loadWeek(clamp(w, 1, TOTAL_WEEKS));
  }, { passive: true });
}

/* ========= INIT ========= */
document.addEventListener("DOMContentLoaded", () => {
  populateWeekSelect();
  wireNav();
  loadWeek(); // default to current
});
