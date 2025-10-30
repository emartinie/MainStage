/* renderCosmicCards_v3.js
   - Vanilla JS, single-file, no template literals (to avoid paste issues)
   - Modular to loader: call renderCards(commentsArray) after your loader finishes
   - Includes placeholders for Scripture, Playlist (audio), and Cosmic card types
   - Exposes global helpers: renderCards, toggleQuiz, toggleScripture, togglePlaylist, toggleVideo, highlightWeek, refreshLayout
*/

(function () {
  'use strict';

  /* ========== Inject CSS ========== */
  var css = ''
    + '#cardsContainer { overflow-y:auto; max-height:80vh; padding:16px; box-sizing:border-box; font-family:system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }'
    + '.cosmic-card { background:#fff; border-radius:12px; box-shadow:0 6px 18px rgba(0,0,0,0.08); overflow:hidden; transition:transform .24s ease, box-shadow .24s ease; margin-bottom:16px; border:1px solid rgba(15,23,42,0.04); }'
    + '.cosmic-card:hover { transform:translateY(-6px); box-shadow:0 18px 40px rgba(0,0,0,0.12); }'
    + '.cosmic-header { width:100%; text-align:left; padding:14px 16px; font-weight:700; cursor:pointer; color:#fff; border:0; outline:0; display:flex; justify-content:space-between; align-items:center; background:linear-gradient(90deg,#2463d6,#6b3ddf); }'
    + '.cosmic-badge { background:rgba(255,255,255,0.12); padding:6px 10px; border-radius:999px; font-weight:600; font-size:0.9rem; color:white; }'
    + '.cosmic-content { padding:16px; max-height:0; overflow:hidden; transition:max-height .45s ease; background:linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,255,0.98)); }'
    + '.cosmic-text { line-height:1.6; color:#111; }'
    + '.cosmic-quiz, .cosmic-scripture, .cosmic-media { margin-top:12px; padding:10px; border-radius:8px; background:#f7f8fb; border:1px solid #e6e9f2; }'
    + '.cosmic-media iframe { border:0; border-radius:6px; }'
    + '.hidden { display:none !important; }'
    + '.ring-current { box-shadow:0 0 0 6px rgba(250,204,21,0.12), 0 10px 30px rgba(107,61,223,0.06); }'
    + '.orbital-player { position:fixed; right:20px; bottom:24px; width:64px; height:64px; z-index:1200; border-radius:50%; background:linear-gradient(135deg,#ff6b6b,#845ef7); display:flex; align-items:center; justify-content:center; color:#fff; box-shadow:0 12px 30px rgba(0,0,0,0.18); cursor:pointer; }'
    + '.orbitals { position:fixed; right:20px; bottom:24px; width:220px; height:220px; pointer-events:none; z-index:1199; }'
    + '.orb-btn { position:absolute; width:44px; height:44px; border-radius:999px; display:flex; align-items:center; justify-content:center; color:#fff; pointer-events:auto; background:rgba(0,0,0,0.18); transition:transform .35s, opacity .25s; }'
    + '.orb-btn.hidden { opacity:0; transform:scale(.6); }'
    + '.playlist-list { max-height:150px; overflow:auto; margin-top:8px; }'
    + '.cosmic-modal { position:fixed; inset:0; z-index:2000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.6); padding:20px; }'
    + '.cosmic-modal .modal-body { width:100%; max-width:900px; background:#fff; border-radius:12px; padding:12px; box-shadow:0 20px 60px rgba(0,0,0,0.4); }'
    + '.btn { padding:8px 12px; border-radius:8px; cursor:pointer; border:0; background:#eef2ff; color:#1f2937; }'
    + '.btn.primary { background:linear-gradient(90deg,#2463d6,#6b3ddf); color:#fff; }';

  var styleTag = document.createElement('style');
  styleTag.id = 'renderCosmicStyles';
  styleTag.textContent = css;
  document.head.appendChild(styleTag);

  /* ========== Global audio setup (singleton) ========== */
  if (!window.globalAudio) {
    var audioEl = document.createElement('audio');
    audioEl.id = 'globalAudio';
    audioEl.preload = 'none';
    audioEl.controls = false;
    document.body.appendChild(audioEl);
    window.globalAudio = audioEl;
    window.globalAudioQueue = { list: [], index: -1 };

    window.globalAudioPlay = function (idx) {
      var q = window.globalAudioQueue;
      if (!q.list || !q.list.length) return;
      if (typeof idx === 'number') q.index = idx;
      if (q.index < 0) q.index = 0;
      var it = q.list[q.index];
      if (it && it.src) {
        window.globalAudio.src = it.src;
        window.globalAudio.play().catch(function () {});
        document.dispatchEvent(new CustomEvent('globalAudioChange', { detail: it }));
      }
    };
    window.globalAudioNext = function () {
      var q = window.globalAudioQueue;
      if (!q.list || !q.list.length) return;
      q.index = (q.index + 1) % q.list.length;
      window.globalAudioPlay();
    };
    window.globalAudioPrev = function () {
      var q = window.globalAudioQueue;
      if (!q.list || !q.list.length) return;
      q.index = (q.index - 1 + q.list.length) % q.list.length;
      window.globalAudioPlay();
    };
    window.globalAudio.addEventListener('ended', function () { window.globalAudioNext(); });
  }

  /* ========== Orbital UI injection (minimal) ========== */
  function insertOrbitalUI() {
    if (document.getElementById('cosmicOrb')) return;
    var orb = document.createElement('div');
    orb.className = 'orbital-player';
    orb.id = 'cosmicOrb';
    orb.title = 'Global Audio Player';
    orb.innerHTML = '&#9658;'; // play symbol
    document.body.appendChild(orb);

    var orbitArea = document.createElement('div');
    orbitArea.className = 'orbitals';
    orbitArea.id = 'orbitArea';
    document.body.appendChild(orbitArea);

    var controls = document.createElement('div');
    controls.id = 'orbControls';
    controls.className = '';
    controls.style.position = 'fixed';
    controls.style.right = '110px';
    controls.style.bottom = '20px';
    controls.style.zIndex = 1300;
    controls.style.minWidth = '220px';
    controls.style.display = 'none';
    controls.innerHTML = ''
      + '<div style="background:#fff;padding:10px;border-radius:8px;box-shadow:0 12px 30px rgba(0,0,0,0.12);">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;">'
      + '<strong>Player</strong>'
      + '<button id="orbClose" class="btn">Close</button>'
      + '</div>'
      + '<div id="orbNow" style="margin-top:8px;font-size:0.95rem;color:#111;">No track</div>'
      + '<div style="display:flex;gap:8px;margin-top:8px;"><button id="orbPrev" class="btn">Prev</button><button id="orbPlay" class="btn primary">Play</button><button id="orbNext" class="btn">Next</button></div>'
      + '<div id="orbPlaylist" class="playlist-list" style="margin-top:8px;"></div>'
      + '</div>';
    document.body.appendChild(controls);

    // minimal event wiring
    orb.addEventListener('click', function () {
      controls.style.display = (controls.style.display === 'none') ? 'block' : 'none';
    });
    document.addEventListener('globalAudioChange', function (e) {
      var now = document.getElementById('orbNow');
      if (now) now.textContent = e.detail && e.detail.title ? e.detail.title : 'Playing...';
      var playBtn = document.getElementById('orbPlay');
      if (playBtn) playBtn.textContent = 'Pause';
      var orbEl = document.getElementById('cosmicOrb');
      if (orbEl) orbEl.innerHTML = '&#10074;&#10074;';
      renderOrbPlaylist();
    });
    document.addEventListener('globalAudioPause', function () {
      var playBtn = document.getElementById('orbPlay');
      if (playBtn) playBtn.textContent = 'Play';
      var orbEl = document.getElementById('cosmicOrb');
      if (orbEl) orbEl.innerHTML = '&#9658;';
    });

    // controls buttons
    (function attachControlHandlers() {
      var playBtn = document.getElementById('orbPlay');
      var nextBtn = document.getElementById('orbNext');
      var prevBtn = document.getElementById('orbPrev');
      var closeBtn = document.getElementById('orbClose');
      if (playBtn) {
        playBtn.addEventListener('click', function () {
          var audio = window.globalAudio;
          if (!audio.src) {
            window.globalAudioPlay(0);
            return;
          }
          if (audio.paused) {
            audio.play().catch(function () {});
            document.dispatchEvent(new Event('globalAudioPlay'));
          } else {
            audio.pause();
            document.dispatchEvent(new Event('globalAudioPause'));
          }
        });
      }
      if (nextBtn) nextBtn.addEventListener('click', function () { window.globalAudioNext(); });
      if (prevBtn) prevBtn.addEventListener('click', function () { window.globalAudioPrev(); });
      if (closeBtn) closeBtn.addEventListener('click', function () { document.getElementById('orbControls').style.display = 'none'; });
    })();

    // orbit placeholders
    for (var i = 0; i < 4; i += 1) {
      var b = document.createElement('div');
      b.className = 'orb-btn hidden';
      b.style.right = '0px';
      b.style.bottom = '0px';
      b.style.background = 'linear-gradient(90deg,#6b3ddf,#ff6b6b)';
      orbitArea.appendChild(b);
    }
  } // end insertOrbitalUI

  function renderOrbPlaylist() {
    var wrap = document.getElementById('orbPlaylist');
    if (!wrap) return;
    wrap.innerHTML = '';
    var list = (window.globalAudioQueue && window.globalAudioQueue.list) ? window.globalAudioQueue.list : [];
    list.forEach(function (it, i) {
      var r = document.createElement('div');
      r.style.padding = '6px 4px';
      r.style.cursor = 'pointer';
      r.style.borderBottom = '1px solid #eee';
      r.textContent = (i + 1) + '. ' + (it.title || it.src);
      r.addEventListener('click', function () { window.globalAudioPlay(i); });
      wrap.appendChild(r);
    });
  }

  /* ========== Video modal ========== */
  function ensureVideoModal() {
    if (document.getElementById('cosmicModalWrap')) return;
    var modalWrap = document.createElement('div');
    modalWrap.className = 'cosmic-modal hidden';
    modalWrap.id = 'cosmicModalWrap';
    modalWrap.innerHTML = ''
      + '<div class="modal-body">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;"><strong id="modalTitle">Video</strong><button id="modalClose" class="btn">Close</button></div>'
      + '<div id="modalFrame" style="margin-top:8px;"></div>'
      + '</div>';
    document.body.appendChild(modalWrap);
    var closeBtn = document.getElementById('modalClose');
    if (closeBtn) closeBtn.addEventListener('click', function () { videoModalClose(); });
  }

  function videoModalOpen(title, src) {
    ensureVideoModal();
    var wrap = document.getElementById('cosmicModalWrap');
    var frame = document.getElementById('modalFrame');
    var t = document.getElementById('modalTitle');
    if (!wrap || !frame || !t) return;
    t.textContent = title || 'Video';
    // safe embed - if src is youtube embed or mp4 url
    if (src.indexOf('youtube') !== -1 || src.indexOf('youtu.be') !== -1) {
      frame.innerHTML = '<iframe width="100%" height="480" src="' + src + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    } else {
      // assume direct video link
      frame.innerHTML = '<video width="100%" height="480" controls src="' + src + '"></video>';
    }
    wrap.classList.remove('hidden');
    // pause global audio if playing
    if (window.globalAudio && !window.globalAudio.paused) window.globalAudio.pause();
  }

  function videoModalClose() {
    var wrap = document.getElementById('cosmicModalWrap');
    var frame = document.getElementById('modalFrame');
    if (!wrap || !frame) return;
    frame.innerHTML = '';
    wrap.classList.add('hidden');
  }

  /* ========== Core renderCards implementation ========== */
  function renderCards(comments) {
    // defensive: if comments is null/undefined, try window.weeklyCommentary as fallback
    if (!comments || !Array.isArray(comments)) {
      if (Array.isArray(window.weeklyCommentary)) comments = window.weeklyCommentary;
      else {
        console.warn('[RenderCosmicCards] renderCards: expected an array of commentary objects');
        // render sample placeholders to prove UI works
        comments = sampleComments();
      }
    }

    // ensure cardsContainer exists
    var container = document.getElementById('cardsContainer');
    if (!container) {
      container = document.createElement('section');
      container.id = 'cardsContainer';
      document.body.appendChild(container);
    }
    container.innerHTML = '';

    // Inject orbital UI once
    insertOrbitalUI();

    var currentWeek = (typeof getCurrentWeekNumber === 'function') ? getCurrentWeekNumber() : null;

    comments.forEach(function (item, idx) {
      var week = item.week || (idx + 1);
      var commentary = (item.commentary || '').toString();
      var scripture = item.scripture ? item.scripture.toString() : null;
      var audio = Array.isArray(item.audio) ? item.audio.slice() : null;
      var video = item.video || null;

      // article card
      var card = document.createElement('article');
      card.className = 'cosmic-card';
      card.dataset.week = week;
      if (week === currentWeek) card.classList.add('ring-current');

      // header
      var header = document.createElement('button');
      header.className = 'cosmic-header';
      var spanLeft = document.createElement('span');
      spanLeft.textContent = 'Week ' + week + ' Commentary';
      var spanBadge = document.createElement('span');
      spanBadge.className = 'cosmic-badge';
      spanBadge.textContent = 'Week ' + week;
      header.appendChild(spanLeft);
      header.appendChild(spanBadge);

      // content
      var content = document.createElement('div');
      content.className = 'cosmic-content';

      // commentary
      var p = document.createElement('div');
      p.className = 'cosmic-text';
      // accept both literal "\n" and actual newlines
      p.innerHTML = commentary.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
      content.appendChild(p);

      // quiz placeholder
      var quiz = document.createElement('div');
      quiz.id = 'quizWeek' + week;
      quiz.className = 'cosmic-quiz hidden';
      quiz.innerHTML = '<strong>Quiz</strong><div style="margin-top:6px;">Sample question area for week ' + week + '.</div>';
      content.appendChild(quiz);

      // scripture
      if (scripture) {
        var sdiv = document.createElement('div');
        sdiv.id = 'scriptureWeek' + week;
        sdiv.className = 'cosmic-scripture hidden';
        sdiv.innerHTML = '<strong>Scripture</strong><div style="margin-top:6px;">' + scripture.replace(/\\n/g, '<br>').replace(/\n/g, '<br>') + '</div>';
        content.appendChild(sdiv);
      }

      // audio playlist UI
      if (audio && audio.length) {
        var audioWrap = document.createElement('div');
        audioWrap.id = 'audioWeek' + week;
        audioWrap.className = 'cosmic-media';
        audioWrap.innerHTML = ''
          + '<div style="display:flex;justify-content:space-between;align-items:center;">'
          + '<strong>Audio Playlist</strong>'
          + '<div>'
          + '<button class="btn" data-action="load" data-week="' + week + '">Load</button>'
          + '<button class="btn" data-action="play" data-week="' + week + '">Play</button>'
          + '<button class="btn" data-action="toggleOrb" data-week="' + week + '">Orbit</button>'
          + '</div></div>'
          + '<div class="playlist-list" id="playlistWeek' + week + '" style="margin-top:8px;"></div>';
        content.appendChild(audioWrap);

        // populate list
        var listDiv = audioWrap.querySelector('#playlistWeek' + week);
        audio.forEach(function (src, i) {
          var title = (src.split('/').pop() || 'Track ' + (i + 1));
          var row = document.createElement('div');
          row.style.padding = '6px 4px';
          row.style.borderBottom = '1px solid #eee';
          row.style.cursor = 'pointer';
          row.textContent = (i + 1) + '. ' + title;
          row.dataset.src = src;
          row.dataset.title = title;
          row.dataset.week = week;
          row.addEventListener('click', function () {
            addToGlobalQueueAndPlay({ src: src, title: title, week: week }, true);
          });
          listDiv.appendChild(row);
        });
      }

      // video placeholder
      if (video) {
        var vidWrap = document.createElement('div');
        vidWrap.id = 'videoWeek' + week;
        vidWrap.className = 'cosmic-media';
        vidWrap.innerHTML = ''
          + '<div style="display:flex;justify-content:space-between;align-items:center;">'
          + '<strong>Video</strong>'
          + '<button class="btn" data-action="openVideo" data-src="' + video + '" data-title="Week ' + week + ' Video">Open</button>'
          + '</div>';
        content.appendChild(vidWrap);
        var openBtn = vidWrap.querySelector('[data-action="openVideo"]');
        if (openBtn) {
          openBtn.addEventListener('click', function (ev) {
            var src = ev.currentTarget.getAttribute('data-src');
            var title = ev.currentTarget.getAttribute('data-title');
            videoModalOpen(title, src);
          });
        }
      }

      // header click toggles content
      header.addEventListener('click', function () {
        toggleCardContent(content);
        // set orb target for later
        window._orbTargetWeek = week;
        // smooth scroll after expand
        setTimeout(function () {
          try { card.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
        }, 280);
      });

      // card-level button handling (load/play/toggleOrb)
      card.addEventListener('click', function (ev) {
        var t = ev.target;
        // walk up until a button with data-action is found
        while (t && t !== card) {
          if (t.getAttribute && t.getAttribute('data-action')) break;
          t = t.parentNode;
        }
        if (!t || t === card) return;
        var action = t.getAttribute('data-action');
        var wk = Number(t.getAttribute('data-week') || week);
        if (!action) return;
        if (action === 'load') {
          var weekList = comments.find(function (c) { return (c.week || 0) === wk; });
          if (weekList && weekList.audio) {
            window.globalAudioQueue.list = weekList.audio.map(function (s, i) { return { src: s, title: (s.split('/').pop() || ('Track ' + (i+1))), week: wk }; });
            window.globalAudioQueue.index = 0;
            renderOrbPlaylist();
          }
        } else if (action === 'play') {
          var wL = comments.find(function (c) { return (c.week || 0) === wk; });
          if (wL && wL.audio) {
            window.globalAudioQueue.list = wL.audio.map(function (s, i) { return { src: s, title: (s.split('/').pop() || ('Track ' + (i+1))), week: wk }; });
            window.globalAudioQueue.index = 0;
            window.globalAudioPlay(0);
            renderOrbPlaylist();
          }
        } else if (action === 'toggleOrb') {
          var controls = document.getElementById('orbControls');
          if (controls) controls.style.display = (controls.style.display === 'none') ? 'block' : 'none';
          window._orbTargetWeek = wk;
        }
      });

      // assemble card
      card.appendChild(header);
      card.appendChild(content);
      container.appendChild(card);
    }); // end comments.forEach

    // done rendering
    refreshContainer();
    console.info('[RenderCosmicCards] Rendered', comments.length, 'cards');
  } // end renderCards

  /* ========== small helpers ========== */
  function toggleCardContent(content) {
    try {
      if (!content) return;
      if (content.style.maxHeight && content.style.maxHeight !== '0px') {
        content.style.maxHeight = '0';
      } else {
        content.style.maxHeight = (content.scrollHeight + 'px');
      }
      refreshContainer();
    } catch (e) { /* no-op */ }
  }

  function addToGlobalQueueAndPlay(item, playImmediately) {
    if (!item) return;
    var q = window.globalAudioQueue;
    q.list.push(item);
    q.index = q.list.length - 1;
    if (playImmediately) window.globalAudioPlay(q.index);
    document.dispatchEvent(new CustomEvent('globalAudioChange', { detail: item }));
  }

  /* ========== exported toggles ========== */
  function toggleQuiz(weekNum) {
    var el = document.getElementById('quizWeek' + weekNum);
    if (!el) return;
    el.classList.toggle('hidden');
    refreshContainer();
  }
  function toggleScripture(weekNum) {
    var el = document.getElementById('scriptureWeek' + weekNum);
    if (!el) return;
    el.classList.toggle('hidden');
    refreshContainer();
  }
  function togglePlaylist(weekNum) {
    var data = (window.weeklyCommentary || []).find(function (w) { return Number(w.week) === Number(weekNum); });
    if (!data || !Array.isArray(data.audio)) return;
    window.globalAudioQueue.list = data.audio.map(function (s, i) { return { src: s, title: s.split('/').pop() || ('Track ' + (i+1)), week: Number(weekNum) }; });
    window.globalAudioQueue.index = 0;
    // open orbital controls
    var ctr = document.getElementById('orbControls');
    if (ctr) ctr.style.display = 'block';
    document.dispatchEvent(new CustomEvent('globalAudioChange', { detail: window.globalAudioQueue.list[0] || {} }));
    renderOrbPlaylist();
  }

  /* ========== refresh layout helpers ========== */
  function refreshContainer() {
    var container = document.getElementById('cardsContainer');
    if (!container) return;
    container.style.display = 'none';
    void container.offsetHeight;
    container.style.display = '';
  }

  function refreshLayout() {
    var container = document.getElementById('cardsContainer');
    if (!container) return;
    var nodes = container.querySelectorAll('.cosmic-card');
    for (var i = 0; i < nodes.length; i += 1) {
      nodes[i].style.marginBottom = '16px';
    }
    console.info('[RenderCosmicCards] Layout refreshed');
  }

  /* ========== highlight and video helpers ========== */
  function highlightWeek(week) {
    var container = document.getElementById('cardsContainer');
    if (!container) return;
    var children = Array.prototype.slice.call(container.children || []);
    children.forEach(function (c) { c.classList.remove('ring-current'); });
    var card = children.find(function (c) { var badge = c.querySelector('.cosmic-badge'); return badge && badge.textContent.indexOf('Week ' + week) !== -1; });
    if (card) card.classList.add('ring-current');
  }

  /* ========== sample data for quick testing ========== */
  function sampleComments() {
    return [
      {
        week: 1,
        commentary: 'In the beginning God created the heavens and the earth.\\nThis is a small sample commentary to demonstrate the card layout and scrolling behavior.',
        scripture: 'Genesis 1:1-5\\nJohn 1:1-3',
        audio: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'],
        video: 'https://www.youtube.com/embed/3fumBcKC6RE'
      },
      {
        week: 2,
        commentary: 'Week 2 sample commentary. This one is longer to show scrolling inside the card.\\n\\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.',
        scripture: 'Genesis 2:1-7\\nPsalm 23:1-4',
        audio: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3','https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'],
        video: ''
      },
      {
        week: 3,
        commentary: 'Cosmic placeholder: an idea card that highlights a verse fragment and suggests a short exercise to meditate on.',
        scripture: null,
        audio: [],
        video: ''
      }
    ];
  }

  /* ========== misc small utilities ========== */
  function renderOrbPlaylist() {
    var wrap = document.getElementById('orbPlaylist');
    if (!wrap) return;
    wrap.innerHTML = '';
    var list = (window.globalAudioQueue && window.globalAudioQueue.list) ? window.globalAudioQueue.list : [];
    list.forEach(function (it, i) {
      var e = document.createElement('div');
      e.style.padding = '6px 4px';
      e.style.borderBottom = '1px solid #eee';
      e.style.cursor = 'pointer';
      e.textContent = (i + 1) + '. ' + (it.title || it.src);
      e.addEventListener('click', function () { window.globalAudioPlay(i); });
      wrap.appendChild(e);
    });
  }

  /* ========== expose globals ========== */
  window.renderCards = renderCards;
  window.toggleQuiz = toggleQuiz;
  window.toggleScripture = toggleScripture;
  window.togglePlaylist = togglePlaylist;
  window.toggleVideo = videoModalOpen;
  window.highlightWeek = highlightWeek;
  window.refreshLayout = refreshLayout;
  window.refreshContainer = refreshContainer;

  /* ========== Auto-run if data exists ========== */
  try {
    if (Array.isArray(window.weeklyCommentary)) {
      // delay a moment to ensure DOM is ready
      setTimeout(function () { renderCards(window.weeklyCommentary); }, 120);
    } else {
      // no data found; do nothing. Call renderCards() manually to test sample placeholders.
    }
  } catch (e) {
    console.error('[RenderCosmicCards] auto-run failed', e);
  }

  console.info('[RenderCosmicCards] v3 module loaded');

})(); // end IIFE