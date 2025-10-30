/* =========================
   renderCosmicCards_v4.17.js
   Modular, scrollable, animated cosmic cards
   Includes: particles, standalone trivia, smooth animations, glowing badges
   Compatible with mainStageLoader.js
   ========================= */

(() => {
  console.log("[RenderCosmicCards v4.17] Initializing...");

  /* ------------------ Inject CSS ------------------ */
  function injectCosmicCSS() {
    const css = `
    #cardsContainer {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      overflow-y: auto;
      max-height: 90vh;
      position: relative;
    }
    #cardsContainer .cosmic-particles {
      position: absolute;
      top:0; left:0; right:0; bottom:0;
      pointer-events:none;
      z-index:0;
    }
    .cosmic-card {
      background: linear-gradient(145deg, #1a1a2e, #162447);
      color: #f0f0f0;
      border-radius: 1rem;
      padding: 1rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      overflow-y: auto;
      max-height: 70vh;
      scroll-behavior: smooth;
      position: relative;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      z-index: 1;
    }
    .cosmic-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.5);
    }
    .cosmic-header {
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .cosmic-card::before, .cosmic-card::after {
      content: "";
      position: sticky;
      left: 0; right: 0; height: 1rem;
      pointer-events: none;
      z-index: 2;
    }
    .cosmic-card::before {
      top: 0;
      background: linear-gradient(to bottom, #1a1a2e 0%, transparent 100%);
    }
    .cosmic-card::after {
      bottom: 0;
      background: linear-gradient(to top, #1a1a2e 0%, transparent 100%);
    }
    .cosmic-toggle-btn {
      background: #0f3460;
      color: #f0f0f0;
      border: none;
      border-radius: 0.5rem;
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .cosmic-toggle-btn:hover {
      background: #162447;
    }
    .cosmic-badge {
      background: #e94560;
      color: white;
      font-weight: bold;
      border-radius: 999px;
      padding: 0.25rem 0.5rem;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(233,69,96,0.7);}
      50% { box-shadow: 0 0 10px 5px rgba(233,69,96,0.5);}
    }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
  injectCosmicCSS();
(function injectCosmicCSS() {
  const css = `
  
  
  /* --- Container setup --- */
  #cardsContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    overflow-y: auto;
    max-height: calc(100vh - 160px); /* fits within viewport */
    padding: 1rem;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.4) transparent;
  }

  /* --- Individual card behavior --- */
  .card {
    width: 90%;
    max-width: 800px;
    background: rgba(15, 23, 42, 0.85);
    color: #fff;
    border-radius: 1rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    backdrop-filter: blur(10px);
    padding: 1.5rem;
    overflow: visible;
    max-height: none;
 /* prevents it from being taller than viewport */
    transition: all 0.4s ease;
  }

  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(255,255,255,0.15);
  }

  .card::-webkit-scrollbar {
    width: 6px;
  }
  .card::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.3);
    border-radius: 3px;
  }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
})();
/* ------------------ Heroicons inline ------------------ */
function getHeroIcon(name) {
  const icons = {
    "book-open": `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/>
      </svg>
    `,
    "play": `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M14.752 11.168l-6.338-3.633A1 1 0 007 8.364v7.272a1 1 0 001.414.914l6.338-3.633a1 1 0 000-1.732z"/>
      </svg>
    `
  };
  return icons[name] || "";
}

  /* ------------------ Particle background ------------------ */
  function createParticles(container){
    const canvas = document.createElement("canvas");
    canvas.className = "cosmic-particles";
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const stars = Array.from({length:50},()=>({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: Math.random()*1.5+0.5,
      dx:(Math.random()-0.5)/2,
      dy:(Math.random()-0.5)/2
    }));

    function animate(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      stars.forEach(s=>{
        s.x+=s.dx; s.y+=s.dy;
        if(s.x<0)s.x=canvas.width;
        if(s.x>canvas.width)s.x=0;
        if(s.y<0)s.y=canvas.height;
        if(s.y>canvas.height)s.y=0;
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle="rgba(255,255,255,0.6)";
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  /* ------------------ Layout refresher ------------------ */
  function refreshLayout(){
    const container = document.getElementById("cardsContainer");
    if(!container) return;
    Array.from(container.children).forEach(card=>{card.style.marginBottom="1rem";});
    console.log("[RenderCosmicCards v4.17] Layout refreshed");
  }
  window.refreshLayout = refreshLayout;

  /* ------------------ Safe Geolocation ------------------ */
  function getCurrentLocation(success, fail){
    if("geolocation" in navigator){
      navigator.geolocation.getCurrentPosition(success, fail);
    } else { console.warn("[RenderCosmicCards] Geolocation unavailable"); if(fail) fail();}
  }
  window.getCurrentLocation = getCurrentLocation;

  /* ------------------ Render a single card ------------------ */
  function renderCard(week,data){
    const container = document.getElementById("cardsContainer");
    if(!container) return;

    const card = document.createElement("div");
    card.className="cosmic-card";

    const header = document.createElement("div");
    header.className="cosmic-header";
    header.innerHTML=`<span class="cosmic-badge">Week ${week}</span> ${getHeroIcon("book-open")} ${data.title||"Title Placeholder"}`;
    card.appendChild(header);

    const commentary = document.createElement("div");
    commentary.className="cosmic-commentary";
    commentary.innerHTML=data.commentary||"Commentary placeholder";
    card.appendChild(commentary);

    if(data.scripture){
      const scrDiv=document.createElement("div");
      scrDiv.className="cosmic-scripture";
      scrDiv.innerHTML=`<strong>Scripture:</strong> ${data.scripture}`;
      card.appendChild(scrDiv);
    }

    if(data.quiz){
      const quizBtn=document.createElement("button");
      quizBtn.className="cosmic-toggle-btn";
      quizBtn.textContent="Toggle Quiz";
      quizBtn.addEventListener("click",()=>{
        const quizDiv = card.querySelector(".cosmic-quiz");
        if(quizDiv) quizDiv.style.display=quizDiv.style.display==="none"? "":"none";
      });
      card.appendChild(quizBtn);

      const quizDiv=document.createElement("div");
      quizDiv.className="cosmic-quiz";
      quizDiv.style.display="none";
      quizDiv.innerHTML=data.quiz;
      card.appendChild(quizDiv);
    }

    container.appendChild(card);
  }

  /* ------------------ Render Standalone Trivia Card ------------------ */
  function renderTriviaCard(triviaData){
    const container=document.getElementById("cardsContainer");
    if(!container) return;

    const card=document.createElement("div");
    card.className="cosmic-card cosmic-trivia-card";

    const header=document.createElement("div");
    header.className="cosmic-header";
    header.innerHTML=`<span class="cosmic-badge">Trivia</span> ${getHeroIcon("book-open")} Trivia Time!`;
    card.appendChild(header);

    const triviaDiv=document.createElement("div");
    triviaDiv.className="cosmic-trivia-content";
    triviaDiv.innerHTML=triviaData || "Trivia placeholder content";
    card.appendChild(triviaDiv);

    container.appendChild(card);
  }

  /* ------------------ Expose functions ------------------ */
  window.renderCard=renderCard;
  window.renderTriviaCard=renderTriviaCard;
  console.log("[RenderCosmicCards v4.17] Initialized");

})();