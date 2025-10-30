async function loadCommentary(weekNumber) {
  const stage = document.getElementById("mainStage");
  if (!stage) {
    console.error("❌ No #mainStage element found in HTML.");
    return;
  }

  // ensure weekNumber is valid
  weekNumber = parseInt(weekNumber, 10) || 1;
  console.log(`📖 Loading commentary for week ${weekNumber}...`);

  try {
    const res = await fetch(`./commentary/week${weekNumber}.html`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    // clear previous commentary
    stage.innerHTML = "";

    // create card container
    const card = document.createElement("div");
    card.className = "commentary-card";
    card.innerHTML = html;

    stage.appendChild(card);

    console.log(`✅ Commentary for week ${weekNumber} loaded.`);
  } catch (err) {
    console.warn("⚠️ Commentary not found, showing placeholder for week", weekNumber);

    stage.innerHTML = "";

    const placeholder = document.createElement("div");
    placeholder.className = "commentary-placeholder";
    placeholder.innerHTML = `
      <div class="placeholder-inner">
        <h2>✍️ Commentary for Week ${weekNumber} is being updated</h2>
        <p>Please check back soon — new insights are on the way!</p>
      </div>
    `;

    stage.appendChild(placeholder);

    requestAnimationFrame(() => {
      placeholder.classList.add("visible");
    });
  }
}

// --- Initial load ---
window.addEventListener("DOMContentLoaded", () => {
  const initialWeek = typeof window.currentWeek !== "undefined"
    ? window.currentWeek
    : parseInt(window.weekSelect?.value, 10) || 1;

  console.log("🌅 Initial commentary load for week", initialWeek);
  loadCommentary(initialWeek);

  // --- COMMENTARY TOGGLE SETUP --- //
(function setupCommentaryToggle() {
  const toggleBtn = document.getElementById("toggleCommentaryBtn");

  if (!toggleBtn) {
    console.warn("⚠️ toggleCommentaryBtn not found. Skipping toggle setup.");
    return;
  }

  const initToggle = (stage) => {
    if (!stage) return;
    console.log("✅ #mainStage found. Commentary toggle initialized.");

    toggleBtn.addEventListener("click", () => {
      const hidden = stage.classList.toggle("hidden");
      toggleBtn.textContent = hidden ? "📘 Show Commentary" : "❌ Hide Commentary";
    });
  };

  // check if #mainStage already exists
  const stage = document.getElementById("mainStage");
  if (stage) {
    initToggle(stage);
    return;
  }

  // watch the DOM for when #mainStage appears dynamically
  const observer = new MutationObserver((mutations, obs) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.id === "mainStage") {
          initToggle(node);
          obs.disconnect();
          return;
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();

  // Listen for week changes
  document.addEventListener("weekChanged", (e) => {
    console.log("🌀 Week changed event detected:", e.detail.week);
    loadCommentary(e.detail.week);
  });
});

// === 🎚️ SHOW/HIDE COMMENTARY TOGGLE ===
document.addEventListener("DOMContentLoaded", () => {
  const commentarySection = document.getElementById("commentaryContainer");
  const toggleBtn = document.getElementById("toggleCommentaryBtn");

  // Make sure both elements exist before binding
  if (commentarySection && toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const hidden = commentarySection.classList.toggle("hidden");
      toggleBtn.textContent = hidden ? "📘 Show Commentary" : "❌ Hide Commentary";
    });
  } else {
    console.warn("⚠️ Commentary toggle elements not found — skipping toggle setup.");
  }
});
