console.log("📖 StudyContentManager initialized");

// CONFIG — Single source of truth
const STUDY_CONFIG = {
  containerId: "studyContent",
  innerId: "contentInner",
  paginationId: "paginationControls",
  paragraphsPerPage: 10,
  toggleBtnId: "toggleStudyBtn"
};

// STATE
let currentPage = 0;
let totalPages = 0;
let currentType = null;     // "commentary" or "article"
let allParagraphs = [];
let currentSource = null;

// DOM REFERENCES
const container = document.getElementById(STUDY_CONFIG.containerId);
const inner = document.getElementById(STUDY_CONFIG.innerId);
const pagination = document.getElementById(STUDY_CONFIG.paginationId);
const toggleBtn = document.getElementById(STUDY_CONFIG.toggleBtnId);

// ---------- TOGGLE VISIBILITY ----------
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    container?.classList.toggle("hidden");
    container?.classList.toggle("opacity-0");
    container?.classList.toggle("scale-95");
  });
}

// ---------- PUBLIC LOAD FUNCTION ----------
async function loadStudyContent(type, source) {
  console.log(`🪶 Loading ${type} from: ${source}`);

  currentType = type;
  currentSource = source;
  currentPage = 0;
  allParagraphs = [];

  try {
    const res = await fetch(source);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    parseAndPaginate(html);

    container?.classList.remove("hidden", "opacity-0", "scale-95");

  } catch (err) {
    console.error("❌ Error loading content:", err);
    inner.innerHTML = "<p>Error loading content. Please try again later.</p>";
    pagination.innerHTML = "";
  }
}

// ---------- PARSE + PAGINATE ----------
function parseAndPaginate(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // We keep the same element types as before
  allParagraphs = Array.from(temp.querySelectorAll("p, h2, h3, h4, li"));

  totalPages = Math.ceil(allParagraphs.length / STUDY_CONFIG.paragraphsPerPage);

  renderPage(0);
}

// ---------- RENDER ONE PAGE ----------
function renderPage(page) {
  currentPage = page;

  const start = page * STUDY_CONFIG.paragraphsPerPage;
  const end = start + STUDY_CONFIG.paragraphsPerPage;

  const slice = allParagraphs.slice(start, end);
  inner.innerHTML = slice.map(el => el.outerHTML).join("");

  renderPaginationControls();
}

// ---------- PAGINATION ----------
function renderPaginationControls() {
  if (!pagination) return;

  pagination.innerHTML = `
    <button id="prevPage" ${currentPage === 0 ? "disabled" : ""}>⟵</button>
    <span>Page ${currentPage + 1} of ${totalPages}</span>
    <button id="nextPage" ${currentPage === totalPages - 1 ? "disabled" : ""}>⟶</button>
  `;

  document.getElementById("prevPage")?.addEventListener("click", () => {
    if (currentPage > 0) renderPage(currentPage - 1);
  });

  document.getElementById("nextPage")?.addEventListener("click", () => {
    if (currentPage < totalPages - 1) renderPage(currentPage + 1);
  });
}

// ---------- LISTENER FOR WEEK CHANGES ----------
document.addEventListener("weekChanged", e => {
  const week = e.detail?.week || 1;
  console.log("📆 Week changed → Load commentary:", week);

  loadStudyContent("commentary", `commentary/week${week}.html`);
});

console.log("✅ StudyContentManager ready");