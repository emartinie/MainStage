const ranges = {
  B: [1, 15],
  I: [16, 30],
  B2: [31, 45],
  L: [46, 60],
  E: [61, 75]
};

let called = new Set();
let timer = null;

function getNextNumber() {
  if (called.size >= 75) return null;

  let num;
  do {
    num = Math.floor(Math.random() * 75) + 1;
  } while (called.has(num));

  called.add(num);
  return num;
}

function getColumn(num) {
  if (num <= 15) return "B";
  if (num <= 30) return "I";
  if (num <= 45) return "B";
  if (num <= 60) return "L";
  return "E";
}

function callNext() {
  const num = getNextNumber();
  if (!num) return;

  const col = getColumn(num);
  displayCall(col, num);
}

function startAuto(intervalMs) {
  if (timer) return;
  timer = setInterval(callNext, intervalMs);
}

function pauseAuto() {
  clearInterval(timer);
  timer = null;
}

function resetGame() {
  pauseAuto();
  called.clear();
  clearDisplay();
}