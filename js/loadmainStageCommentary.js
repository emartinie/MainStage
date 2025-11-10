// loadCommentary.js
async function loadCommentary(week = 3) {
  const mainStageCommentary = document.getElementById("mainStageCommentary");
  if (!mainStageCommentary) return console.warn("#mainStageCommentary not found");

  const commentaryUrl = `commentary/week${week}.html`;

  try {
    const res = await fetch(commentaryUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    
    mainStageCommentary.innerHTML = `
      <div class="glass-panel fade-slide commentary-card hidden">
        ${html}
      </div>
    `;

    console.log(`✅ Commentary for week ${week} loaded.`);
  } catch (err) {
    mainStageCommentary.innerHTML = `
      <div class="commentary-placeholder visible">
        ⚠️ Commentary for week ${week} not found.
      </div>
    `;
    console.warn(`Commentary fetch failed for week ${week}`, err);
  }

  // Toggle logic
  const toggleBtn = document.getElementById("toggleCommentaryBtn");
  const container = mainStageCommentary.querySelector(".commentary-card");

  if (toggleBtn && container) {
    toggleBtn.addEventListener("click", () => {
      container.classList.toggle("hidden");
      toggleBtn.textContent = container.classList.contains("hidden")
        ? "📘 Show Commentary"
        : "📘 Hide Commentary";
    });
    console.log("💡 Commentary toggle initialized with glow");
  }
}

// Load default week
loadCommentary(1);