class DebuggerPanel {
  constructor() {
    if (document.getElementById("debuggerPanel")) return;
    this.logs = [];
    this.createPanel();
    this.hookConsole();
    this.hookEvents();
    this.updateMemoryStorage();
  }

  createPanel() {
    const panel = document.createElement("div");
    panel.id = "debuggerPanel";
    panel.style.cssText = `
      position:fixed; bottom:0; right:0; width:320px; max-height:50%;
      background:rgba(15,15,30,0.9); backdrop-filter:blur(10px);
      color:#fff; font-family:monospace; font-size:12px;
      border-radius:12px 12px 0 0; z-index:99999;
      display:flex; flex-direction:column; overflow:hidden;
    `;

    // Header
    const header = document.createElement("div");
    header.innerHTML = `<strong>🌌 Cosmic Debugger</strong>
      <button id="dbgClose" style="float:right;">✖</button>`;
    header.style.cssText = "padding:6px; background:rgba(30,30,50,0.9); cursor:move;";
    panel.appendChild(header);

    document.body.appendChild(panel);
    header.querySelector("#dbgClose").addEventListener("click", () => panel.remove());

    // Tabs container
    const tabs = document.createElement("div");
    tabs.style.cssText = "flex:1; overflow:auto; padding:6px;";
    panel.appendChild(tabs);
    this.tabs = tabs;

    // Add sections
    this.createSection("Logs");
    this.createSection("Player");
    this.createSection("Memory/Storage");
    this.createSection("Dependencies");
  }

  createSection(name) {
    const sec = document.createElement("div");
    sec.id = dbg-${name.replace(/\s/g,"")};
    sec.innerHTML = <h4 style="margin:4px 0;">${name}</h4><div class="content" style="max-height:150px; overflow:auto; background:rgba(0,0,0,0.2); border-radius:6px; padding:4px;"></div>;
    this.tabs.appendChild(sec);
  }

  hookConsole() {
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog.apply(console, args);
      this.logs.push(args.join(" "));
      const logDiv = this.tabs.querySelector("#dbg-Logs .content");
      if (logDiv) {
        const el = document.createElement("div");
        el.textContent = args.join(" ");
        logDiv.appendChild(el);
        logDiv.scrollTop = logDiv.scrollHeight;
      }
    };
  }

  hookEvents() {
    window.addEventListener("player:updatePlaylist", (e) => {
      const sec = this.tabs.querySelector("#dbg-Player .content");
      if (sec) sec.textContent = JSON.stringify(e.detail.playlist, null, 2);
    });
  }

  updateMemoryStorage() {
    const memSec = this.tabs.querySelector("#dbg-Memory/Storage .content");
    if (!memSec) return;
    const update = async () => {
      let usage = "N/A", quota = "N/A";
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        usage = est.usage;
        quota = est.quota;
      }
      let heap = "N/A";
      if (performance.memory) heap = Used: ${performance.memory.usedJSHeapSize};
      memSec.textContent = Storage Usage: ${usage} / ${quota}\nJS Heap: ${heap};
      setTimeout(update, 2000);
    };
    update();
  }

  show() {
    const panel = document.getElementById("debuggerPanel");
    if (panel) panel.style.display = "flex";
  }
}

// Auto attach
window.Debugger = new DebuggerPanel();