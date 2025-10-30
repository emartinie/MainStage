/* ---------------- Render Cards Module ---------------- */

function renderCards(comments) {
  const container = document.getElementById('cardsContainer');
  if (!container) return;

  container.innerHTML = ''; // Clear existing content

  const currentWeek = typeof getCurrentWeekNumber === "function" 
                      ? getCurrentWeekNumber() 
                      : null;

  comments.forEach(item => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300';

    // Highlight current week
    if (item.week === currentWeek) {
      card.classList.add('ring-4', 'ring-yellow-400');
    }

    // Header button
    const header = document.createElement('button');
    header.className = 'w-full text-left px-4 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700';
    header.textContent = Week ${item.week} Commentary;
    header.addEventListener('click', () => content.classList.toggle('hidden'));

    // Content container
    const content = document.createElement('div');
    content.className = 'p-4 hidden';

    // Paragraph text
    const p = document.createElement('p');
    p.innerHTML = item.commentary.replace(/\\n/g, '<br>');
    content.appendChild(p);

    // Hidden quiz section
    const quiz = document.createElement('div');
    quiz.id = quizWeek${item.week};
    quiz.className = 'hidden mt-4 p-2 border border-gray-300 rounded';
    quiz.innerHTML = <strong>Quiz goes here for Week ${item.week}</strong>;
    content.appendChild(quiz);

    // Assemble card
    card.appendChild(header);
    card.appendChild(content);
    container.appendChild(card);
  });
}

// Optional function to toggle quiz programmatically
function toggleQuiz(weekNum) {
  const quizDiv = document.getElementById(quizWeek${weekNum});
  if (quizDiv) quizDiv.classList.toggle('hidden');
}

// Optional: highlight a week manually
function highlightWeek(weekNum) {
  const container = document.getElementById('cardsContainer');
  if (!container) return;
  Array.from(container.children).forEach(card => {
    card.classList.remove('ring-4', 'ring-yellow-400');
    const headerText = card.querySelector('button')?.textContent;
    if (headerText && headerText.includes(Week ${weekNum})) {
      card.classList.add('ring-4', 'ring-yellow-400');
    }
  });
}