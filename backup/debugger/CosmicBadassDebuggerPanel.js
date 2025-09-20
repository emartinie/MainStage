class Debugger {
  static panel = null;
  static tabs = {};
  static activeTab = 'Logs';

  static init() {
    if (this.panel) return;

    // Create panel
    this.panel = document.createElement('div');
    this.panel.id = 'debuggerPanel';

    // Header
    const header = document.createElement('div');
    header.className = 'debugger-header';
    header.innerHTML = <span>Cosmic Debugger</span><button id="dbgCloseBtn">✖</button>;
    this.panel.appendChild(header);

    document.body.appendChild(this.panel);

    // Close button
    document.getElementById('dbgCloseBtn').addEventListener('click', () => {
      this.panel.style.display = 'none';
    });

    // Dragging
    this.makeDraggable(this.panel, header);

    // Tabs
    const tabsDiv = document.createElement('div');
    tabsDiv.className = 'debugger-tabs';
    ['Logs','Player','Memory','Deps'].forEach(name => {
      const tabBtn = document.createElement('div');
      tabBtn.className = 'debugger-tab';
      tabBtn.innerText = name;
      tabBtn.addEventListener('click', () => this.showTab(name));
      tabsDiv.appendChild(tabBtn);
      this.tabs[name] = document.createElement('div');
      this.tabs[name].className = 'debugger-content';
      this.tabs[name].style.display = 'none';
      this.panel.appendChild(this.tabs[name]);
    });
    this.panel.insertBefore(tabsDiv, this.panel.children[1]);

    this.showTab('Logs');
    this.log('Debugger initialized.');
  }

  static makeDraggable(el, handle) {
    let posX = 0, posY = 0, mouseX = 0, mouseY = 0;
    handle.onmousedown = dragMouseDown;
    function dragMouseDown(e) {
      e.preventDefault();
      mouseX = e.clientX;
      mouseY = e.clientY;
      document.onmouseup = closeDrag;
      document.onmousemove = elementDrag;
    }
    function elementDrag(e) {
      e.preventDefault();
      posX = mouseX - e.clientX;
      posY = mouseY - e.clientY;
      mouseX = e.clientX;
      mouseY = e.clientY;
      el.style.top = (el.offsetTop - posY) + "px";
      el.style.left = (el.offsetLeft - posX) + "px";
    }
    function closeDrag() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  static showTab(name) {
    Object.keys(this.tabs).forEach(k => this.tabs[k].style.display = 'none');
    Object.values(document.querySelectorAll('.debugger-tab')).forEach(t => t.classList.remove('active'));
    this.tabs[name].style.display = 'block';
    [...document.querySelectorAll('.debugger-tab')].find(t => t.innerText===name)?.classList.add('active');
    this.activeTab = name;
  }

  static log(msg) {
    if (!this.tabs['Logs']) return;
    const entry = document.createElement('div');
    entry.className = 'debugger-log';
    entry.textContent = [${new Date().toLocaleTimeString()}] ${msg};
    this.tabs['Logs'].appendChild(entry);
    this.tabs['Logs'].scrollTop = this.tabs['Logs'].scrollHeight;
  }

  static show() {
    this.init();
    this.panel.style.display = 'flex';
  }

  // Example hooks
  static addPlayerDebug(msg) {
    if (!this.tabs['Player']) return;
    const entry = document.createElement('div');
    entry.className = 'debugger-log';
    entry.textContent = msg;
    this.tabs['Player'].appendChild(entry);
  }

  static addMemoryDebug(msg) {
    if (!this.tabs['Memory']) return;
    const entry = document.createElement('div');
    entry.className = 'debugger-log';
    entry.textContent = msg;
    this.tabs['Memory'].appendChild(entry);
  }

  static addDepsDebug(msg) {
    if (!this.tabs['Deps']) return;
    const entry = document.createElement('div');
    entry.className = 'debugger-log';
    entry.textContent = msg;
    this.tabs['Deps'].appendChild(entry);
  }
}

// Auto-init optional
window.addEventListener('DOMContentLoaded', () => {
  Debugger.show();
  Debugger.log('Cosmic badass debugger ready.');
});