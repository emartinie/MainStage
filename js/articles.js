// --- articles.js ---
console.log("🧾 Articles system online");

const ARTICLE_FOLDER = "articles/";

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
  { title: "Surrendering Anger- by Wendy Roberts", file: "surrendering_anger.html" },
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
  { title: "Who is Q for Christians?", file: "who_is_q_for_christians.html" }
];

let articleSections = [];
let articleIndex = 0;

// ---------------------------
// Article list rendering
// ---------------------------
function loadArticleList() {
  console.log("🧾 Rendering article list...");

  const listContainer = document.getElementById("articlelist");
  if (!listContainer) {
    console.error("❌ Missing #articleListBox");
    return;
  }

  listContainer.innerHTML = "";

  articles.forEach(article => {
    const btn = document.createElement("button");
    btn.textContent = article.title;

    btn.className =
    "block w-full text-left px-4 py-2 mb-1 rounded " +
    "bg-slate-800 hover:bg-slate-700 text-sm";
    btn.onclick = () => openArticleModal(article);
    listContainer.appendChild(btn);
  });
}

// ---------------------------
// Modal loading
// ---------------------------
function openArticleModal(article) {
  const modal = document.getElementById("articleModal");
  const titleEl = document.getElementById("articleTitle");
  const contentEl = document.getElementById("articleContent");

  titleEl.textContent = article.title;
  contentEl.innerHTML = "<p>Loading…</p>";

  fetch(ARTICLE_FOLDER + article.file)
    .then(res => {
      if (!res.ok) throw new Error("Article not found");
      return res.text();
    })
    .then(html => {
      contentEl.innerHTML = html;
      initArticleSections(contentEl);
    })
    .catch(err => {
      contentEl.innerHTML = "<p>⚠️ Unable to load article.</p>";
      console.error(err);
    });

  modal.classList.remove("hidden");
}

// ---------------------------
// Section-aware pagination
// ---------------------------
function initArticleSections(container) {
  const sections = container.querySelectorAll("section[data-section]");

  if (!sections.length) {
    articleSections = [];
    hideArticlePager();
    return;
  }

  articleSections = Array.from(sections);
  articleIndex = 0;

  articleSections.forEach(s => (s.style.display = "none"));
  articleSections[0].style.display = "block";

  showArticlePager();
  updateArticlePager();
}

function showArticlePager() {
  document.getElementById("articlePager")?.classList.remove("hidden");
}

function hideArticlePager() {
  document.getElementById("articlePager")?.classList.add("hidden");
}

function updateArticlePager() {
  const status = document.getElementById("articlePagerStatus");
  if (status) {
    status.textContent = `Section ${articleIndex + 1} of ${articleSections.length}`;
  }
}

// ---------------------------
// Pager buttons (failsafe)
// ---------------------------
const articlePrevBtn = document.getElementById("articlePrevBtn");
const articleNextBtn = document.getElementById("articleNextBtn");

if (articlePrevBtn && articleNextBtn) {
  prevBtn.onclick = () => {
    if (articleIndex > 0) {
      articleSections[articleIndex].style.display = "none";
      articleIndex--;
      articleSections[articleIndex].style.display = "block";
      updateArticlePager();
    }
  };

  nextBtn.onclick = () => {
    if (articleIndex < articleSections.length - 1) {
      articleSections[articleIndex].style.display = "none";
      articleIndex++;
      articleSections[articleIndex].style.display = "block";
      updateArticlePager();
    }
  };
}

document.addEventListener("DOMContentLoaded", loadArticleList);
