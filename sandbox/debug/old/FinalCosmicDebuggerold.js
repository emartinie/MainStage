// Cosmic App-Specific Debugger v2 - with Dependency Mapping
(function () {
  if (window.cosmicAppDebugger) return;
  window.cosmicAppDebugger = {};

  let dbgVisible = false;

  // -------------------- Create Debugger Window --------------------
  function createDebugger() {
    if (document.getElementById("cosmicDebugger")) return;

    const dbg = document.createElement("div");
    dbg.id = "cosmicDebugger";
    dbg.style.cssText = `
      position: fixed;
      top: 50px;
      left: 50px;
      width: 650px;
      max-width: 95vw;
      height: 450px;
      max-height: 80vh;
      background: rgba(17,24,39,0.95);
      color: #f9fafb;
      font-family: monospace;
      border-radius: 1rem;
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 9999;
      display: none;
      overflow: hidden;
      resize: both;
    `;

    dbg.innerHTML = `
      <header style="background:rgba(30,41,59,0.8); padding:0.5rem 1rem; cursor:move; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:bold;">Debugger - ${window.location.pathname.split("/").pop()}</span>
        <button id="dbgCloseBtn" style="background:transparent;color:#f9fafb;border:none;font-size:1.2rem;cursor:pointer;">✖</button>
      </header>
      <nav style="display:flex; gap:0.5rem; padding:0.5rem; background:rgba(30,41,59,0.6); overflow-x:auto;">
        <button class="dbgTabBtn active" data-tab="core">Core</button>
        <button class="dbgTabBtn" data-tab="events">Events</button>
        <button class="dbgTabBtn" data-tab="containers">Containers</button>
        <button class="dbgTabBtn" data-tab="data">Data</button>
        <button class="dbgTabBtn" data-tab="logic">Logic</button>
        <button class="dbgTabBtn" data-tab="resources">Resources</button>
        <button class="dbgTabBtn" data-tab="system">System</button>
      </nav>
      <div class="dbgContent" style="height:calc(100% - 80px); overflow:auto;">
        <div class="dbgTab active" id="dbg-tab-core"></div>
        <div class="dbgTab" id="dbg-tab-events"></div>
        <div class="dbgTab" id="dbg-tab-containers"></div>
        <div class="dbgTab" id="dbg-tab-data"></div>
        <div class="dbgTab" id="dbg-tab-logic"></div>
        <div class="dbgTab" id="dbg-tab-resources"></div>
        <div class="dbgTab" id="dbg-tab-system"></div>
      </div>
    `;

    document.body.appendChild(dbg);

    // Close button
    document.getElementById("dbgCloseBtn").onclick = () => dbg.style.display = "none";

    // Tabs
    dbg.querySelectorAll(".dbgTabBtn").forEach(btn => {
      btn.onclick = () => {
        dbg.querySelectorAll(".dbgTabBtn").forEach(b => b.classList.remove("active"));
        dbg.querySelectorAll(".dbgTab").forEach(tab => tab.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById("dbg-tab-" + btn.dataset.tab).classList.add("active");
      };
    });

  // Tab switching
  document.querySelectorAll(".debug-tab").forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll(".debug-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentTab = tab.dataset.tab;
      renderTab();
    };
  });

    // Dragging
    const header = dbg.querySelector("header");
    let offsetX, offsetY, dragging = false;
    header.addEventListener("mousedown", e => {
      dragging = true;
      offsetX = e.clientX - dbg.offsetLeft;
      offsetY = e.clientY - dbg.offsetTop;
    });
    document.addEventListener("mousemove", e => {
      if (dragging) {
        dbg.style.left = e.clientX - offsetX + "px";
        dbg.style.top = e.clientY - offsetY + "px";
      }
    });
    document.addEventListener("mouseup", () => dragging = false);

    // Touch support
    header.addEventListener("touchstart", e => {
      dragging = true;
      const touch = e.touches[0];
      offsetX = touch.clientX - dbg.offsetLeft;
      offsetY = touch.clientY - dbg.offsetTop;
    });
    document.addEventListener("touchmove", e => {
      if (dragging) {
        const touch = e.touches[0];
        dbg.style.left = touch.clientX - offsetX + "px";
        dbg.style.top = touch.clientY - offsetY + "px";
      }
    });
    document.addEventListener("touchend", () => dragging = false);

    // Initial updates
    updateCore();
    updateEvents();
    updateContainers();
    updateData();
    updateLogic();
    updateResources();
    updateSystem();
  }

  // -------------------- Toggle Debugger --------------------
  function toggleDebugger() {
    createDebugger();
    const dbg = document.getElementById("cosmicDebugger");
    dbgVisible = !dbgVisible;
    dbg.style.display = dbgVisible ? "block" : "none";
  }

  // -------------------- Hotkey and Hidden Toggle --------------------
  document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key.toLowerCase() === "m") toggleDebugger();
  });

  const toggleBtn = document.createElement("button");
  toggleBtn.id = "cosmicToggleBtn";
  toggleBtn.innerText = "🐞";
  toggleBtn.style.cssText = `
    position:fixed; bottom:10px; right:10px; z-index:9999; padding:0.5rem; border-radius:50%; background:#2563eb; color:#fff; border:none;
  `;
  toggleBtn.onclick = toggleDebugger;
  document.body.appendChild(toggleBtn);

  // -------------------- Logging --------------------
  function log(msg) {
    createDebugger();
    const logBox = document.getElementById("dbg-tab-core");
    const pre = document.createElement("pre");
    pre.textContent = msg;
    logBox.appendChild(pre);
    logBox.scrollTop = logBox.scrollHeight;
    console.log("%c[Debugger]", "color:#0ff;", msg);
  }

  // -------------------- Tab Updates --------------------
  function updateCore() {
    const tab = document.getElementById("dbg-tab-core");
    tab.innerHTML = "<h3>Core Dependencies</h3><ul>" +
      `<li>Floating Player: ${window.globalAudio ? "✅" : "❌"}</li>` +
      `<li>Cards Container: ${document.getElementById("cardsContainer") ? "✅" : "❌"}</li>` +
      `<li>Calendar: ${document.getElementById("calendarCard") ? "✅" : "❌"}</li>` +
      `<li>JSON Loader: ${window.jsonData ? "✅" : "❌"}</li>` +
      "</ul>";
  }

  function updateEvents() {
    const tab = document.getElementById("dbg-tab-events");
    tab.innerHTML = "<h3>Event Listeners</h3><p>(Note: limited outside DevTools)</p>";
  }

  function updateContainers() {
    const tab = document.getElementById("dbg-tab-containers");
    tab.innerHTML = "<h3>Rendered Containers</h3><ul>";
    document.querySelectorAll(".hero-card, #cardsContainer, #calendarCard").forEach(c => {
      tab.innerHTML += `<li>${c.id || c.className} | Children: ${c.childElementCount}</li>`;
    });
    tab.innerHTML += "</ul>";
  }

  function updateData() {
    const tab = document.getElementById("dbg-tab-data");
    tab.innerHTML = "<h3>Loaded Data Objects</h3><ul>";
    if (window.jsonData) {
      tab.innerHTML += `<li>JSON Loaded: ✅</li>`;
      tab.innerHTML += `<li>Keys: ${Object.keys(window.jsonData).join(", ")}</li>`;
    } else {
      tab.innerHTML += "<li>JSON Loaded: ❌</li>";
    }
    tab.innerHTML += "</ul>";
  }

  function updateLogic() {
    const tab = document.getElementById("dbg-tab-logic");
    tab.innerHTML = "<h3>Logic/Calculations</h3><ul>";
    if (window.currentWeek) {
      tab.innerHTML += `<li>Current Week: ${window.currentWeek}</li>`;
    } else {
      tab.innerHTML += `<li>Current Week: ❌</li>`;
    }
    tab.innerHTML += "</ul>";
  }

  function updateResources() {
    const tab = document.getElementById("dbg-tab-resources");
    let html = "<h3>Resources</h3><ul>";
    document.querySelectorAll("script[src]").forEach(s => {
      html += `<li>JS: ${s.src}</li>`;
    });
    document.querySelectorAll("link[rel=stylesheet]").forEach(l => {
      html += `<li>CSS: ${l.href}</li>`;
    });
    html += "</ul>";

    // Dependency notes (example mapping, extend as needed)
    html += "<h4>App Feature Dependencies</h4><ul>";
    html += "<li>Player → globalAudio.js, floatingPlayer.css</li>";
    html += "<li>Cards → renderCards.js, cards.css</li>";
    html += "<li>Calendar → calendar.js, calendar.css</li>";
    html += "<li>Loader → loader.js, data.json</li>";
    html += "</ul>";

    tab.innerHTML = html;
  }

  function updateSystem() {
    const tab = document.getElementById("dbg-tab-system");
    tab.innerHTML = `
      <h3>System Info</h3>
      <ul>
        <li>User Agent: ${navigator.userAgent}</li>
        <li>Platform: ${navigator.platform}</li>
        <li>Language: ${navigator.language}</li>
        <li>Memory: ${navigator.deviceMemory || "N/A"} GB</li>
      </ul>
    `;
  }

  // -------------------- Expose --------------------
  window.cosmicAppDebugger = { log, toggleDebugger, updateCore, updateEvents, updateContainers, updateData, updateLogic, updateResources, updateSystem };
})();