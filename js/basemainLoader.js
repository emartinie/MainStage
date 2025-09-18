// Example: Render one chapter outline section with audio play buttons
function renderChapterOutline(container, chapterData) {
  if (!container || !chapterData) return;

  // Clear existing content
  container.innerHTML = "";

  chapterData.forEach((chapter, chapterIndex) => {
    const section = document.createElement("div");
    section.className = "chapter-section mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-inner space-y-2 text-gray-700 dark:text-gray-300";

    // Chapter title
    const title = document.createElement("h3");
    title.className = "font-bold text-lg";
    const el = document.querySelector('#myDiv');
     section.appendChild(title);

    // Iterate over items/verses in chapter
    chapter.items.forEach((item, itemIndex) => {
      const row = document.createElement("div");
      row.className = "chapter-row flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-600";

    // Verse / item description
    const desc = document.createElement("span");
    desc.textContent = `item.title || Verse ${itemIndex + 1}`;  // ✅ wrap with backticks
    row.appendChild(desc);

      // --- Play button wired for floating player ---
      const playBtn = document.createElement("button");
      playBtn.textContent = "▶ Play";
      playBtn.className = "px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800";

      // Add floating player hook attributes
      playBtn.setAttribute("data-audio-src", item.audioSrc || "");
      playBtn.setAttribute("data-title", item.title || `Chapter ${chapterIndex + 1} - Verse ${itemIndex + 1}`);

      row.appendChild(playBtn);
      section.appendChild(row);
    });

    container.appendChild(section);
  });
}

// Example usage
const chaptersContainer = document.getElementById("mainStageChapters");
renderChapterOutline(chaptersContainer, window.weekData?.sections?.chapters || []);
