// ===== Article Data =====
const ARTICLE_FOLDER = "./articles/";

const articles = [
  { title: "Taking Our Country & Churches Back", file: "taking_our_churches_and_our_country_back.html" },
  { title: "The Hebrew Pages of the New Testament", file: "the_hebrew_pages_of_the_new_testament.html" },
  { title: "Where Did the Sabbath Go?", file: "where_did_the_sabbath_go.html" },
  { title: "The Remnant", file: "the_remnant.html" },
  { title: "Surrendering Anger- by Wendy Roberts", file: "surrendering_anger.html" },
  { title: "Almost There, but Not Quite", file: "almost_there_but_not_quite.html" },
  { title: "Understanding Denominations for Unity Sake", file: "understanding_denominations.html" },
  { title: "The Hebrew Roots of Revelation", file: "the_book_of_revelation_hebrew_roots.html" },
  { title: "The Law is Dead?", file: "the_law_is_dead.html" },
  { title: "Misconceptions of ekklesia", file: "misconceptions_of_ekklesia.html" },
  { title: "Who is Q for Christians?", file: "who_is_q_for_christians.html" },
  { title: "Who is Q [for Christians]", file: "qanon_phenomenon_who_is_q_for_christians.html" },
  { title: "Marriage", file: "marriage.html" },
  { title: "Letter to a Friend", file: "letter_to_a_friend.html" },
  { title: "The holidays- by Wendy Roberts", file: "sola_scriptura_the_holidays.html" },
  { title: "Walking in Love", file: "debating_arguing_discussing_and_disagreeing_midrash.html" },
  { title: "First Article", file: "first_blog_post_the_second_commandment_and_the_second_ammendment.html" },
  { title: "Fulfillment of Prophecy", file: "jesus_yeshua_fulfillment_of_prophecy.html" },
  { title: "Kingdom Mindedness", file: "kingdom_mindedness.html" },
  { title: "LTBI24H- Chuck Missler", file: "learn_the_bible_in_24_hours.html" },
  { title: "List of Sins", file: "list_of_sins.html" },
  { title: "Relational Discipleship 101 Notes", file: "relational_discipleship_101_notes.html" },
  { title: "Study Tools", file: "study_tools.html" },
  { title: "The Commandments of Jesus", file: "the_commandments_of_jesus.html" },
  { title: "The Prodigal Son", file: "the_prodigal_son.html" },
  { title: "Torah Commandments- A List", file: "torah_commandments.html" },
  { title: "The Story", file: "the_story.html" }
];

// ===== COMMENTARY PATH BUILDER (Matches StudyContentManager) =====
function getTodaysCommentaryFile() {
  const week = getCurrentWeekNumber();
  return `commentary/week${week}.html`;
}

// ===== Reader State =====
let readerPages = [];
let readerIndex = 0;

// ===== Open Reader Modal =====
function openReaderModal(title, paragraphs) {
  if (!Array.isArray(paragraphs)) paragraphs = [paragraphs];

  readerPages = paragraphs;
  readerIndex = 0;

  const overlay = document.getElementById("readerOverlay");
  const modalTitle = document.getElementById("readerModalTitle");

  overlay.classList.remove("hidden");
  modalTitle.textContent = title;
  renderReaderPage();

  // Animate in
  setTimeout(() => {
    overlay.classList.add("opacity-100");
    document.getElementById("readerModal").classList.add("scale-100");
  }, 10);
}

// ===== Render a page =====
function renderReaderPage() {
  const bodyEl = document.getElementById("readerModalBody");
  const pageNumEl = document.getElementById("readerPageNumber");

  bodyEl.innerHTML = readerPages[readerIndex]
    .split("\n")
    .map(p => `<p>${p}</p>`)
    .join("");

  pageNumEl.textContent = `Page ${readerIndex + 1} / ${readerPages.length}`;

  document.getElementById("readerPrev").disabled = readerIndex === 0;
  document.getElementById("readerNext").disabled = readerIndex === readerPages.length - 1;
}

// ===== Close Modal =====
function closeReaderModal() {
  const overlay = document.getElementById("readerOverlay");
  const modal = document.getElementById("readerModal");

  overlay.classList.remove("opacity-100");
  modal.classList.remove("scale-100");

  setTimeout(() => overlay.classList.add("hidden"), 200);
}

document.addEventListener("DOMContentLoaded", () => {
  const commentaryBtn = document.getElementById("openCommentaryBtn");

  if (commentaryBtn) {
    commentaryBtn.addEventListener("click", async () => {
      
      const file = getTodaysCommentaryFile();  
      console.log("📖 Loading modal commentary:", file);

      try {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const html = await res.text();

        // Extract <p> tags like your article modal logic
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const paragraphs = Array.from(doc.body.querySelectorAll("p"))
                                .map(p => p.textContent.trim());

        openReaderModal("Daily Commentary", paragraphs);

      } catch (err) {
        console.error("❌ Commentary modal load error:", err);
        openReaderModal("Daily Commentary", [
          "Commentary could not be loaded.",
          "Make sure the week file exists in /commentary/."
        ]);
      }
    });
  }
});


// ===== Load Article List =====
function loadArticleList() {
  const listContainer = document.getElementById("articleList");
  if (!listContainer) return console.error("❌ #articleList not found");

  listContainer.innerHTML = "";

  articles.forEach(article => {
    const btn = document.createElement("button");
    btn.textContent = article.title;
    btn.className = `
      px-4 py-2 rounded bg-cyan-700/80 hover:bg-cyan-600 text-white
      text-left shadow-md transition-all duration-300 hover:scale-105
    `;

    btn.addEventListener("click", () => {
      fetch(`${ARTICLE_FOLDER}${article.file}`)
        .then(res => res.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const paragraphs = Array.from(doc.body.querySelectorAll("p")).map(p => p.textContent);
          openReaderModal(article.title, paragraphs);
        })
        .catch(err => console.error("❌ Failed to load article:", err));
    });

    listContainer.appendChild(btn);
  });
}

// ===== Event Listeners =====
document.addEventListener("DOMContentLoaded", () => {
  loadArticleList();

  document.getElementById("readerModalClose").addEventListener("click", closeReaderModal);
  document.getElementById("readerOverlay").addEventListener("click", e => {
    if (e.target === e.currentTarget) closeReaderModal();
  });
  document.getElementById("readerPrev").addEventListener("click", () => {
    if (readerIndex > 0) {
      readerIndex--;
      renderReaderPage();
    }
  });
  document.getElementById("readerNext").addEventListener("click", () => {
    if (readerIndex < readerPages.length - 1) {
      readerIndex++;
      renderReaderPage();
    }
  });

  console.log("✅ readerSystem.js initialized");
});