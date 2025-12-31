// -------------------------------
// Sefaria Source Loader (Safe)
// -------------------------------
let sefariaLoaded = false;
let ntLoaded = false;

async function loadSefariaSource(ref) {
  const box = document.getElementById("sefariaBox");
  if (!box) return;

  box.innerHTML = `
    <p class="italic text-slate-400">
      Loading Jewish source…
    </p>
  `;

  try {
    const url = `https://www.sefaria.org/api/texts/${encodeURIComponent(ref)}?lang=en`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // Extract first line safely
    let text = "";
    if (Array.isArray(data.text) && data.text.length > 0) {
      text = data.text[0];
    } else {
      text = "No text available for this reference.";
    }

    // Strip HTML for now (calm + safe)
    text = text.replace(/<[^>]*>/g, "");

    box.innerHTML = `
      <p class="text-xs uppercase text-slate-400 mb-2">
        Jewish Source (via Sefaria)
      </p>
      <p class="leading-relaxed">
        ${text}
      </p>
      <p class="mt-3 text-xs">
        <a
          href="https://www.sefaria.org/${encodeURIComponent(ref)}"
          target="_blank"
          class="text-cyan-400 hover:underline"
        >
          Read more on Sefaria →
        </a>
      </p>
    `;
  } catch (err) {
    console.warn("Sefaria load failed:", err);
    box.innerHTML = `
      <p class="italic text-slate-400">
        Jewish source unavailable at this time.
      </p>
    `;
  }
}


const box = document.getElementById("sefariaBox");
const btn = document.getElementById("loadBtn");

async function loadSefaria(ref) {
  box.textContent = "Loading from Sefaria…";

  try {
    const url = `https://www.sefaria.org/api/texts/${encodeURIComponent(ref)}?lang=en`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    // Safest possible extraction
    const text = Array.isArray(data.text) && data.text.length
      ? data.text[0]
      : "No English text available.";

    box.textContent = text;
  } catch (err) {
    console.error("Sefaria fetch failed:", err);
    box.textContent = "Failed to load Sefaria text.";
  }
}

btn.addEventListener("click", () => {
  loadSefaria("Genesis 1:1");
});

// -------------------------------
// Section Toggle Logic (Minimal)
// -------------------------------

function setupToggle(buttonId, sectionId) {
  const btn = document.getElementById(buttonId);
  const section = document.getElementById(sectionId);

  if (!btn || !section) return;

  btn.addEventListener("click", () => {
    section.classList.toggle("hidden");
  });
}

// -------------------------------
// NT Usage Loader (Calm, Minimal)
// -------------------------------

function loadNTUsage(ref) {
  const box = document.getElementById("ntQuoteBox");
  if (!box) return;

  box.innerHTML = `
    <p class="italic text-slate-400">
      Checking New Testament usage…
    </p>
  `;

  // Placeholder for now — no JSON yet
  // This establishes tone and structure
  box.innerHTML = `
    <p class="text-xs uppercase text-slate-400 mb-2">
      New Testament Witness
    </p>

    <p class="text-slate-300 mb-2">
      The New Testament cites and alludes to the Hebrew Scriptures in a variety
      of ways, sometimes reflecting the Masoretic Text and sometimes the Septuagint.
    </p>

    <ul class="list-disc list-inside text-slate-200">
      <li><span class="font-medium">Matthew 1:23</span> — quotation via the Septuagint</li>
      <li><span class="font-medium">Romans 4:17</span> — conceptual allusion</li>
    </ul>

    <p class="mt-3 italic text-slate-400">
      Detailed references will appear here as they are added.
    </p>
  `;
}


// -------------------------------
// Jewish Sources Toggle (with lazy load)
// -------------------------------

const jewishBtn = document.getElementById("toggleJewish");
const jewishSection = document.getElementById("jewishSection");

if (jewishBtn && jewishSection) {
  jewishBtn.addEventListener("click", () => {
    const isHidden = jewishSection.classList.contains("hidden");

    // Toggle visibility
    jewishSection.classList.toggle("hidden");

    // Load Sefaria only the FIRST time it opens
    if (isHidden && !sefariaLoaded) {
      sefariaLoaded = true;
      loadSefariaSource("Genesis 1:1");
    }
  });
}

// -------------------------------
// Witness of the People of God Toggle
// -------------------------------

const peopleBtn = document.getElementById("togglePeople");
const peopleSection = document.getElementById("peopleSection");

if (peopleBtn && peopleSection) {
  peopleBtn.addEventListener("click", () => {
    peopleSection.classList.toggle("hidden");
  });
}


// -------------------------------
// NT Usage Toggle (lazy load)
// -------------------------------

const ntBtn = document.getElementById("toggleNT");
const ntSection = document.getElementById("ntSection");

if (ntBtn && ntSection) {
  ntBtn.addEventListener("click", () => {
    const isHidden = ntSection.classList.contains("hidden");

    // Toggle visibility
    ntSection.classList.toggle("hidden");

    // Load NT usage only the FIRST time it opens
    if (isHidden && !ntLoaded) {
      ntLoaded = true;
      loadNTUsage("Genesis 1:1");
    }
  });
}

// -------------------------------
// Dead Sea Scrolls Toggle (stub)
// -------------------------------

const dssBtn = document.getElementById("toggleDSS");
const dssSection = document.getElementById("dssSection");

if (dssBtn && dssSection) {
  dssBtn.addEventListener("click", () => {
    dssSection.classList.toggle("hidden");
  });
}



setupToggle("toggleFathers", "fathersSection");