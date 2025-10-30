
















































































































































































































































































































































































































































































































 
    
    /* ------------------ Global audio player (singleton) ------------------ */
    (function initGlobalAudio() {
      if (!window.globalAudio) {
        const audio = document.createElement('audio');
        audio.id = 'globalAudio';
        audio.preload = 'none';
        audio.controls = false; // we provide our own UI
        document.body.appendChild(audio);
        window.globalAudio = audio;
      }
    
        // playlist queue (array of {src, title, week})
        window.globalAudioQueue = { list: [], index: -1 };
        window.globalAudioPlay = function (idx) {
          const q = window.globalAudioQueue;
          if (!q.list.length) return;
          if (typeof idx === 'number') q.index = idx;
          if (q.index < 0) q.index = 0;
          const item = q.list[q.index];
          window.globalAudio.src = item.src;
          window.globalAudio.play().catch(()=>{});
          // dispatch a small event so UI can update
          document.dispatchEvent(new CustomEvent('globalAudioChange', { detail: item }));
        };
        window.globalAudioNext = function () {
          const q = window.globalAudioQueue;
          if (!q.list.length) return;
          q.index = (q.index + 1) % q.list.length;
          window.globalAudioPlay();
        };
        window.globalAudioPrev = function () {
          const q = window.globalAudioQueue;
          if (!q.list.length) return;
          q.index = (q.index - 1 + q.list.length) % q.list.length;
          window.globalAudioPlay();
        };
        window.globalAudio.addEventListener('ended', () => window.globalAudioNext());
      
    })();
    
    /* --------------- Orbital player UI (floating) --------------- */
    (function insertOrbitalUI() {
      // floating center button
      const orb = document.createElement('div');
      orb.className = 'orbital-player';
      orb.id = 'cosmicOrb';
      orb.title = 'Global Audio Player';
      orb.innerHTML = '&#9658;'; // play triangle (will toggle play/pause)
      document.body.appendChild(orb);
    
      // orbit area (buttons positioned via JS)
      const orbitArea = document.createElement('div');
      orbitArea.className = 'orbitals';
      orbitArea.id = 'orbitArea';
      document.body.appendChild(orbitArea);
    
      // small control bar that opens when clicked
      const controls = document.createElement('div');
      controls.id = 'orbControls';
      controls.className = 'hidden';
      controls.style.position = 'fixed';
      controls.style.right = '110px';
      controls.style.bottom = '20px';
      controls.style.zIndex = 1300;
      controls.style.minWidth = '220px';
      document.body.appendChild(controls);
    
      // control contents
      controls.innerHTML = `
        <div style="background:#fff;padding:10px;border-radius:8px;box-shadow:0 12px 30px rgba(0,0,0,0.12);">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong>Player</strong>
            <button id="orbClose" class="btn">Close</button>
          </div>
          <div id="orbNow" style="margin-top:8px;font-size:0.95rem;color:#111;">No track</div>
          <div class="cosmic-controls">
            <button id="orbPrev" class="btn">Prev</button>
            <button id="orbPlay" class="btn primary">Play</button>
            <button id="orbNext" class="btn">Next</button>
          </div>
          <div id="orbPlaylist" class="playlist-list" style="margin-top:8px;"></div>
        </div>
      `;
    
      // event wiring
      orb.addEventListener('click', () => {
        const visible = controls.classList.contains('hidden');
        controls.classList.toggle('hidden', !visible);
        if (!visible) showOrbitButtons();
      });
      document.getElementById('orbClose').addEventListener('click', () => {
        document.getElementById('orbControls').classList.add('hidden');
        hideOrbitButtons();
      });
    
      document.getElementById('orbPlay').addEventListener('click', () => {
        const audio = window.globalAudio;
        if (audio.paused) {
          if (!audio.src) {
            window.globalAudioPlay(0);
          } else {
            audio.play().catch(()=>{});
            document.dispatchEvent(new Event('globalAudioPlay'));
          }
        } else {
          audio.pause();
          document.dispatchEvent(new Event('globalAudioPause'));
        }
      });
      document.getElementById('orbNext').addEventListener('click', () => window.globalAudioNext());
      document.getElementById('orbPrev').addEventListener('click', () => window.globalAudioPrev());
    
      // listen to audio changes
      document.addEventListener('globalAudioChange', (e) => {
        const now = document.getElementById('orbNow');
        now.textContent = e.detail.title ? `${e.detail.title}` : 'Playing...';
        document.getElementById('orbPlay').textContent = 'Pause';
        document.getElementById('cosmicOrb').innerHTML = '&#10074;&#10074;'; // pause
        // populate playlist UI
        renderOrbPlaylist();
      });
      document.addEventListener('globalAudioPause', () => {
        document.getElementById('orbPlay').textContent = 'Play';
        document.getElementById('cosmicOrb').innerHTML = '&#9658;'; // play
      });
      document.addEventListener('globalAudioPlay', () => {
        document.getElementById('orbPlay').textContent = 'Pause';
        document.getElementById('cosmicOrb').innerHTML = '&#10074;&#10074;'; // pause
      });
    
      function renderOrbPlaylist() {
        const list = window.globalAudioQueue.list || [];
        const wrap = document.getElementById('orbPlaylist');
        wrap.innerHTML = '';
        list.forEach((it, i) => {
          const r = document.createElement('div');
          r.style.padding = '6px 4px';
          r.style.cursor = 'pointer';
          r.style.borderBottom = '1px solid #eee';
          r.textContent = `${i+1}. ${it.title || it.src}`;
          r.addEventListener('click', () => {
            window.globalAudioPlay(i);
          });
          wrap.appendChild(r);
        });
      }
    
      // orbital small buttons: create 4 placeholders but keep hidden initially
      const orbBtns = [];
      for (let i=0;i<4;i++) {
        const b = document.createElement('div');
        b.className = 'orb-btn hidden';
        b.style.opacity = '0';
        b.style.right = '0px';
        b.style.bottom = '0px';
        b.style.background = 'linear-gradient(90deg,#6b3ddf,#ff6b6b)';
        b.dataset.idx = i;
        orbitArea.appendChild(b);
        orbBtns.push(b);
      }
    
      // show/hide orbit buttons with simple circular layout
      window.showOrbitButtons = function() {
        const radius = 90;
        orbBtns.forEach((b,i) => {
          const angle = (i / orbBtns.length) * Math.PI * 2 - Math.PI/2;
          const x = Math.round(Math.cos(angle) * radius);
          const y = Math.round(Math.sin(angle) * radius);
          b.style.transform = `translate(${-x}px, ${-y}px)`;
          b.style.opacity = '1';
          b.classList.remove('hidden');
          b.innerHTML = (i===0? '♫' : (i===1? '▣' : (i===2? '▶' : '■')));
          b.onclick = () => {
            // placeholder actions: choose playlist, toggle modal, play/pause, stop
            if (i===0) { document.getElementById('orbControls').classList.toggle('hidden'); renderOrbPlaylist();}
            if (i===1) togglePlaylist(window._orbTargetWeek || 1);
            if (i===2) {
              const audio = window.globalAudio;
              if (audio.paused) audio.play().catch(()=>{});
              else audio.pause();
            }
            if (i===3) { videoModalClose(); }
          };
        });
      };
      window.hideOrbitButtons = function() {
        orbBtns.forEach(b => { b.style.opacity='0'; b.style.transform='translate(0,0)'; b.classList.add('hidden'); });
      };
    })();
    
    /* ------------------ Video modal helpers ------------------ */
    (function insertVideoModal() {
      const existing = document.getElementById('cosmicVideoModal');
      if (existing) return;
      const m = document.createElement('div');
      m.id = 'cosmicVideoModal';
      m.className = 'hidden';
      m.innerHTML = `
        <div class="cosmic-modal hidden" id="cosmicModalWrap">
          <div class="modal-body">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong id="modalTitle">Video</strong>
              <button id="closeModal" class="btn">Close</button>
            </div>
            <div id="modalFrame" style="margin-top:8px;"></div>
          </div>
        </div>
      `;
      document.body.appendChild(m);
      document.getElementById('closeModal').addEventListener('click', videoModalClose);
    })();
    function videoModalOpen(title, src) {
      const wrap = document.getElementById('cosmicModalWrap');
      const frame = document.getElementById('modalFrame');
      const t = document.getElementById('modalTitle');
      if (!wrap || !frame || !t) return;
      t.textContent = title || 'Video';
      frame.innerHTML = `<iframe width="100%" height="480" src="${src}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      wrap.classList.remove('hidden');
      // pause global audio if playing
      if (!window.globalAudio.paused) window.globalAudio.pause();
    }
    function videoModalClose(){
      const wrap = document.getElementById('cosmicModalWrap');
      const frame = document.getElementById('modalFrame');
      if (!wrap || !frame) return;
      frame.innerHTML = '';
      wrap.classList.add('hidden');
    }
    
    /* ------------------ Core renderCards (v3) ------------------ */
    function renderCards(comments) {
      // comments should be array
      if (!comments || !Array.isArray(comments)) {
        console.warn('renderCards: expected an array of commentary objects')};
        return;
      }
    
      // ensure cardsContainer exists
      let container = document.getElementById('cardsContainer');
      if (!container) {
        container = document.createElement('section');
        container.id = 'cardsContainer';
        document.body.appendChild(container);
      }
      container.innerHTML = ''; // clear
    
      const currentWeek = (typeof getCurrentWeekNumber === 'function') ? getCurrentWeekNumber() : null;
    
 
        // Normalize minimal fields
        const week = item.week || (idx + 1);
        const commentary = (item.commentary || '').toString();
        const scripture = item.scripture ? item.scripture.toString() : null;
        const audio = Array.isArray(item.audio) ? item.audio.slice() : null;
        const video = item.video || null;
      
        // card
        const card = document.createElement('article');
        card.className = 'cosmic-card';
        if (week === currentWeek) card.classList.add('ring-current');
    
        // header
        const header = document.createElement('button');
        header.className = 'cosmic-header';
        header.innerHTML = `<span>Week ${week} Commentary</span><span class="cosmic-badge">Week ${week}</span>`;
    
        // content
        const content = document.createElement('div');
        content.className = 'cosmic-content';
        // commentary paragraph
        const p = document.createElement('div');
        p.className = 'cosmic-text';
        // We expect JSON strings to contain literal "\n" (two chars), so replace accordingly
        // If the JSON actually contains real newlines, the replace below handles them too.
        p.innerHTML = commentary.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
        content.appendChild(p);
    
        // quiz placeholder
        const quiz = document.createElement('div');
        quiz.id = `quizWeek${week}`;
        quiz.className = 'cosmic-quiz hidden';
        quiz.innerHTML = `<strong>Quiz</strong><div style="margin-top:6px;">Questions go here for week ${week}.</div>`;
        content.appendChild(quiz);
    
        // scripture placeholder
        if (scripture) {
          const sdiv = document.createElement('div');
          sdiv.id = `scriptureWeek${week}`;
          sdiv.className = 'cosmic-scripture hidden';
          sdiv.innerHTML = `<strong>Scripture</strong><div style="margin-top:6px;">${scripture.replace(/\\n/g,'<br>').replace(/\n/g,'<br>')}</div>`;
          content.appendChild(sdiv);
        }
    
        // audio playlist
        if (audio && audio.length) {
          const audioWrap = document.createElement('div');
          audioWrap.id = `audioWeek${week}`;
          audioWrap.className = 'cosmic-media';
          // build UI: show small buttons and list
          audioWrap.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong>Audio Playlist</strong>
              <div>
                <button class="btn" data-action="load" data-week="${week}">Load</button>
                <button class="btn" data-action="play" data-week="${week}">Play</button>
                <button class="btn" data-action="toggleOrb" data-week="${week}">Orbit</button>
              </div>
            </div>
            <div class="playlist-list" id="playlistWeek${week}" style="margin-top:8px;"></div>
          `;
          // populate list
          const listDiv = audioWrap.querySelector(`#playlistWeek${week}`);
          audio.forEach((src,i) => {
            const title = src.split('/').pop() || `Track ${i+1}`;
            const row = document.createElement('div');
            row.style.padding = '6px 4px';
            row.style.borderBottom = '1px solid #eee';
            row.style.cursor = 'pointer';
            row.textContent = `${i+1}. ${title}`;
            row.dataset.src = src;
            row.dataset.title = title;
            row.dataset.week = week;
            row.addEventListener('click', () => {
              // add to queue and play
              addToGlobalQueueAndPlay({ src, title, week }, true);
            });
            listDiv.appendChild(row);
          });
          content.appendChild(audioWrap);
        }
    
        // video placeholder
        if (video) {
          const videoWrap = document.createElement('div');
          videoWrap.id = `videoWeek${week}`;
          videoWrap.className = 'cosmic-media';
          videoWrap.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <strong>Video</strong>
              <button class="btn" data-action="openVideo" data-src="${video}" data-title="Week ${week} Video">Open</button>
            </div>
          `;
          // click handler
          videoWrap.querySelector('[data-action="openVideo"]').addEventListener('click', (ev) => {
            const btn = ev.currentTarget;
            const src = btn.dataset.src;
            const title = btn.dataset.title;
            videoModalOpen(title, src);
          });
          content.appendChild(videoWrap);
        }
    
        // assemble
        header.addEventListener('click', () => {
          // when clicking header, toggle content and scroll
          toggleCardContent(content);
          // set orb target week for orbit buttons to use
          window._orbTargetWeek = week;
          // smooth scroll into view after expand
          setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 280);
        });
    

            // load this week's tracks into the global queue (but don't autoplay)
            const weekList = comments.find(c => (c.week||0) === wk);
            if (weekList && weekList.audio) {
              window.globalAudioQueue.list = weekList.audio.map((s,i)=>({ src: s, title: s.split('/').pop() || `Track ${i+1}`, week: wk }));
              window.globalAudioQueue.index = 0;
              renderOrbPlaylistUI();
            }
           else if (action === 'play') 
             if (weekList && weekList.audio) 
              window.globalAudioQueue.list = weekList.audio.map((s,i)=>({ src: s, title: s.split('/').pop() || `Track ${i+1}`, week: wk }));
              window.globalAudioQueue.index = 0;
              window.globalAudioPlay(0);
              renderOrbPlaylistUI();
            
             // open orbital controls and set target week
            const controls = document.getElementById('orbControls');
            if (controls) controls.classList.toggle('hidden');
            window._orbTargetWeek = wk;
            if (!controls.classList.contains('hidden')) {
              showOrbitButtons();
            }
          
     
        card.appendChild(header);
        card.appendChild(content);
        container.appendChild(card);
     
      /* ------------------ Expose helpful functions globally ------------------ */
      window.renderCards = renderCards;
      window.toggleQuiz = toggleQuiz;
      window.toggleScripture = toggleScripture;
      window.togglePlaylist = togglePlaylist;
      window.toggleVideo = videoModalOpen;
      

    
      /* ------------------ Recalculate spacing and scroll regions ------------------ */
      function refreshLayout() {
        const container = document.getElementById("cardsContainer");
        if (container) {
          container.querySelectorAll(".card").forEach(card => {
            card.style.marginBottom = "1rem";
          });
          console.log("[RenderCosmicCards] Layout refreshed");
        }
      }
      // Expose refresh function globally for the mainloader to call
      window.refreshLayout = refreshLayout;
    
      console.log("[RenderCosmicCards] Initialized");
    
      // After building, ensure the container layout is recalculated
      refreshContainer();
    
      // helper to render playlist list in orbital UI (if open)
      function renderOrbPlaylistUI() {
        const list = window.globalAudioQueue.list || [];
        const wrap = document.getElementById('orbPlaylist');
        if (!wrap) return;
        wrap.innerHTML = '';
        list.forEach((it, i) => {
          const e = document.createElement('div');
          e.textContent = `${i+1}. ${it.title || it.src}`;
          e.style.padding = '6px 4px';
          e.style.borderBottom = '1px solid #eee';
          e.style.cursor = 'pointer';
          e.addEventListener('click', () => window.globalAudioPlay(i));
          wrap.appendChild(e);
        });
      }
    // end renderCards
    
    /* ------------------ small helpers ------------------ */
    function addToGlobalQueueAndPlay(item, playImmediately = true) {
      // item: {src, title, week}
      const q = window.globalAudioQueue;
      // append
      q.list.push(item);
      q.index = q.list.length - 1;
      if (playImmediately) window.globalAudioPlay(q.index);
      // update orbital UI
      document.dispatchEvent(new CustomEvent('globalAudioChange', { detail: item }));
    }
    
    /* ------------------ toggle helpers (exported) ------------------ */
    function toggleQuiz(weekNum) {
      const el = document.getElementById(`quizWeek${weekNum}`);
      if (el) {
        el.classList.toggle('hidden');
        refreshContainer();
      }
    }
    function toggleScripture(weekNum) {
      const el = document.getElementById(`scriptureWeek${weekNum}`);
      if (el) {
        el.classList.toggle('hidden');
        refreshContainer();
      }
    }
    function togglePlaylist(weekNum) {
      // show playlist in the UI for that week by opening orbital controls and loading list
      const wk = Number(weekNum);
      const c = `Array.from(document.querySelectorAll('[id^="playlistWeek"]')).find(node => node.id === playlistWeek${wk})`;
      if (!c) return;
      // try to load from weeklyCommentary
      const data = (window.weeklyCommentary || []).find(w => Number(w.week) === wk);
      if (!data || !Array.isArray(data.audio)) return;
      window.globalAudioQueue.list = data.audio.map((s,i)=>({ src:s, title: s.split('/').pop() || Track `i${i+1}`, week: wk }));
      window.globalAudioQueue.index = 0;
      // show orbital controls and playlist
      const controls = document.getElementById('orbControls');
      if (controls) controls.classList.remove('hidden');
      document.dispatchEvent(new CustomEvent('globalAudioChange', { detail: window.globalAudioQueue.list[0] || {} }));
      renderOrbPlaylist(); // defined in orbital UI setup
    }
    
      /* ------------------ Refresh container layout (avoid gaps) ------------------ */
      function refreshContainer() {
        const container = document.getElementById('cardsContainer');
        if (!container) return;
        container.style.display = 'none';
        // force reflow
        void container.offsetHeight;
        container.style.display = ''};