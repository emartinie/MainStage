/* ======== MainStageManager with swipe + keyboard ======== */
       (function () {
            console.log("🎬 mainStageManager (patched) initializing...");

            class MainStageManager {
                constructor(options = {}) {
                    this.viewport = document.getElementById(options.viewportId || "viewport");
                    this.row = document.getElementById(options.rowId || "cardsRow");
                    this.cards = Array.from(this.row.children || []);
                    this.currentIndex = 0;
                    this.startX = 0;
                    this.startY = 0;
                    this.currentTranslate = 0;
                    this.isDragging = false;
                    this.threshold = options.threshold || 64; // px to trigger swipe
                    this.transitioning = false;
                    this.minMoveToConsider = options.minMoveToConsider || 10; // tiny moves ignored

                    if (!this.viewport || !this.row) {
                        console.warn("❌ Viewport or cardsRow not found.");
                        return;
                    }

                    // ensure each card has an id
                    this.cards.forEach((c, i) => {
                        if (!c.id) c.id = `card-${i}`;
                    });

                    // mark initial active card
                    this.cards.forEach((c, i) => c.classList.toggle('active', i === this.currentIndex));

                    this.updatePosition(); // position initially
                    this.bindEvents();
                    console.log("✅ MainStageManager ready (cards:", this.cards.length, ")");
                }

                bindEvents() {
                    // Touch
                    this.row.addEventListener("touchstart", (e) => {
                        const t = e.touches[0];
                        this.onDragStart(t.clientX, t.clientY);
                    }, { passive: true });

                    this.row.addEventListener("touchmove", (e) => {
                        // We need to inspect both x and y so set passive:false where needed.
                        const t = e.touches[0];
                        this.onDragMove(t.clientX, t.clientY, e);
                    }, { passive: false });

                    this.row.addEventListener("touchend", () => this.onDragEnd());

                    // Mouse (desktop)
                    let mouseDown = false;
                    this.row.addEventListener("mousedown", (e) => {
                        mouseDown = true;
                        this.onDragStart(e.clientX, e.clientY);
                    });
                    window.addEventListener("mousemove", (e) => { if (mouseDown) this.onDragMove(e.clientX, e.clientY); });
                    window.addEventListener("mouseup", (e) => { if (mouseDown) { mouseDown = false; this.onDragEnd(); } });

                    // Keyboard
                    window.addEventListener("keydown", (e) => {
                        if (e.key === "ArrowLeft") this.prev();
                        if (e.key === "ArrowRight") this.next();
                    });

                    // Resize: recalc transform
                    window.addEventListener("resize", () => this.updatePosition());

                    // Wire header buttons (previous / next) inside any card header
                    // Use event delegation to avoid adding listeners to every button
                    this.viewport.addEventListener("click", (e) => {
                        const p = e.target.closest('.prev-card-btn');
                        const n = e.target.closest('.next-card-btn');
                        if (p) { this.prev(); return; }
                        if (n) { this.next(); return; }
                    });

                    // keep cards list current if other code adds smaller elements
                    const observer = new MutationObserver(() => {
                        this.cards = Array.from(this.row.children || []);
                    });
                    observer.observe(this.row, { childList: true, subtree: false });
                }

                onDragStart(clientX, clientY) {
                    if (this.transitioning) return;
                    this.isDragging = true;
                    this.startX = clientX;
                    this.startY = clientY;
                    // clear transition to allow following finger
                    this.row.style.transition = "none";
                    // compute initial translate
                    const width = this.viewport.clientWidth;
                    this.currentTranslate = -this.currentIndex * width;
                }

                onDragMove(clientX, clientY, originalEvent) {
                    if (!this.isDragging) return;

                    const dx = clientX - this.startX;
                    const dy = clientY - this.startY;

                    // if vertical move dominates, let native vertical scroll happen
                    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
                        // allow vertical scroll; cancel horizontal dragging
                        return;
                    }

                    const width = this.viewport.clientWidth;
                    this.currentTranslate = -this.currentIndex * width + dx;
                    this.row.style.transform = `translateX(${this.currentTranslate}px)`;

                    // Prevent page scrolling once we determined it's a horizontal drag
                    if (originalEvent && Math.abs(dx) > 6) {
                        originalEvent.preventDefault();
                    }
                }

                onDragEnd() {
                    if (!this.isDragging) return;
                    this.isDragging = false;

                    const width = this.viewport.clientWidth;
                    // dx is how far finger moved horizontally from start
                    const dx = this.currentTranslate + this.currentIndex * width; // positive when dragged right

                    // IGNORE tiny moves (taps/clicks)
                    if (Math.abs(dx) < this.minMoveToConsider) {
                        this.goTo(this.currentIndex);
                        return;
                    }

                    if (dx > this.threshold) {
                        this.prev();
                    } else if (dx < -this.threshold) {
                        this.next();
                    } else {
                        this.goTo(this.currentIndex);
                    }
                }

                // choose a random animation class (keeps CSS small)
                _pickRandomAnim() {
                    const arr = ['anim-slide', 'anim-fade', 'anim-scale', 'anim-spring'];
                    const idx = Math.floor(Math.random() * arr.length);
                    return arr[idx];
                }

                updatePosition() {
                    const width = this.viewport.clientWidth;
                    // ensure we always have some transition for snap-backs
                    this.row.style.transition = "transform .38s cubic-bezier(.22,.61,.36,1)";
                    this.row.style.transform = `translateX(${-this.currentIndex * width}px)`;
                    // mark active card for CSS hooks
                    this.cards.forEach((c, i) => c.classList.toggle('active', i === this.currentIndex));
                }

                registerCard(cardId) {
                    const el = document.getElementById(cardId);
                    if (!el) {
                        console.warn("⚠ registerCard: not found", cardId);
                        return;
                    }
                    if (!this.cards.includes(el)) {
                        this.cards.push(el);
                        //this.row.appendChild(el);
                    }
                }

                showCard(cardId) {
                    const idx = this.cards.findIndex(c => c.id === cardId);
                    if (idx === -1) {
                        console.warn("⚠ showCard: not found", cardId);
                        return;
                    }
                    this.goTo(idx);
                }

                goTo(index) {
                    if (index < 0) index = 0;
                    if (index >= this.cards.length) index = this.cards.length - 1;
                    if (index === this.currentIndex) {
                        this.updatePosition();
                        return;
                    }

                    this.currentIndex = index;
                    this.transitioning = true;

                    // randomized animation class: add to viewport wrapper (only briefly)
                    const anim = this._pickRandomAnim();
                    // remove any previous animation classes
                    ['anim-slide', 'anim-fade', 'anim-scale', 'anim-spring'].forEach(c => document.body.classList.remove(c));
                    document.body.classList.add(anim);

                    // Force layout read so the class take effect before transform (helps with CSS transitions)
                    void this.row.offsetWidth;

                    // update transform
                    this.updatePosition();

                    // clear animation class after transition completes
                    setTimeout(() => {
                        document.body.classList.remove(anim);
                        this.transitioning = false;
                    }, 620); // a little more than CSS durations to be safe
                }

                next() { this.goTo(this.currentIndex + 1); }
                prev() { this.goTo(this.currentIndex - 1); }
                getCurrentCard() { return this.cards[this.currentIndex]?.id || null; }
                getCurrentIndex() { return this.currentIndex; }
            }

            // expose singleton (if one already exists, preserve it)
            if (window.mainStageManager && window.mainStageManager instanceof MainStageManager) {
                console.log("MainStageManager already present — skipping re-init.");
            } else {
                window.mainStageManager = new MainStageManager({ viewportId: "viewport", rowId: "cardsRow", threshold: 64 });
            }

            // convenience: expose small helpers (keeps older API)
            window.mainStageManager.registerCards = function (ids) {
                ids.forEach(id => window.mainStageManager.registerCard(id));
            };

            // small helper: fade out swipe hint after a few seconds
            (function hideSwipeHint() {
                const hint = document.getElementById('swipeHint');
                if (!hint) return;
                setTimeout(() => hint.classList.add('hidden'), 3000);
            })();

             // dynamic tabbar wiring (create tabs & wire to manager)
  (function buildTabBar(){
    const friendlyNames = {
      "mainStageCard": "Main Stage",
      "articleList": "Articles",
      "studyContent": "Study",
      "calendarCard": "Calendar",
      "mapCard": "Map",
      "podcast-card": "Podcast",
      "triviaCard": "Trivia",
      "quizCard": "Quizzes",
      "jsonContainer": "Cards",
      "searchCard": "Search",
      "outlinesCard": "Outlines",
      "mediaCard": "Media",
      "prepperCard": "Preparedness",
      "preziCard": "Prezis",
      "mapViewCard": "Multimap"
      //"otCard": "OT Quotes"
      //"abCard": "Alephbet"

    };

    const ids = Object.keys(friendlyNames);
    const tabBar = document.getElementById("tabBar");
    if (!tabBar) return;

    ids.forEach((id, idx) => {
      const btn = document.createElement("button");
      btn.textContent = friendlyNames[id] || id;
      btn.dataset.id = id;
      if (idx === 0) btn.classList.add("active");
      btn.addEventListener("click", () => {
        // remove active on others
        Array.from(tabBar.children).forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        // ensure card registered then show
        window.mainStageManager.registerCard(id);
        window.mainStageManager.showCard(id);
      });
      tabBar.appendChild(btn);
    });

    // sync tab active on swipe
    const observer = new MutationObserver(()=> {
      const curr = window.mainStageManager.getCurrentCard();
      Array.from(tabBar.children).forEach(b => b.classList.toggle("active", b.dataset.id === curr));
    });
    observer.observe(document.getElementById("cardsRow"), { attributes:true, childList:true, subtree:false });
  })();

})();

