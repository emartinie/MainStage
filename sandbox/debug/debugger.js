// /debug/debugger.js
(function () {
  if (window.__DEBUGGER__) return;
  window.__DEBUGGER__ = true;

  // Inject CSS dynamically
  const style = document.createElement("style");
  style.textContent = `
    #debug-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 200px;
      background: rgba(20,20,20,0.95);
      color: #eee;
      font-family: monospace;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      border-top: 2px solid #555;
      z-index: 9999;
    }
    #debug-output {
      flex: 1;
      overflow-y: auto;
      padding: 5px;
    }
    #debug-controls {
      padding: 4px;
      background: #222;
      text-align: right;
    }
    #debug-controls button {
      margin-left: 5px;
      background: #444;
      color: #eee;
      border: none;
      padding: 2px 6px;
      cursor: pointer;
    }
    #debug-controls button:hover {
      background: #666;
    }
    .debug-line.info { color: #8cf; }
    .debug-line.success { color: #6f6; }
    .debug-line.warn { color: #fc3; }
    .debug-line.error { color: #f66; }
  `;
  document.head.appendChild(style);

  // Create debug panel
  const panel = document.createElement("div");
  panel.id = "debug-panel";
  panel.innerHTML = `
    <div id="debug-output"></div>
    <div id="debug-controls">
      <span style="float:left;color:#999;">Press <b>Ctrl+D</b> to toggle</span>
      <button onclick="debugClear()">Clear</button>
      <button onclick="debugToggle()">Hide</button>
    </div>
  `;
  document.body.appendChild(panel);

  // Debug functions
  window.debugLog = function (msg, level = "info") {
    const el = document.createElement("div");
    el.className = "debug-line " + level;
    el.textContent = [${new Date().toLocaleTimeString()}] ${msg};
    document.getElementById("debug-output").appendChild(el);
    document.getElementById("debug-output").scrollTop =
      document.getElementById("debug-output").scrollHeight;
  };

  window.debugClear = function () {
    document.getElementById("debug-output").innerHTML = "";
  };

  window.debugToggle = function () {
    panel.style.display =
      panel.style.display === "none" ? "block" : "none";
  };

  // Global error hooks
  window.onerror = (msg, src, line, col, err) => {
    debugLog(ERROR: ${msg} @ ${line}:${col}, "error");
  };
  window.onunhandledrejection = (e) => {
    debugLog(Unhandled Promise: ${e.reason}, "error");
  };

  // Hotkey: Ctrl+D
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "d") {
      e.preventDefault();
      window.debugToggle();
    }
  });

  debugLog("Debugger loaded! Press Ctrl+D to toggle.", "success");
})();

// === Debugger Access Shortcuts ===

// 1. Secret Tap Corner with Flash Indicator
(function () {
  const hotspot = document.createElement("div");
  hotspot.style.position = "fixed";
  hotspot.style.bottom = "0";
  hotspot.style.right = "0";
  hotspot.style.width = "40px";
  hotspot.style.height = "40px";
  hotspot.style.zIndex = "10000";
  hotspot.style.background = "rgba(255,0,0,0.3)"; // start visible (red tint)

  hotspot.addEventListener("click", () => {
    console.log("[Debugger] Hotspot tapped – toggling debugger");
    if (typeof debugToggle === "function") debugToggle();
  });

  document.body.appendChild(hotspot);

  // Flash red once then go invisible
  setTimeout(() => {
    hotspot.style.background = "transparent";
  }, 500); // half second
})();

// 2. URL Trigger (?debug=true)
(function () {
  if (location.search.includes("debug=true")) {
    console.log("[Debugger] URL param detected – opening debugger automatically");
    setTimeout(() => {
      if (typeof debugToggle === "function") debugToggle();
    }, 300);
  }

/ Make panel draggable
let isDragging = false, startX, startY;
panel.addEventListener("mousedown", e => { isDragging = true; startX = e.clientX - panel.offsetLeft; startY = e.clientY - panel.offsetTop; });
panel.addEventListener("touchstart", e => { isDragging = true; const t = e.touches[0]; startX = t.clientX - panel.offsetLeft; startY = t.clientY - panel.offsetTop; });
window.addEventListener("mousemove", e => { if(isDragging){ panel.style.left = (e.clientX - startX) + "px"; panel.style.top = (e.clientY - startY) + "px"; } });
window.addEventListener("touchmove", e => { if(isDragging){ const t = e.touches[0]; panel.style.left = (t.clientX - startX) + "px"; panel.style.top = (t.clientY - startY) + "px"; } });
window.addEventListener("mouseup", () => { isDragging = false; });
window.addEventListener("touchend", () => { isDragging = false; });

// Make panel resizable (bottom-right corner)
const resizer = document.createElement("div");
resizer.style.width = resizer.style.height = "20px";
resizer.style.position = "absolute";
resizer.style.right = "0"; resizer.style.bottom = "0";
resizer.style.cursor = "nwse-resize";
resizer.style.background = "rgba(255,255,255,0.3)";
panel.appendChild(resizer);

let isResizing = false;
resizer.addEventListener("mousedown", e => { isResizing = true; e.stopPropagation(); });
resizer.addEventListener("touchstart", e => { isResizing = true; e.stopPropagation(); });
window.addEventListener("mousemove", e => { if(isResizing){ panel.style.width = e.clientX - panel.offsetLeft + "px"; panel.style.height = e.clientY - panel.offsetTop + "px"; }});
window.addEventListener("touchmove", e => { if(isResizing){ const t = e.touches[0]; panel.style.width = t.clientX - panel.offsetLeft + "px"; panel.style.height = t.clientY - panel.offsetTop + "px"; }});
window.addEventListener("mouseup", () => { isResizing = false; });
window.addEventListener("touchend", () => { isResizing = false; });
})();