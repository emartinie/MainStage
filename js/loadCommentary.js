// ✅ loadCommentary.js (clean rebuild 11/07/2025-STABLE)
// Handles loading commentary HTML for the selected week
// Works automatically on week change events
// --- Commentary Toggle ---

(function () {
  console.log("📖 Commentary module initializing...");

  // --- DOM elements ---
  const commentaryContainer = document.getElementById("commentaryContainer");
  if (!commentaryContainer) {
    console.warn("⚠️ No commentaryContainer found in DOM.");
    return;
  }

  // --- Core loader ---
  async function loadCommentary(week) {
    if (!week || isNaN(week)) {
      console.warn("⚠️ Invalid week value for commentary load:", week);
      return;
    }

    const url = `commentary/week${week}.html`;
    console.log(`🔄 Loading commentary for week ${week} from ${url}...`);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} loading ${url}`);
      const html = await res.text();
      commentaryContainer.innerHTML = html;
      console.log(`✅ Commentary for week ${week} loaded.`);
      glowCommentaryButton(); // optional helper
    } catch (err) {
      console.error("❌ Failed to load commentary:", err);
      commentaryContainer.innerHTML =
        `<p style="color: red;">Error loading commentary for week ${week}.</p>`;
    }
  }

  async function loadContent(containerId, folder, filename) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const res = await fetch(`${folder}/${filename}`);
        if (!res.ok) throw new Error("Failed to load content");
        const html = await res.text();

        // Clear existing content
        container.innerHTML = "";

        // Split content into paragraphs for pagination
        const paragraphs = html.split(/<\/p>/i).map(p => p.trim()).filter(Boolean);
        let currentPage = 0;
        const pageSize = 5; // number of paragraphs per page

        function renderPage(page) {
            const start = page * pageSize;
            const end = start + pageSize;
            container.innerHTML = paragraphs.slice(start, end).join("</p>") + "</p>";

            // Pagination buttons
            const pagination = document.createElement("div");
            pagination.style.textAlign = "center";
            pagination.style.marginTop = "1rem";

            if (page > 0) {
                const prevBtn = document.createElement("button");
                prevBtn.textContent = "⬅ Previous";
                prevBtn.onclick = () => { currentPage--; renderPage(currentPage); };
                pagination.appendChild(prevBtn);
            }

            if (end < paragraphs.length) {
                const nextBtn = document.createElement("button");
                nextBtn.textContent = "Next ➡";
                nextBtn.onclick = () => { currentPage++; renderPage(currentPage); };
                pagination.appendChild(nextBtn);
            }

            container.appendChild(pagination);
        }

        renderPage(currentPage);
    } catch (err) {
        console.error(`Error loading ${folder}/${filename}:, err`);
    }
}

  // --- Optional glow effect (non-critical) ---
  function glowCommentaryButton() {
    const btn = document.getElementById("commentaryBtn");
    if (!btn) return;
    btn.classList.add("glow");
    setTimeout(() => btn.classList.remove("glow"), 1500);
    console.log("💡 Commentary toggle initialized with glow");
  }

  // --- Listen for week changes ---
  document.addEventListener("weekChanged", (e) => {
    const week = e?.detail?.week || window.currentWeek;
    console.log("📅 weekChanged event detected — loading commentary for week", week);
    loadCommentary(week);
  });

  // --- Initial load fallback ---
  document.addEventListener("DOMContentLoaded", () => {
    const initialWeek = window.currentWeek || 1;
    console.log("📅 DOM ready — loading initial commentary for week", initialWeek);
    loadCommentary(initialWeek);
  });

const toggleCommentaryBtn = document.getElementById("toggleCommentary"); // create this button in HTML

// Make sure button exists
if (toggleCommentaryBtn && commentaryContainer) {
  toggleCommentaryBtn.addEventListener("click", () => {
    if (commentaryContainer.classList.contains("hidden")) {
      commentaryContainer.classList.remove("hidden");
      toggleCommentaryBtn.textContent = "Hide Commentary";
    } else {
      commentaryContainer.classList.add("hidden");
      toggleCommentaryBtn.textContent = "Show Commentary";
    }
  });
}

  // --- Expose for console/manual use ---
  window.loadCommentary = loadCommentary;
})();

document.addEventListener("click", (e) => {
  if (e.target.id === "commentaryToggle") {
    const commentaryContainer = document.getElementById("commentaryContainer");
    if (commentaryContainer) commentaryContainer.classList.toggle("hidden");
  }
});