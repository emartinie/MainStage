console.log("📖 StudyContentManager initialized");

// CONFIG
const STUDY_CONFIG = {
  containerId: "studyContent",
  innerId: "contentInner",
  paginationId: "paginationControls",
  paragraphsPerPage: 3,
};

let currentPage = 0;
let totalPages = 0;
let currentType = null; // 'commentary' or 'article'
let allParagraphs = [];
let currentSource = null;

// DOM
const container = document.getElementById(STUDY_CONFIG.containerId);
const inner = document.getElementById(STUDY_CONFIG.innerId);
const pagination = document.getElementById(STUDY_CONFIG.paginationId);
const toggleBtn = document.getElementById("toggleStudyBtn");

// --- Toggle Visibility ---
toggleBtn.addEventListener("click", () => {
  container.classList.toggle("hidden");
  container.classList.toggle("opacity-0");
  container.classList.toggle("scale-95");
});

// --- Load content ---
async function loadStudyContent(type, source) {
  console.log(`🪶 Loading ${type} from:`, source);
  currentType = type;
  currentSource = source;
  currentPage = 0;
  allParagraphs = [];

  try {
    const res = await fetch(source);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    parseAndPaginate(html);
    container.classList.remove("hidden");
    container.classList.remove("opacity-0");
    container.classList.remove("scale-95");
  } catch (err) {
    console.error("❌ Error loading content:", err);
    inner.innerHTML = "<p>Error loading content. Please try again later.</p>";
    pagination.innerHTML = "";
  }
}

// --- Parse and paginate ---
function parseAndPaginate(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  allParagraphs = Array.from(temp.querySelectorAll("p, h2, h3, h4, li"));
  totalPages = Math.ceil(allParagraphs.length / STUDY_CONFIG.paragraphsPerPage);
  renderPage(0);
}

function renderPage(page) {
  currentPage = page;
  const start = page * STUDY_CONFIG.paragraphsPerPage;
  const end = start + STUDY_CONFIG.paragraphsPerPage;
  const slice = allParagraphs.slice(start, end);
  inner.innerHTML = slice.map(el => el.outerHTML).join("");
  renderPaginationControls();
}

// --- Pagination controls ---
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

// --- WeekChanged listener ---
document.addEventListener("weekChanged", e => {
  const week = e.detail?.week || 1;
  loadStudyContent("commentary", `commentary/week${week}.html`);
});

const ARTICLE_FOLDER = "/articles/";
// --- Article list setup ---
const articles = [
  { title: "Almost There, but Not Quite", file: "almost_there_but_not_quite.html" },
  { title: "Walking in Love", file: "debating_arguing_discussing_and_disagreeing_midrash.html" },
  { title: "First Article", file: "first_blog_post_the_second_commandment_and_the_second_ammendment.html" },
  { title: "Fulfillment of Prophecy", file: "jesus_yeshua_fulfillment_of_prophecy.html" },
  { title: "Kingdom Mindedness", file: "kingdom_mindedness.html" },  
  { title: "LTBI24H- Chuck Missler", file: "learn_the_bible_in_24_hours.html" },
  { title: "Letter to a Friend", file: "letter_to_a_friend.html" },
  { title: "List of Sins", file: "list_of_sins.html" },
  { title: "Marriage", file: "marriage.html" }, 
  { title: "Misconceptions of ekklesia", file: "misconceptions_of_ekklesia.html" },
  { title: "Who is Q [for Christians]", file: "qanon_phenomenon_who_is_q_for_christians.html" }, 
  { title: "Relational Discipleship 101 Notes", file: "relational_discipleship_101_notes.html" },  
  { title: "The holidays- by Wendy Roberts", file: "sola_scriptura_the_holidays.html" },
  { title: "Study Tools", file: "study_tools.html" },
  { title: "Surrendering Anger- by By Wendy Roberts", file: "surrendering_anger.html" },
  { title: "Taking Our Country & Churches Back", file: "taking_our_churches_and_our_country_back.html" },
  { title: "The Hebrew Roots of Revelation", file: "the_book_of_revelation_hebrew_roots.html" },
  { title: "The Commandments of Jesus", file: "the_commandments_of_jesus.html" },
  { title: "The Hebrew Pages of the New Testament", file: "the_hebrew_pages_of_the_new_testament.html" },
  { title: "The Law is Dead?", file: "the_law_is_dead.html" },
  { title: "The Prodigal Son", file: "the_prodigal_son.html" },
  { title: "The Remnant", file: "the_remnant.html" },
  { title: "Torah Commandments- A List", file: "torah_commandments.html" },
  { title: "The Story", file: "the_story.html" },  
  { title: "Understanding Denominations for Unity Sake", file: "understanding_denominations.html" },
  { title: "Where Did the Sabbath Go?", file: "where_did_the_sabbath_go.html" },
  { title: "Who is Q for Christians?", file: "who_is_q_for_christians.html" },    
  // add more here as needed
];

const articleListDiv = document.getElementById("articleList");

articles.forEach(a => {
  const btn = document.createElement("button");
  btn.textContent = a.title;
  btn.className = "px-4 py-2 bg-gray-700/70 text-white rounded hover:bg-cyan-700 transition-all";
  btn.addEventListener("click", () => loadStudyContent("article", a.file));
  articleListDiv.appendChild(btn);
});

console.log("✅ StudyContentManager ready");

// --- Load the article list dynamically into the #articleList container ---
function loadArticleList() {
  console.log("🧾 Loading article list...");
  const listContainer = document.getElementById("articleList");
  if (!listContainer) return console.error("❌ Missing #articleList container");
  listContainer.innerHTML = "";

  articles.forEach(article => {
    const btn = document.createElement("button");
    btn.textContent = article.title;
    btn.className =
      "glass-panel text-left px-4 py-2 bg-cyan-700/80 hover:bg-cyan-600 text-white rounded-lg shadow-md " +
      "transition-all duration-300 hover:scale-105 hover:shadow-cyan-400/50";
    btn.addEventListener("click", () => {
      console.log(`📰 Loading article: ${ARTICLE_FOLDER + article.file}`);
      loadStudyContent("article", ARTICLE_FOLDER + article.file);
    });
    listContainer.appendChild(btn);
  });
}

// --- Auto-load list on DOM ready ---
document.addEventListener("DOMContentLoaded", loadArticleList);