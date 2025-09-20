(() => {
  // ========== STATE ==========
  let panelVisible = false;
  let panel;

  // ========== CREATE PANEL ==========
  function createPanel() {
    if (panel) return panel;

    panel = document.createElement("div");
    panel.id = "customDebugger";
    panel.innerHTML = `
      <style>
        #customDebugger {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          max-height: 40%;
          background: rgba(17, 25, 40, 0.9);
          backdrop-filter: blur(15px);
          color: #f9fafb;
          font-family: monospace;
          font-size: 0.85rem;
          border-top: 2px solid #3b82f6;
          box-shadow: 0 -4px 30px rgba(0,0,0,0.5);
          z-index: 99999;
          display: flex;
          flex-direction: column;
        }
        #customDebugger header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 8px;
          background: rgba(30,41,59,0.9);
          border-bottom: 1px solid #3b82f6;
          cursor: move;
        }
        #customDebugger header h3 {
          margin: 0;
          font-size: 0.9rem;
          color: #3b82f6;
        }
        #customDebuggerTabs {
          display: flex;
          background: rgba(55,65,81,0.9);
        }
        #customDebuggerTabs button {
          flex: 1;
          padding: 4px;
          border: none;
          background: transparent;
          color: #fff;
          cursor: pointer;
        }
        #customDebuggerTabs button.active {
          background: #1e40af;
        }
        #customDebuggerContent {
          flex: 1;
          overflow-y: auto;
          padding: 6px;
        }
        .debugger-log-entry {
          margin: 2px 0;
          border-bottom: 1px dashed rgba(255,255,255,0.2);
        }
        #customDebuggerActions button {
          display: block;
          width: 100%;
          margin: 4px 0;
          padding: 6px;
          background: #2563eb;
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
        }
      </style>
      <header>
        <h3>Debugger</h3>
        <button id="closeDebuggerBtn">✖</button>
      </header>
      <div id="customDebuggerTabs">
        <button data-tab="logs" class="active">Logs</button>
        <button data-tab="network">Network</button>
        <button data-tab="actions">Actions</button>
      </div>
      <div id="customDebuggerContent">
        <div id="customDebuggerLogs"></div>
        <div id="customDebuggerNetwork" style="display:none;"></div>
        <div id="customDebuggerActions" style="display:none;">
          <button id="renderWeekBtn">▶ Render Week</button>
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    // Close
    panel.querySelector("#closeDebuggerBtn").addEventListener("click", togglePanel);

    // Tabs
    const tabs = panel.querySelectorAll("#customDebuggerTabs button");
    tabs.forEach(btn => {
      btn.addEventListener("click", () => {
        tabs.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const contentDivs = panel.querySelectorAll("#customDebuggerContent > div");
        contentDivs.forEach(div => (div.style.display = "none"));
        const target = panel.querySelector`(#customDebugger${btn.dataset.tab.charAt(0).toUpperCase() + btn.dataset.tab.slice(1)})`;
        if (target) target.style.display = "block";
      });
    });

    // Example action: Render Week
    const renderBtn = panel.querySelector("#renderWeekBtn");
    if (renderBtn) {
      renderBtn.addEventListener("click", () => {
        console.log("[Debugger Action] Render Week triggered");
        // Hook into your real renderWeek() if available:
        if (typeof renderWeek === "function") renderWeek();
      });
    }

    return panel;
  }

  // ========== TOGGLE ==========
  function togglePanel() {
    if (!panel) createPanel();
    panelVisible = !panelVisible;
    panel.style.display = panelVisible ? "flex" : "none";
  }

  // ========== HOTKEY ==========
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "d") {
      e.preventDefault();
      togglePanel();
    }
  });

  // ========== SECRET TAP ==========
  let tapTimeout, tapCount = 0;
  document.body.addEventListener("click", (e) => {
    const nearBottomRight = (
      window.innerWidth - e.clientX < 60 &&
      window.innerHeight - e.clientY < 60
    );
    if (nearBottomRight) {
      tapCount++;
      clearTimeout(tapTimeout);
      tapTimeout = setTimeout(() => tapCount = 0, 400);
      if (tapCount >= 2) {
        togglePanel();
        tapCount = 0;
      }
    }
  });

  // ========== CONSOLE HOOK ==========
  const logContainer = () => panel?.querySelector("#customDebuggerLogs");
  ["log","warn","error"].forEach(level => {
    const orig = console[level];
    console[level] = (...args) => {
      orig.apply(console,args);
      const el = document.createElement("div");
      el.className = "debugger-log-entry";
      el.style.color = level === "error" ? "tomato" : level === "warn" ? "gold" : "white";
      el.textContent = [${level.toUpperCase()}] ${args.map(a => (typeof a==="object"?JSON.stringify(a):a)).join(" ")};
      logContainer()?.appendChild(el);
    };
  });

  console.log("[Debugger] Initialized. Press Ctrl+D or double-tap bottom-right to toggle.");
})();