(function() {
  let debuggerVisible = false;
  let currentTab = "console";


  // Create the debugger container
  const dbg = document.createElement("div");
  dbg.id = "cosmic-debugger";
  dbg.innerHTML = `
    <div id="cosmic-debugger-header">
      <div id="cosmic-debugger-title">Debugger - ${location.pathname.split("/").pop()}</div>
      <button id="cosmic-debugger-close">✖</button>
    </div>
    <div id="cosmic-debugger-tabs">
      <div class="debug-tab active" data-tab="console">Console</div>
      <div class="debug-tab" data-tab="resources">Resources</div>
      <div class="debug-tab" data-tab="dependencies">Dependencies</div>
      <div class="debug-tab" data-tab="network">Network</div>
    </div>
    <div id="cosmic-debugger-content"></div>
  `;
  document.body.appendChild(dbg);
    dbg.style.display = "none";


  const content = document.getElementById("cosmic-debugger-content");

  // Close button
  document.getElementById("cosmic-debugger-close").onclick = () => {
    dbg.style.display = "none";
    debuggerVisible = false;
  };

  // Tab switching
  document.querySelectorAll(".debug-tab").forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll(".debug-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      currentTab = tab.dataset.tab;
      renderTab();
    };
  });

  // Make draggable
  const header = document.getElementById("cosmic-debugger-header");
  let offsetX, offsetY, isDragging = false;
  header.addEventListener("mousedown", e => {
    isDragging = true;
    offsetX = e.clientX - dbg.offsetLeft;
    offsetY = e.clientY - dbg.offsetTop;
  });
  document.addEventListener("mouseup", () => isDragging = false);
  document.addEventListener("mousemove", e => {
    if (isDragging) {
      dbg.style.left = (e.clientX - offsetX) + "px";
      dbg.style.top = (e.clientY - offsetY) + "px";
    }
  });

  // Toggle with Ctrl+M
  document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key.toLowerCase() === "m") {
      debuggerVisible = !debuggerVisible;
      dbg.style.display = debuggerVisible ? "flex" : "none";
      if (debuggerVisible) renderTab();
    }
  });

  // Render tab content
  function renderTab() {
    if (currentTab === "console") {
      content.innerHTML = `<h3>Console Log</h3><pre id="debug-console"></pre>`;
    }

    if (currentTab === "resources") {
      const css = [...document.styleSheets].map(s => s.href || "[inline]");
      const js = [...document.scripts].map(s => s.src || "[inline]");
      content.innerHTML = `
        <h3>Resources</h3>
        <b>CSS</b><ul>${css.map`(c => <li>${c}</li>).join("")`}</ul>
        <b>JS</b><ul>${js.map`(j => <li>${j}</li>).join("")`}</ul>
      `;
    }

    if (currentTab === "dependencies") {
      content.innerHTML = `
        <h3>Dependencies</h3>
        <ul>
          <li>Player container: ${!!document.getElementById("player-container")}</li>
          <li>Global Audio: ${!!window.globalAudio}</li>
          <li>JSON Loader: ${typeof window.loadJSON === "function"}</li>
          <li>Calendar: ${!!document.getElementById("calendar")}</li>
        </ul>
      `;
    }

    if (currentTab === "network") {
      content.innerHTML = `<h3>Network (capturing fetches)</h3><ul id="debug-network"></ul>`;
    }
  }

  // Console capture
  const origLog = console.log;
  console.log = function(...args) {
    origLog.apply(console, args);
    const el = document.getElementById("debug-console");
    if (el) el.textContent += args.join(" ") + "\n";
  };

  // Network capture
  const origFetch = window.fetch;
  window.fetch = async (...args) => {
    const res = await origFetch(...args);
    const li = document.createElement("li");
    li.textContent = $`{args[0]} → ${res.status}`;
    const ul = document.getElementById("debug-network");
    if (ul) ul.appendChild(li);
    return res;
  };
})();
