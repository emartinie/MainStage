
async function loadQuestionCards() {
  const container = document.getElementById("bibleStage");
  if (!container) {
    console.error("❌ bibleStage element not found");
    return;
  }

  try {
    // adjust this path if needed
    const res = await fetch("../data/questions/bible_questions.json");
    if (!res.ok) throw new Error("HTTP " + res.status);

    const questions = await res.json();
    container.innerHTML = "";

    questions.forEach(q => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="question">${q.id}. ${q.question}</div>
        <div class="answer">${q.answer}</div>
      `;
      container.appendChild(card);
    });

    console.log("✅ Question cards loaded successfully");
  } catch (err) {
    console.error("❌ Failed to load question cards:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadQuestionCards);