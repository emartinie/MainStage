/* --------------- Cosmic Render Cards Module --------------- */

function renderCards(comments) {
  const container = document.getElementById('cardsContainer');
  if (!container) return;

  container.innerHTML = '';
  const currentWeek = typeof getCurrentWeekNumber === "function" 
                        ? getCurrentWeekNumber() 
                        : null;

  comments.forEach(item => {
    const card = document.createElement('div');
    card.className = `
      bg-white rounded-lg shadow-md overflow-hidden transition-all duration-500
      hover:shadow-xl transform hover:-translate-y-1
    `;
    if (item.week === currentWeek) {
      card.classList.add('ring-4', 'ring-yellow-400');
    }

    // Header button
    const header = document.createElement('button');
    header.className = 'w-full text-left px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold';
    header.textContent = `Week ${item.week} Commentary`;
    header.addEventListener('click', () => toggleCardContent(content));

    // Content wrapper (collapsible)
    const content = document.createElement('div');
    content.className = 'p-4 max-h-0 overflow-hidden transition-max-height duration-500 ease-in-out';

    // Commentary
    const p = document.createElement('p');
    p.innerHTML = item.commentary.replace(/\\n/g, '<br>');
    content.appendChild(p);

    // Hidden Quiz
    const quiz = document.createElement('div');
    quiz.id = `quizWeek${item.week}`;
    quiz.className = 'hidden mt-4 p-2 border border-gray-300 rounded';
    quiz.innerHTML = <strong>Quiz goes here for Week ${item.week}</strong>;
    content.appendChild(quiz);

    // Optional scripture section
    if (item.scripture) {
      const scriptDiv = document.createElement('div');
      scriptDiv.id = `scriptureWeek${item.week}`;
      scriptDiv.className = 'hidden mt-4 p-2 bg-gray-50 border-l-4 border-blue-500 rounded';
      scriptDiv.innerHTML = item.scripture.replace(/\\n/g, '<br>');
      content.appendChild(scriptDiv);
    }

    card.appendChild(header);
    card.appendChild(content);
    container.appendChild(card);
  });
}

/* --------------- Expand/Collapse Animation Function --------------- */
function toggleCardContent(content) {
  if (content.style.maxHeight && content.style.maxHeight !== '0px') {
    content.style.maxHeight = '0';
  } else {
    content.style.maxHeight = content.scrollHeight + 'px';
  }
  refreshContainer();
}

/* --------------- Toggle Quiz/Scripture Sections --------------- */
function toggleQuiz(weekNum) {
  const quizDiv = document.getElementById(`quizWeek${weekNum}`);
  if (quizDiv) quizDiv.classList.toggle('hidden');
  refreshContainer();
}
function toggleScripture(weekNum) {
  const scriptDiv = document.getElementById(`scriptureWeek${weekNum}`);
  if (scriptDiv) scriptDiv.classList.toggle('hidden');
  refreshContainer();
}

/* --------------- Refresh Container Layout --------------- */
function refreshContainer() {
  const container = document.getElementById('cardsContainer');
  if (!container) return;
  container.style.display = 'none';
  container.offsetHeight; // force reflow
  container.style.display = 'block';
}

/* --------------- Optional Highlight Week --------------- */
function highlightWeek(weekNum) {
  const container = document.getElementById('cardsContainer');
  if (!container) return;
  Array.from(container.children).forEach(card => {
    card.classList.remove('ring-4', 'ring-yellow-400');
    const headerText = card.querySelector('button')?.textContent;
    if (headerText && headerText.includes(`Week ${weekNum}`)) {
      card.classList.add('ring-4', 'ring-yellow-400');
    }
  });
}