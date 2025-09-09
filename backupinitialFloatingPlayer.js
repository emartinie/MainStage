// FloatingPlayer.js — wired to weekData, fully touch + click friendly
function setupFloatingPlayer() {
  const existing = document.getElementById("floatingPlayer");
  if (existing) existing.remove();

  // --- Player container ---
  const player = document.createElement("div");
  player.id = "floatingPlayer";
  Object.assign(player.style, {
    position: "fixed",
    bottom: "1rem",
    right: "1rem",
    width: "190px",
    height: "190px",
    borderRadius: "50%",
    backdropFilter: "blur(8px)",
    background: "radial-gradient(120% 120% at 30% 30%, rgba(31,41,55,0.95), rgba(17,24,39,0.9))",
    boxShadow: "0 12px 28px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.06)",
    display: "grid",
    gridTemplateRows: "1fr auto",
    alignItems: "center",
    justifyItems: "center",
    color: "#fff",
    padding: "10px",
    cursor: "grab",
    zIndex: 9999,
    userSelect: "none",
    overflow: "hidden"
  });

  // --- Glow ring ---
  const ring = document.createElement("div");
  Object.assign(ring.style, {
    position: "absolute",
    inset: "8px",
    borderRadius: "50%",
    background: "conic-gradient(from 0deg, rgba(59,130,246,0.25), rgba(34,197,94,0.25), rgba(59,130,246,0.25))",
    filter: "blur(8px)",
    opacity: "0.6",
    pointerEvents: "none"
  });
  player.appendChild(ring);

  // --- SVG progress ---
  const svgNS = "http://www.w3.org/2000/svg";
  const size = 170;
  const r = 76;
  const C = 2 * Math.PI * r;
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  Object.assign(svg.style, {
    position: "absolute",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    overflow: "visible",
    pointerEvents: "none"
  });

  const circleBg = document.createElementNS(svgNS, "circle");
  circleBg.setAttribute("cx", size/2);
  circleBg.setAttribute("cy", size/2);
  circleBg.setAttribute("r", r);
  circleBg.setAttribute("stroke", "rgba(255,255,255,0.15)");
  circleBg.setAttribute("stroke-width", "6");
  circleBg.setAttribute("fill", "none");

  const circleProgress = document.createElementNS(svgNS, "circle");
  circleProgress.setAttribute("cx", size/2);
  circleProgress.setAttribute("cy", size/2);
  circleProgress.setAttribute("r", r);
  circleProgress.setAttribute("stroke", "url(#fpGrad)");
  circleProgress.setAttribute("stroke-width", "6");
  circleProgress.setAttribute("fill", "none");
  circleProgress.setAttribute("stroke-linecap", "round");
  circleProgress.setAttribute("stroke-dasharray", C.toString());
  circleProgress.setAttribute("stroke-dashoffset", C.toString());
  circleProgress.setAttribute("transform", `rotate(-90 ${size/2} ${size/2})`);

  const defs = document.createElementNS(svgNS, "defs");
  const grad = document.createElementNS(svgNS, "linearGradient");
  grad.setAttribute("id", "fpGrad");
  grad.setAttribute("x1", "0%");
  grad.setAttribute("y1", "0%");
  grad.setAttribute("x2", "100%");
  grad.setAttribute("y2", "0%");
  const stop1 = document.createElementNS(svgNS, "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "#60a5fa");
  const stop2 = document.createElementNS(svgNS, "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "#34d399");
  grad.appendChild(stop1); grad.appendChild(stop2);
  defs.appendChild(grad);

  svg.appendChild(defs);
  svg.appendChild(circleBg);
  svg.appendChild(circleProgress);
  player.appendChild(svg);

  // --- Center content ---
  const center = document.createElement("div");
  Object.assign(center.style, { display: "grid", placeItems: "center", textAlign: "center", width: "100%", height: "100%" });

  // Title
  const titleEl = document.createElement("div");
  Object.assign(titleEl.style, {
    fontWeight: "600",
    lineHeight: "1.1",
    padding: "0 12px",
    maxWidth: "90%",
    display: "block",
    color: "#e5e7eb",
    fontSize: "clamp(12px, 2.4vw, 16px)",
    textShadow: "0 1px 1px rgba(0,0,0,0.5)"
  });
  center.appendChild(titleEl);

  // Audio
  const audio = document.createElement("audio");
  audio.setAttribute("preload", "metadata");
  audio.style.display = "none";
  center.appendChild(audio);

  // Controls
  const controls = document.createElement("div");
  Object.assign(controls.style, { display: "flex", gap: "8px", alignItems: "center", justifyContent: "center", marginTop: "6px" });

  const btn = (label, title, cb) => {
    const b = document.createElement("button");
    b.textContent = label;
    b.title = title;
    Object.assign(b.style, {
      padding: "6px 10px",
      borderRadius: "9999px",
      border: "1px solid rgba(255,255,255,0.15)",
      background: "rgba(255,255,255,0.08)",
      color: "#fff",
      backdropFilter: "blur(4px)",
      boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      fontSize: "12px",
      cursor: "pointer"
    });
    b.addEventListener("pointerdown", e => e.stopPropagation());
    b.addEventListener("click", cb);
    return b;
  };

  let autoNext = true;
  let currentLang = "eng";
  let currentIndex = 0;

  const nextBtn = btn("⏭", "Next", () => { currentIndex = (currentIndex+1)%playlist.length; loadTrack(); });
  const langBtn = btn("🌐", "Language", () => {
    currentLang = currentLang === "eng" ? "heb" : currentLang === "heb" ? "grk" : "eng";
    loadTrack();
  });
  const sleepBtn = btn("🌙", "Auto-next (sleep) on/off", () => {
    autoNext = !autoNext;
    sleepBtn.style.opacity = autoNext ? "1" : "0.55";
    sleepBtn.style.borderColor = autoNext ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.35)";
  });
  sleepBtn.dataset.active = "1";

  controls.appendChild(langBtn);
  controls.appendChild(nextBtn);
  controls.appendChild(sleepBtn);
  center.appendChild(controls);

  player.appendChild(center);
  document.body.appendChild(player);

  // --- State & playlist ---
  let playlist = [];
  function normalize(list) {
    return (list||[]).map(i => ({ title: i.label||i.title||"Untitled", eng:i.eng||i.src||"", heb:i.heb||i.src||"", grk:i.grk||i.src||"" }));
  }

  function loadTrack() {
    const item = playlist[currentIndex] || {};
    audio.src = item[currentLang] || "";
    titleEl.textContent = `${item.title || "Untitled"} (${currentLang.toUpperCase()})`;
    audio.play().catch(()=>{});
    circleProgress.setAttribute("stroke-dashoffset", C.toString());

    window.dispatchEvent(new CustomEvent("player:nowPlaying", { detail:{ title:item.title||"", lang:currentLang, src:audio.src, index:currentIndex }}));
  }

  function updateProgress() {
    if(!audio.duration || isNaN(audio.duration)){ circleProgress.setAttribute("stroke-dashoffset", C.toString()); return; }
    const p = audio.currentTime/audio.duration;
    circleProgress.setAttribute("stroke-dashoffset",(C*(1-p)).toString());
  }
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", updateProgress);
  audio.addEventListener("progress", updateProgress);
  audio.addEventListener("ended", ()=>{ if(autoNext) { currentIndex=(currentIndex+1)%playlist.length; loadTrack(); }});

  // --- Drag + snap ---
  let isDragging=false, startX, startY, origX, origY;
  function onPointerDown(e){ isDragging=true; const rect=player.getBoundingClientRect(); origX=rect.left; origY=rect.top; startX=e.type.startsWith("touch")?e.touches[0].clientX:e.clientX; startY=e.type.startsWith("touch")?e.touches[0].clientY:e.clientY; player.style.cursor="grabbing"; e.preventDefault(); }
  function onPointerMove(e){ if(!isDragging) return; const clientX=e.type.startsWith("touch")?e.touches[0].clientX:e.clientX; const clientY=e.type.startsWith("touch")?e.touches[0].clientY:e.clientY; player.style.left = origX+(clientX-startX)+"px"; player.style.top = origY+(clientY-startY)+"px"; player.style.right="auto"; player.style.bottom="auto"; }
  function onPointerUp(){ if(!isDragging) return; isDragging=false; player.style.cursor="grab"; snapToEdge(); }
  function snapToEdge(){
    const rect=player.getBoundingClientRect();
    const vw=window.innerWidth, vh=window.innerHeight, margin=12;
    const distances=[rect.left, vw-rect.right, rect.top, vh-rect.bottom];
    const min=Math.min(...distances);
    if(min===distances[1]){ player.style.left="auto"; player.style.right=margin+"px"; }
    else if(min===distances[0]){ player.style.left=margin+"px"; player.style.right="auto"; }
    else if(min===distances[2]){ player.style.top=margin+"px"; player.style.bottom="auto"; }
    else{ player.style.top="auto"; player.style.bottom=margin+"px"; }
  }
  player.addEventListener("mousedown", onPointerDown);
  player.addEventListener("touchstart", onPointerDown,{passive:false});
  window.addEventListener("mousemove", onPointerMove,{passive:true});
  window.addEventListener("touchmove", onPointerMove,{passive:false});
  window.addEventListener("mouseup", onPointerUp);
  window.addEventListener("touchend", onPointerUp);

  // --- Dock button ---
  const dockBtn=document.createElement("button");
  dockBtn.textContent="⫶";
  Object.assign(dockBtn.style,{position:"absolute",top:"6px",right:"8px",padding:"2px 6px",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.15)",background:"rgba(0,0,0,0.25)",color:"#fff",fontSize:"12px",lineHeight:"1",cursor:"pointer"});
  dockBtn.addEventListener("pointerdown",e=>e.stopPropagation());
  let docked=false;
  dockBtn.onclick=()=>{
    docked=!docked;
    if(docked){
      Object.assign(player.style,{width:"100%",maxWidth:"520px",height:"72px",borderRadius:"14px",left:"50%",bottom:"10px",right:"auto",top:"auto",transform:"translateX(-50%)"});
      svg.style.display="none"; ring.style.display="none"; center.style.marginTop="0"; titleEl.style.fontSize="clamp(12px,2.2vw,15px)";
    }else{
      Object.assign(player.style,{width:"190px",height:"190px",borderRadius:"50%",bottom:"1rem",right:"1rem",left:"auto",top:"auto",transform:"none"});
      svg.style.display=""; ring.style.display=""; center.style.marginTop="0"; snapToEdge();
    }
  };
  player.appendChild(dockBtn);

  // --- External hooks ---
  window.addEventListener("player:updatePlaylist", e=>{ playlist=normalize(e.detail.playlist||[]); currentIndex=0; loadTrack(); });
  window.addEventListener("player:setLang", e=>{ const l=e.detail.lang?.toLowerCase(); if(["eng","heb","grk"].includes(l)){ currentLang=l; loadTrack(); } });

  // --- Auto-load weekData ---
  if(window.weekData?.sections?.audio_playlist){ playlist=normalize(window.weekData.sections.audio_playlist); }
  loadTrack();
}

document.addEventListener("DOMContentLoaded", setupFloatingPlayer);
