if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(reg => console.log("Service Worker registered:", reg))
      .catch(err => console.error("SW registration failed:", err));
  });
}

let deferredPrompt = null;

// Capture the PWA install event
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Prevent automatic prompt
    deferredPrompt = e;  // Save the event for later

    showInstallButton(); // Make the button visible
});

// Show the install button dynamically
function showInstallButton() {
    let btn = document.getElementById('installBtn');
    if (!btn) {
        // If button doesn't exist, create it
        btn = document.createElement('button');
        btn.id = 'installBtn';
        btn.className = 'px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 fixed top-4 right-4 z-50';
        btn.textContent = '📲 Install App';
        document.body.appendChild(btn);
    }

    btn.style.display = 'inline-block';

    btn.onclick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt(); // Show native prompt
        const choiceResult = await deferredPrompt.userChoice;
        console.log('PWA install choice:', choiceResult.outcome);
        deferredPrompt = null; // Clear it
        btn.style.display = 'none'; // Hide after install
    };
}

// Optional: Hide button if app is already installed
window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    const btn = document.getElementById('installBtn');
    if (btn) btn.style.display = 'none';
});

document.addEventListener("DOMContentLoaded", () => {
  const weekData = window.weekData || {}; // Dummy JSON

  // Week Intro
  if (weekData.title) document.getElementById("week-title").textContent = weekData.title;
  if (weekData.intro) {
    document.getElementById("week-summary").textContent = weekData.intro.summary || "";
    document.getElementById("week-instructions").textContent = weekData.intro.instructions || "";
  }

  // Audio Playlist
  const audioSection = document.getElementById("audio-playlist");
  if (weekData.sections && weekData.sections.audio_playlist) {
    weekData.sections.audio_playlist.forEach(track => {
      const card = document.createElement("div");
      card.className = "cosmic-card mini";
      card.textContent = track.label + " (" + (track.src ? "ENG" : "") + ")";
      audioSection.appendChild(card);
    });

    // Load floating player
    window.dispatchEvent(new CustomEvent("player:updatePlaylist", {
      detail: { playlist: weekData.sections.audio_playlist }
    }));
  }

  // Chapters
  const chapterSection = document.getElementById("chapter-outlines");
  if (weekData.sections && weekData.sections.chapter_outlines) {
    for (const key in weekData.sections.chapter_outlines) {
      const card = document.createElement("div");
      card.className = "cosmic-card outline";
      const h3 = document.createElement("h3");
      h3.textContent = key;
      card.appendChild(h3);

      const ul = document.createElement("ul");
      weekData.sections.chapter_outlines[key].forEach(chap => {
        const li = document.createElement("li");
        li.textContent = chap;
        ul.appendChild(li);
      });
      card.appendChild(ul);
      chapterSection.appendChild(card);
    }
  }

  // Scripture, Commentary, Deeper Learning, Aleph-Tav, Kids, Language, Psalms
  const sectionsMap = ["scripture-text","commentary","deeper-learning","aleph-tav","kids-study","language-learning","psalms-plan"];
  sectionsMap.forEach(id => {
    const container = document.getElementById(id);
    if (!container) return;
    container.classList.add("cosmic-card");
    container.textContent = weekData.sections[id] || "No content yet.";
  });

  // Optional: Add click interactions for expanding/collapsing
});