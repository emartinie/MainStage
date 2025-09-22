// cosmic-debugger.js
(function () {
  let debuggerVisible = false;

  // Minimal styles injected so you don't need a separate CSS file
  const DBG_CSS = `
  #cosmicDebugger {
    position: fixed;
    right: 18px;
    bottom: 18px;
    width: 520px;
    max-height: 72vh;
    background: linear-gradient(180deg, rgba(8,10,15,0.92), rgba(18,20,26,0.95));
    color: #e6eef7;
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.6);
    z-index: 100000;
    display: none;
    overflow: auto;
    font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    pointer-events: auto;
    touch-action: none;
  }
  #cosmicDebugger header { display:flex; align-items:center; justify-content:space-between; padding:8px 10px; cursor:grab; border-bottom: 1px solid rgba(255,255,255,0.03); }
  #cosmicDebugger header span { font-weight:600; font-size:14px; }
  #cosmicDebugger header button { background:transparent; color:#f88; border:none; font-size:16px; cursor:pointer; padding:6px; }
  #cosmicDebugger nav { display:flex; gap:6px; padding:8px 10px; border-bottom: 1px solid rgba(255,255,255,0.03); }
  .tabBtn { background: rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.04); color:#dfeffd; padding:6px 8px; border-radius:8px; cursor:pointer; font-size:13px; }
  .tabBtn.active { background: linear-gradient(90deg,#153e7a,#1b7a5a); box-shadow: 0 6px 18px rgba(16,24,40,0.6); }
  .debugger-tab { padding:10px; display:none; font-size:13px; line-height:1.35; color:#dceefb; }
  .debugger-tab.active { display:block; }
  #debugLog { background:rgba(0,0,0,0.25); padding:10px; border-radius:6px; max-height:44vh; overflow:auto; white-space:pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace; font-size:12px; color:#cfeeff; }
  #cosmicToggleBtn { position: fixed; right: 18px; bottom: 100px; z-index:100001; width:44px; height:44px; border-radius:10px; background: linear-gradient(180deg,#ffdd57,#ff9b57); border:none; box-shadow:0 6px 16px rgba(0,0,0,0.35); font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
  #cosmicDebugger ul { padding-left:18px; margin:8px 0; }
  #cosmicDebugger li { margin:4px 0; }
  `;

  function injectStyles() {
    if (document.getElementById("cosmicDebuggerStyle")) return;
    const s = document.createElement("style");
    s.id = "cosmicDebuggerStyle";
    s.textContent = DBG_CSS;
    document.head.appendChild(s);
  }

  function createDebugger() {
    if (document.getElementById("cosmicDebugger")) return;

    injectStyles();

    const dbg = document.createElement("div");
    dbg.id = "cosmicDebugger";
    dbg.innerHTML = `
      <header>
        <span>Debugger - ${ (window.location.pathname.split("/").pop() || window.location.hostname) }</span>
        <button id="cosmicClose" title="Close">✖</button>
      </header>
      <nav>
        <button class="tabBtn active" data-tab="logs">Logs</button>
        <button class="tabBtn" data-tab="resources">Resources</button>
        <button class="tabBtn" data-tab="styles">Styles</button>
        <button class="tabBtn" data-tab="system">System</button>
      </nav>
      <div class="debugger-tab active" id="tab-logs">
        <pre id="debugLog">[Debugger initialized]</pre>
      </div>
      <div class="debugger-tab" id="tab-resources"></div>
      <div class="debugger-tab" id="tab-styles"></div>
      <div class="debugger-tab" id="tab-system"></div>
    `;
    // ensure body exists (if script placed early)
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => document.body.appendChild(dbg));
    } else {
      document.body.appendChild(dbg);
    }

    // Close button
    document.getElementById("cosmicClose").onclick = () => dbg.style.display = "none";

    // Tabs
    dbg.querySelectorAll(".tabBtn").forEach(btn => {
      btn.addEventListener("click", () => {
        dbg.querySelectorAll(".tabBtn").forEach(b => b.classList.remove("active"));
        dbg.querySelectorAll(".debugger-tab").forEach(tab => tab.classList.remove("active"));
        btn.classList.add("active");
        const tb = dbg.querySelector("#tab-" + btn.dataset.tab);
        if (tb) tb.classList.add("active");
        // live-update when user switches tabs
        if (btn.dataset.tab === "resources") updateResources();
        if (btn.dataset.tab === "styles") updateStyles();
        if (btn.dataset.tab === "system") updateSystem();
      });
    });

// ----- Dragging (mouse + touch friendly) -----
    const header = dbg.querySelector("header");
    let isDragging = false;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    function onDragStart(clientX, clientY) {
      isDragging = true;
      // if the element has not been positioned already, use current offset
      startX = clientX;
      startY = clientY;
      startLeft = dbg.offsetLeft;
      startTop = dbg.offsetTop;
      // ensure we're using left/top coordinates while dragging
      dbg.style.right = "auto";
      dbg.style.bottom = "auto";
      dbg.style.left = startLeft + "px";
      dbg.style.top = startTop + "px";
      header.style.cursor = "grabbing";
    }

    function onDragMove(clientX, clientY) {
      if (!isDragging) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      dbg.style.left = (startLeft + dx) + "px";
      dbg.style.top = (startTop + dy) + "px";
    }

    function onDragEnd() {
      isDragging = false;
      header.style.cursor = "grab";
    }

    // Mouse
    header.addEventListener("mousedown", (e) => {
      e.preventDefault();
      onDragStart(e.clientX, e.clientY);
    });
    document.addEventListener("mousemove", (e) => {
      onDragMove(e.clientX, e.clientY);
    });
    document.addEventListener("mouseup", (e) => {
      if (isDragging) onDragEnd();
    });

    // Touch (mobile)
    header.addEventListener("touchstart", (e) => {
      if (e.touches && e.touches.length) {
        const t = e.touches[0];
        onDragStart(t.clientX, t.clientY);
        e.preventDefault();
      }
    }, { passive: false });

    document.addEventListener("touchmove", (e) => {
      if (isDragging && e.touches && e.touches.length) {
        const t = e.touches[0];
        onDragMove(t.clientX, t.clientY);
        e.preventDefault();
      }
    }, { passive: false });

    document.addEventListener("touchend", (e) => {
      if (isDragging) onDragEnd();
    }, { passive: false });


    // initial loads
    updateResources();
    updateSystem();
    updateStyles();
  }

  function toggleDebugger(show) {
    createDebugger();
    const dbg = document.getElementById("cosmicDebugger");
    if (!dbg) return;
    // if explicit boolean provided, use it; otherwise toggle
    debuggerVisible = (typeof show === "boolean") ? show : !debuggerVisible;
    dbg.style.display = debuggerVisible ? "block" : "none";
  }

  // Hotkey: Ctrl+M (works on most platforms)
  document.addEventListener("keydown", e => {
    // ignore when typing in inputs
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) return;
    if (e.ctrlKey && e.key && e.key.toLowerCase() === "m") {
      toggleDebugger();
    }
  });

  // Hidden toggle button (append after DOM ready)
  function createToggleButton() {
    if (document.getElementById("cosmicToggleBtn")) return;
    const toggleBtn = document.createElement("button");
    toggleBtn.id = "cosmicToggleBtn";
    toggleBtn.title = "Open Debugger (Ctrl+M)";
    toggleBtn.innerText = "🐞";
    toggleBtn.onclick = () => toggleDebugger();
    // small long-press to avoid accidental taps (optional)
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => document.body.appendChild(toggleBtn));
    } else {
      document.body.appendChild(toggleBtn);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createToggleButton);
  } else {
    createToggleButton();
  }

  // Helpers
  function log(msg) {
    try {
      createDebugger();
      const logBox = document.getElementById("debugLog");
      if (logBox) {
        logBox.textContent += "\n" + String(msg);
        logBox.scrollTop = logBox.scrollHeight;
      }
    } catch (err) { /* ignore */ }
    console.log("%c[Debugger]", "color:#0ff;", msg);
  }

  function updateResources() {
    const resTab = document.getElementById("tab-resources");
    if (!resTab) return;
    let html = "<h3>Resources</h3><ul>";
    document.querySelectorAll("script[src]").forEach(s => {
      html += `<li>JS: ${s.src}</li>`;
    });
    document.querySelectorAll("link[rel=stylesheet]").forEach(l => {
      html += `<li>CSS: ${l.href}</li>`;
    });
    // show inline scripts count
    const inlineScripts = document.querySelectorAll("script:not([src])").length;
    html += `<li>Inline scripts: ${inlineScripts}</li>`;
    html += "</ul>";
    resTab.innerHTML = html;
  }

  function updateStyles() {
    const stylesTab = document.getElementById("tab-styles");
    if (!stylesTab) return;
    let html = "<h3>Stylesheets</h3><ul>";
    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        const href = document.styleSheets[i].href || "[inline / cross-origin]";
        html += `<li>${href}</li>`;
      } catch (err) {
        html += `<li>[inaccessible stylesheet]</li>`;
      }
    }
    html += "</ul>";
    stylesTab.innerHTML = html;
  }

  function updateSystem() {
    const sysTab = document.getElementById("tab-system");
    if (!sysTab) return;
    const mem = navigator.deviceMemory ? navigator.deviceMemory + " GB (approx)" : "N/A";
    sysTab.innerHTML = `
      <h3>System Info</h3>
      <ul>
        <li>User Agent: ${navigator.userAgent}</li>
        <li>Memory (approx): ${mem}</li>
        <li>Platform: ${navigator.platform}</li>
        <li>Language: ${navigator.language}</li>
        <li>Online: ${navigator.onLine ? 'Yes' : 'No'}</li>
      </ul>
    `;
  }

  // Expose API
  window.cosmicDebugger = {
    log,
    toggleDebugger,
    createDebugger,
    updateResources,
    updateStyles,
    updateSystem
  };

})();