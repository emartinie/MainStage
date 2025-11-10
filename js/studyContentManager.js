console.log("📖 StudyContentManager initialized");

const STUDY_CONFIG = {
  containerId: "studyContent",
  innerId: "contentInner",
  paginationId: "paginationControls",
  paragraphsPerPage: 3,
};

let currentPage = 0;
let totalPages = 0;
let currentType = null;
let allParagraphs = [];
let currentSource = "";

const container = document.getElementById(STUDY_CONFIG.containerId);
const inner = document.getElementById(STUDY_CONFIG.innerId);
const pagination = document.getElementById(STUDY_CONFIG.paginationId);

// --- Load Content by Type ---
async function loadStudyContent(type, source) {
  console.log(`🪶 Loading ${type} from:, source`);
  currentType = type;
  currentSource = source;
  currentPage = 0;

  try {
    if (type === "commentary" || type === "article") {
      const res = await fetch(source);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      parseAndPaginate(html);
    } else if (type === "iframe") {
      showHTML(`<iframe src="${source}" frameborder="0" width="100%" height="400"></iframe>`);
    } else if (type === "video") {
      showHTML(`<video controls width="100%"><source src="${source}" type="video/mp4"></video>`);
    } else {
      console.warn(`Unknown content type: ${type}`);
    }
  } catch (err) {
    console.error("❌ Error loading content:", err);
    showHTML("<p>Error loading content. Please try again later.</p>");
  }
}

// --- Pagination ---
function parseAndPaginate(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html;

  allParagraphs = Array.from(temp.querySelectorAll("p, h2, h3, h4, li"));
  totalPages = Math.ceil(allParagraphs.length / STUDY_CONFIG.paragraphsPerPage);

  renderPage(0);
}

function renderPage(page) {
  const start = page * STUDY_CONFIG.paragraphsPerPage;
  const end = start + STUDY_CONFIG.paragraphsPerPage;

  const slice = allParagraphs.slice(start, end);
  inner.innerHTML = slice.map(el => el.outerHTML).join("");

  renderPaginationControls();
}

function renderPaginationControls() {
  pagination.innerHTML = `
    <button id="prevPage" ${currentPage === 0 ? "disabled" : ""}>⟵</button>
    <span>Page ${currentPage + 1} of ${totalPages}</span>
    <button id="nextPage" ${currentPage === totalPages - 1 ? "disabled" : ""}>⟶</button>
  `;

  document.getElementById("prevPage")?.addEventListener("click", () => {
    if (currentPage > 0) {
      currentPage--;
      renderPage(currentPage);
    }
  });

  document.getElementById("nextPage")?.addEventListener("click", () => {
    if (currentPage < totalPages - 1) {
      currentPage++;
      renderPage(currentPage);
    }
  });
}

// --- Core Display ---
function showHTML(html) {
  inner.innerHTML = html;
  pagination.innerHTML = "";
  container.classList.remove("hidden");
  container.classList.remove("opacity-0", "scale-95");
  container.classList.add("opacity-100", "scale-100");
}

// --- Toggle Buttons ---
document.getElementById("toggleStudyBtn")?.addEventListener("click", () => {
  toggleStudyContent();
});

document.getElementById("toggleArticlesBtn")?.addEventListener("click", () => {
  toggleStudyContent();
});

function toggleStudyContent() {
  const isHidden = container.classList.toggle("hidden");
  container.classList.toggle("opacity-0", isHidden);
  container.classList.toggle("scale-95", isHidden);
  container.classList.toggle("opacity-100", !isHidden);
  container.classList.toggle("scale-100", !isHidden);
}

// --- Week Changed (for commentary) ---
document.addEventListener("weekChanged", (e) => {
  const week = e.detail?.week || 1;
  console.log("📅 Week changed:", week);
  loadStudyContent("commentary", `commentary/week${week}.html`);
});

// --- Expose global functions ---
window.loadStudyContent = loadStudyContent;
window.toggleStudyContent = toggleStudyContent;

console.log("✅ StudyContentManager ready");