
let remainingSeconds;
let history = [];
let undoStack = [];
let isCounting = false;
let startTimestamp = 0;
let timerID;
let alarm = new Audio('alarm.mp3');
alarm.loop = true;

function updateDisplay(sec) {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  document.getElementById('display').textContent = `${h}:${m}:${s}`;
}

function formatHHMMSS(sec) {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function renderHistory() {
  const ul = document.getElementById('history');
  ul.innerHTML = '';
  history.forEach(e => {
    const li = document.createElement('li');
    const sign = e.type === 'sub' ? '−' : e.type === 'add' ? '+' : '';
    li.textContent = `${new Date(e.timestamp).toLocaleString()} → ${sign}${formatHHMMSS(e.seconds)} [${e.type}]`;
    ul.appendChild(li);
  });
}

function persistAll() {
  localStorage.setItem('remainingSeconds', remainingSeconds);
  localStorage.setItem('history', JSON.stringify(history));
  localStorage.setItem('undoStack', JSON.stringify(undoStack));
  localStorage.setItem('isCounting', isCounting);
  localStorage.setItem('startTimestamp', startTimestamp);
}

function promptForSeconds(type) {
    let input = prompt(`Enter HH:MM:SS to ${type} (e.g., 01:30:00 for 1 hour 30 minutes):`);
    if (!input) return 0;

    const parts = input.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
        seconds = parts[0];
    } else {
        alert('Invalid format. Please use HH:MM:SS, MM:SS, or SS.');
        return 0;
    }
    return seconds;
}

function onAddSubtract(type) {
  const deltaSeconds = promptForSeconds(type);
  if (deltaSeconds <= 0) return;

  const entry = { type, seconds: deltaSeconds, timestamp: Date.now() };
  history.push(entry);
  undoStack.push(entry);

  remainingSeconds += (type === 'add' ? deltaSeconds : -deltaSeconds);
  remainingSeconds = Math.max(0, remainingSeconds);

  updateDisplay(remainingSeconds);
  renderHistory();
  persistAll();
}

function onUndo() {
  if (!undoStack.length) return;
  const last = undoStack.pop();

  history = history.filter(e => e !== last);

  remainingSeconds += (last.type === 'sub' ? last.seconds : -last.seconds);
  remainingSeconds = Math.max(0, remainingSeconds);

  updateDisplay(remainingSeconds);
  renderHistory();
  persistAll();
}

function triggerAlarmLoop() {
  alarm.play();
}

function beginCountdown() {
  const initial = remainingSeconds;
  timerID = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
    const current = Math.max(0, initial - elapsed);

    remainingSeconds = current;
    updateDisplay(current);
    localStorage.setItem('remainingSeconds', current);

    if (current === 0) {
      clearInterval(timerID);
      triggerAlarmLoop();
    }
  }, 1000);
}

function startCountdown() {
  isCounting = true;
  // Reset startTimestamp on every resume
  startTimestamp = Date.now();
  persistAll(); // Persist updated startTimestamp immediately

  document.getElementById('countBtn').textContent = 'Stop Countdown';
  beginCountdown();
}

function stopCountdown() {
  clearInterval(timerID);

  if (!alarm.paused) {
    alarm.pause();
    alarm.currentTime = 0;
    remainingSeconds = 0;
  } else {
    const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
    // remainingSeconds = Math.max(0, remainingSeconds - elapsed); // Removed: already updated each tick
    
    const entry = { type: 'countdown', seconds: elapsed, timestamp: Date.now() };
    history.push(entry);
    undoStack.push(entry);
    renderHistory();
  }

  isCounting = false;
  persistAll();
  document.getElementById('countBtn').textContent = 'Start Countdown';
}


function init() {
  remainingSeconds = parseInt(localStorage.getItem('remainingSeconds')) || 0;
  history        = JSON.parse(localStorage.getItem('history'))    || [];
  undoStack      = JSON.parse(localStorage.getItem('undoStack'))  || [];
  isCounting     = localStorage.getItem('isCounting') === 'true';
  startTimestamp = parseInt(localStorage.getItem('startTimestamp')) || 0;

  updateDisplay(remainingSeconds);
  renderHistory();

  if (isCounting) {
    // Compute missed elapsed while page was closed
    // The beginCountdown will handle the elapsed time, so no need to subtract here.
    // const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
    // remainingSeconds = Math.max(0, remainingSeconds - elapsed);
    // updateDisplay(remainingSeconds);
    // localStorage.setItem('remainingSeconds', remainingSeconds);

    if (remainingSeconds > 0) {
      beginCountdown();
    } else {
      triggerAlarmLoop();
      document.getElementById('countBtn').textContent = 'Stop Countdown';
    }
  } else {
    document.getElementById('countBtn').textContent = 'Start Countdown';
  }
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    document.getElementById('addBtn').addEventListener('click', () => onAddSubtract('add'));
    document.getElementById('subBtn').addEventListener('click', () => onAddSubtract('sub'));
    document.getElementById('undoBtn').addEventListener('click', onUndo);
    document.getElementById('countBtn').addEventListener('click', () => {
        isCounting ? stopCountdown() : startCountdown();
    });
});
