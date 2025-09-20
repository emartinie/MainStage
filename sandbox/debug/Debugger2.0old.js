(() => {
  // --- your debugger logic goes here ---
/* Debugger 2.0 - drop-in module
   Hotkey: Ctrl/Cmd + Shift + D
   Toggle handle: small corner button (hidden by default style)
*/
(function () {
  if (window.__DBG_INSTALLED__) return;
  window.__DBG_INSTALLED__ = true;

  // ---------- create DOM ----------
  const handle = document.createElement("button");
  handle.id = "dbg-toggle-handle";
  handle.title = "Open Debugger (Ctrl/Cmd+Shift+D)";
  handle.innerHTML = "🐞";
  document.body.appendChild(handle);

  const panel = document.createElement("div");
  panel.id = "dbg-panel";
  panel.innerHTML = `
    <div class="dbg-header">
      <div class="title">Dev Debugger</div>
      <div class="controls">
        <button id="dbg-clear" class="dbg-btn">Clear</button>
        <button id="dbg-download" class="dbg-btn">Export</button>
        <button id="dbg-close" class="dbg-btn">Close</button>
      </div>
    </div>
    <div style="display:flex; gap:8px; padding:8px;">
      <div id="dbg-tabs" style="flex:0 0 auto;">
        <div class="dbg-tab active" data-tab="console">Console</div>
        <div class="dbg-tab" data-tab="network">Network</div>
        <div class="dbg-tab" data-tab="deps">Dependencies</div>
        <div class="dbg-tab" data-tab="env">Env</div>
      </div>
      <div style="flex:1 1 auto; display:flex; align-items:center; gap:8px;">
        <input id="dbg-filter" placeholder="filter..." style="flex:1; padding:8px; border-radius:8px; background:rgba(255,255,255,0.02); color:#dbeafe; border:1px solid rgba(255,255,255,0.03)" />
      </div>
    </div>
    <div id="dbg-body">
      <div id="dbg-console" class="dbg-list" style="display:block;"></div>
      <div id="dbg-network" class="dbg-list" style="display:none;"></div>
      <div id="dbg-deps" class="dbg-list" style="display:none;"></div>
      <div id="dbg-env" class="dbg-list" style="display:none;"></div>
    </div>
  `;
  document.body.appendChild(panel);

  // quick refs
  const $ = sel => panel.querySelector(sel);
  const consoleEl = $("#dbg-console");
  const networkEl = $("#dbg-network");
  const depsEl = $("#dbg-deps");
  const envEl = $("#dbg-env");
  const tabs = panel.querySelectorAll(".dbg-tab");
  const filterInput = panel.querySelector("#dbg-filter");
  const clearBtn = panel.querySelector("#dbg-clear");
  const downloadBtn = panel.querySelector("#dbg-download");
  const closeBtn = panel.querySelector("#dbg-close");

  // initial hidden
  panel.classList.remove("open");

  // ---------- utilities ----------
  function sanitizeText(x) {
    try { return (typeof x === "string") ? x : JSON.stringify(x); } catch (e) { return String(x); }
  }
  function elLog(parent, text, cls) {
    const node = document.createElement("div");
    node.className = "dbg-item " + (cls || "dbg-log");
    node.textContent = text;
    parent.insertBefore(node, parent.firstChild);
    return node;
  }

  // ---------- tab switching ----------
  tabs.forEach(t => t.addEventListener("click", () => {
    tabs.forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    const name = t.dataset.tab;
    consoleEl.style.display = name === "console" ? "block" : "none";
    networkEl.style.display = name === "network" ? "block" : "none";
    depsEl.style.display = name === "deps" ? "block" : "none";
    envEl.style.display = name === "env" ? "block" : "none";
    filterInput.value = "";
  }));

  // ---------- show/hide ----------
  function openPanel() { panel.classList.add("open"); handle.classList.add("hidden"); refreshDeps(); refreshEnv(); }
  function closePanel() { panel.classList.remove("open"); handle.classList.remove("hidden"); }
  handle.addEventListener("click", () => { panel.classList.toggle("open"); handle.classList.toggle("hidden"); if (panel.classList.contains("open")) { refreshDeps(); refreshEnv(); } });
  closeBtn.addEventListener("click", closePanel);

  // hotkey (Ctrl/Cmd + Shift + D)
  window.addEventListener("keydown", (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.shiftKey && ev.key.toLowerCase() === "d") {
      ev.preventDefault();
      panel.classList.toggle("open");
      handle.classList.toggle("hidden");
      if (panel.classList.contains("open")) refreshDeps(), refreshEnv();
    }
  });

  // ---------- capture console ----------
  (function captureConsole() {
    const orig = { log: console.log, warn: console.warn, error: console.error, info: console.info, debug: console.debug };
    ["log", "warn", "error", "info", "debug"].forEach(fn => {
      console[fn] = function (...args) {
        try {
          const txt = args.map(a => (typeof a === "string") ? a : JSON.stringify(a, null, 2)).join(" ");
          const cls = fn === "warn" ? "dbg-warn" : (fn === "error" ? "dbg-error" : "dbg-log");
          elLog`(consoleEl, [${fn.toUpperCase()}] ${txt}, cls)`;
        } catch (e) {
          elLog`(consoleEl, [${fn.toUpperCase()}] (unserializable), "dbg-log")`;
        }
        orig[fn].apply(console, args);
      };
    });
  })();

  // ---------- global error handlers ----------
  window.addEventListener("error", (ev) => {
    elLog`(consoleEl, [ERROR] ${ev.message} @ ${ev.filename}:${ev.lineno}:${ev.colno}, "dbg-error")`;
  });
  window.addEventListener("unhandledrejection", (ev) => {
    elLog`(consoleEl, [UNHANDLED PROMISE] ${sanitizeText(ev.reason)}, "dbg-error");
  });

  // ---------- network capture: fetch + XHR ----------
  (function captureNetwork() {
    // fetch
    if (window.fetch) {
      const origFetch = window.fetch;
      window.fetch = function (...args) {
        const url = (args && args[0]) ? args[0].toString() : "unknown";
        const meta = [FETCH] ${new Date().toLocaleTimeString()} ${url};
        elLog(networkEl, meta);
        return origFetch.apply(this, args).then(res => {
          elLog(networkEl, ${meta} -> ${res.status} ${res.statusText});
          return res;
        }).catch(err => {
          elLog(networkEl, ${meta} -> ERROR ${err}, "dbg-error");
          throw err;
        });
      };
    }
    // XMLHttpRequest
    const origX = window.XMLHttpRequest;
    function XHRProxy() {
      const xhr = new origX();
      const _open = xhr.open;
      xhr.open = function (method, url) {
        this.__dbg_url = url;
        return _open.apply(this, arguments);
      };
      xhr.addEventListener("loadend", function () {
        elLog(networkEl, [XHR] ${new Date().toLocaleTimeString()} ${this.__dbg_url} -> ${this.status});
      });
      xhr.addEventListener("error", function () {
        elLog(networkEl, [XHR ERROR] ${this.__dbg_url}, "dbg-error");
      });
      return xhr;
    }
    window.XMLHttpRequest = XHRProxy;
  })();

  // ---------- dependencies listing ----------
  function refreshDeps() {
    depsEl.innerHTML = "";
    const scripts = Array.from(document.scripts || []).map(s => ({ src: s.src, inline: !s.src }));
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => ({ href: l.href || "", media: l.media || "" }));
    elLog(depsEl, Scripts (${scripts.length}):);
    scripts.slice().reverse().forEach(s => elLog(depsEl,  • ${s.src || "(inline script)"}${s.inline ? " [inline]" : ""}));
    elLog(depsEl, Stylesheets (${links.length}):);
    links.slice().reverse().forEach(l => elLog(depsEl,  • ${l.href || "(inline style)"} ${l.media ? "(" + l.media + ")" : ""}));
    // detect duplicates / missing
    const srcs = scripts.map(s => s.src).filter(Boolean);
    const dup = srcs.filter((v,i,a)=> a.indexOf(v)!==i);
    if (dup.length) elLog(depsEl, ⚠ Duplicate scripts detected: ${[...new Set(dup)].join(", ")}, "dbg-warn");
  }

  // ---------- env info ----------
  async function refreshEnv() {
    envEl.innerHTML = "";
    try {
      elLog(envEl, UA: ${navigator.userAgent});
      elLog(envEl, Platform: ${navigator.platform}, Languages: ${navigator.languages && navigator.languages.join(", ")});
      elLog(envEl, Screen: ${screen.width}x${screen.height} (avail ${screen.availWidth}x${screen.availHeight}));
      if (navigator.deviceMemory) elLog(envEl, deviceMemory (GB): ${navigator.deviceMemory});
      if (navigator.hardwareConcurrency) elLog(envEl, CPUs: ${navigator.hardwareConcurrency});
      if (navigator.connection) elLog(envEl, Network: ${navigator.connection.effectiveType} down:${navigator.connection.downlink});
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        elLog(envEl, Storage - usage: ${est.usage || 0} / quota: ${est.quota || 0} (bytes));
      }
      elLog(envEl, Location: ${location.href});
    } catch (e) {
      elLog(envEl, Env read error: ${e}, "dbg-error");
    }
  }

  // ---------- console controls ----------
  clearBtn.addEventListener("click", () => { consoleEl.innerHTML = ""; networkEl.innerHTML = ""; depsEl.innerHTML = ""; envEl.innerHTML = ""; });
  downloadBtn.addEventListener("click", () => {
    const payload = {
      console: Array.from(consoleEl.children).map(n => n.textContent),
      network: Array.from(networkEl.children).map(n => n.textContent),
      deps: Array.from(depsEl.children).map(n => n.textContent),
      env: Array.from(envEl.children).map(n => n.textContent),
      url: location.href,
      ts: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = dbg-${(new Date()).toISOString()}.json;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  // ---------- filter input ----------
  filterInput.addEventListener("input", () => {
    const q = filterInput.value.toLowerCase().trim();
    [consoleEl, networkEl, depsEl, envEl].forEach(container => {
      Array.from(container.children).forEach(child => {
        child.style.display = (!q || child.textContent.toLowerCase().includes(q)) ? "" : "none";
      });


  // ---------- expose quick API ----------
  window.__DBG = window.__DBG || {};
  window.__DBG.open = openPanel;
  window.__DBG.close = closePanel;
  window.__DBG.log = (m) => elLog(consoleEl, sanitizeText(m));
  window.__DBG.refreshDeps = refreshDeps;
  window.__DBG.refreshEnv = refreshEnv;}
  // Example: safe test log
  console.log("Debugger loaded");

})(); // <-- this closes the IIFE wrapper