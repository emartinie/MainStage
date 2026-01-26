// /js/core/debugger.js
// Cosmic Debugger — core version

import { getResourceState } from "./resourceManager.js";

class CosmicDebugger {
  constructor() {
    this.panel = null;
    this.tabs = {};
    this.activeTab = "Logs";
    this.logBuffer = [];
  }

  init() {
    if (this.panel) return;
    this.createPanel();
    this.hookErrors();
    this.log("Debugger initialized.");
  }

  createPanel() {
    const panel = document.createElement("div");
    panel.id = "cosmic-debugger";

    panel.innerHTML = `
      <div class="dbg-header">
        <span>🌌 Cosmic Debugger</span>
        <button id="dbg-close">✖</button>
      </div>
      <div class="dbg-tabs"></div>
      <div class="dbg-body"></div>
    `;

    document.body.appendChild(panel);
    this.panel = panel;

    const tabs = ["Logs", "Resources"];
    const tabBar = panel.querySelector(".dbg-tabs");
    const body = panel.querySelector(".dbg-body");

    tabs.forEach(name => {
      const tabBtn = document.createElement("button");
      tabBtn.textContent = name;
      tabBtn.className = "dbg-tab";
      tabBtn.addEventListener("click", () => this.showTab(name));
      tabBar.appendChild(tabBtn);

      const content = document.createElement("div");
      content.className = "dbg-content";
      content.dataset.tab = name;
      content.style.display = "none";
      body.appendChild(content);

      this.tabs[name] = content;
    });

    panel.querySelector("#dbg-close").onclick = () => {
      panel.style.display = "none";
    };

    this.makeDraggable(panel, panel.querySelector(".dbg-header"));
    this.showTab("Logs");
  }

  makeDraggable(el, handle) {
    let startX = 0, startY = 0, dx = 0, dy = 0;

    handle.addEventListener("mousedown", e => {
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", stop);
    });

    function drag(e) {
      dx = startX - e.clientX;
      dy = startY - e.clientY;
      startX = e.clientX;
      startY = e.clientY;
      el.style.top = el.offsetTop - dy + "px";
      el.style.left = el.offsetLeft - dx + "px";
    }

    function stop() {
      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", stop);
    }
  }

  showTab(name) {
    Object.values(this.tabs).forEach(t => (t.style.display = "none"));
    if (!this.tabs[name]) return;
    this.tabs[name].style.display = "block";
    this.activeTab = name;

    if (name === "Resources") {
      this.renderResources();
    }
  }

  log(msg) {
    const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
    this.logBuffer.push(line);

    const logs = this.tabs["Logs"];
    if (!logs) return;

    const div = document.createElement("div");
    div.textContent = line;
    logs.appendChild(div);
    logs.scrollTop = logs.scrollHeight;
  }

  renderResources() {
    const resTab = this.tabs["Resources"];
    if (!resTab) return;

    resTab.innerHTML = "";
    const list = getResourceState();

    list.forEach(r => {
      const row = document.createElement("div");
      row.textContent = `${r.name}: ${r.active ? "ACTIVE" : "inactive"}`;
      resTab.appendChild(row);
    });
  }

  hookErrors() {
    window.addEventListener("error", e => {
      this.log("JS ERROR: " + e.message);
    });

    window.addEventListener("unhandledrejection", e => {
      this.log("PROMISE ERROR: " + e.reason);
    });
  }

  show() {
    this.init();
    this.panel.style.display = "block";
  }

  toggle() {
    this.init();
    this.panel.style.display =
      this.panel.style.display === "none" ? "block" : "none";
  }
}

const debuggerInstance = new CosmicDebugger();
window.Debugger = debuggerInstance;

// Hotkey: Ctrl+D
document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key.toLowerCase() === "d") {
    e.preventDefault();
    debuggerInstance.toggle();
  }
});

// Auto init
window.addEventListener("DOMContentLoaded", () => {
  debuggerInstance.init();
});