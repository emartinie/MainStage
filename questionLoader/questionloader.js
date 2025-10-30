async function loadQuestionCards() {
  const container = document.getElementById("bibleStage");
  container.innerHTML = "<p class='text-gray-500 text-center'>Loading questions...</p>";

  try {
    let questions = [];

    // Try to fetch from JSON file (works if served from a server)
    try {
      const res = await fetch("./data/questions/bible_questions.json");
      if (res.ok) {
        questions = await res.json();
      } else {
        throw new Error("Fetch failed");
      }
    } catch {
      console.warn("Fetch failed — using offline import");
      questions = window.bibleQuestions || [];
    }

    container.innerHTML = ""; // clear loader text

    if (!questions.length) {
      container.innerHTML = "<p class='text-gray-400 text-center'>No questions found.</p>";
      return;
    }

    questions.forEach((q, i) => {
      const card = document.createElement("div");
      card.className = "card border rounded-xl shadow-md bg-white dark:bg-gray-800 p-4 mb-3 transition-transform hover:scale-[1.02] duration-300";

      const questionEl = document.createElement("h3");
      questionEl.className = "font-bold text-lg mb-2";
      questionEl.textContent = ${i + 1}. ${q.question};

      const answerEl = document.createElement("p");
      answerEl.className = "text-gray-600 dark:text-gray-300 hidden";
      answerEl.textContent = Answer: ${q.answer};

      const showBtn = document.createElement("button");
      showBtn.textContent = "Show Answer";
      showBtn.className = "mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700";
      showBtn.onclick = () => {
        answerEl.classList.toggle("hidden");
        showBtn.textContent = answerEl.classList.contains("hidden")
          ? "Show Answer"
          : "Hide Answer";
      };

      card.appendChild(questionEl);
      if (q.options) {
        const opts = document.createElement("ul");
        opts.className = "list-disc ml-5 mb-2";
        q.options.forEach(opt => {
          const li = document.createElement("li");
          li.textContent = opt;
          opts.appendChild(li);
        });
        card.appendChild(opts);
      }
      card.appendChild(showBtn);
      card.appendChild(answerEl);

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Error loading questions:", err);
    container.innerHTML = <p class="text-red-600 text-center">Error loading questions</p>;
  }
}

loadQuestionCards();