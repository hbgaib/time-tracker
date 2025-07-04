# Time Tracker CLI Project (All‑In‑One Spec)

## 1. Project Overview  
A **pure‑JavaScript** browser widget that lets you:
- **Add/Subtract Time** (HH:MM:SS) without reloading the page  
- **Undo** any last action  
- **View History** of every operation  
- **Start/Stop Countdown** with real‑time ticking, alarm on zero, and perfect button toggling  
- **Persist** everything in `localStorage` so reloads restore your exact state  

> **Key UX Fix:** All inputs and buttons must use JS event handlers (`event.preventDefault()`) or non‑form elements to avoid any page refresh.

---

## 2. Technology & Dependencies  
- JavaScript ES6+ (no frameworks; optional: [date‑fns](https://date-fns.org/))  
- HTML/CSS minimal (no `<form>` submits)  
- **localStorage** for state  
- `alarm.mp3` in project root  

---

## 3. Project Structure  
src/index.html
src/ringtone.mp3
src/style.css
src/alarm.mp3


---

## 4. UI Elements (HTML IDs & Classes)

```html
<div id="display">00:00:00</div>

<!-- Wrap inputs/buttons in a <div> or <section>—no <form> tags -->
<div id="controls">
  <button id="addBtn">+ Add Time</button>
  <button id="subBtn">− Subtract Time</button>
  <button id="undoBtn">⎌ Undo</button>
  <button id="countBtn">Start Countdown</button>
</div>

<ul id="history"></ul>
```

## 5. Data Model & Persistence Keys
// In-memory / JS variables:
let remainingSeconds;        // integer ≥ 0
let history = [];            // [{ type, seconds, timestamp }]
let undoStack = [];          // same shape as history
let isCounting = false;      // boolean
let startTimestamp = 0;      // ms since epoch

// localStorage keys:
'remainingSeconds'  → Number
'history'           → JSON.stringify(Array)
'undoStack'         → JSON.stringify(Array)
'isCounting'        → "true"|"false"
'startTimestamp'    → Number

On EVERY state change (add/subtract/undo/countdown tick/start/stop/alarm stop) call:

localStorage.setItem('remainingSeconds', remainingSeconds);
localStorage.setItem('history', JSON.stringify(history));
localStorage.setItem('undoStack', JSON.stringify(undoStack));
localStorage.setItem('isCounting', isCounting);
localStorage.setItem('startTimestamp', startTimestamp);

## 6. Functional Logic (Super‑Detailed)

### 6.1. Initialization (Page Load)

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
    const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
    remainingSeconds = Math.max(0, remainingSeconds - elapsed);
    updateDisplay(remainingSeconds);
    localStorage.setItem('remainingSeconds', remainingSeconds);

    if (remainingSeconds > 0) {
      beginCountdown();       // resumes ticking, sets button to "Stop Countdown"
    } else {
      // Already reached zero while away
      triggerAlarmLoop();     // alarm.play()
      document.getElementById('countBtn').textContent = 'Stop Countdown';
    }
  } else {
    document.getElementById('countBtn').textContent = 'Start Countdown';
  }
}

### 6.2. Add / Subtract Time

function onAddSubtract(type) {
  // Prompt or fixed increments; use prompt() for custom HH:MM:SS
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

- buttons
  addBtn.addEventListener('click', () => onAddSubtract('add'));
subBtn.addEventListener('click', () => onAddSubtract('sub'));

### 6.3. Undo

function onUndo() {
  if (!undoStack.length) return;
  const last = undoStack.pop();

  // Remove from history
  history = history.filter(e => e !== last);

  // Reverse effect
  remainingSeconds += (last.type === 'sub' ? last.seconds : -last.seconds);
  remainingSeconds = Math.max(0, remainingSeconds);

  updateDisplay(remainingSeconds);
  renderHistory();
  persistAll();
}
undoBtn.addEventListener('click', onUndo);

### 6.4. Countdown Control
#### Start Countdown
let timerID, alarm = new Audio('alarm.mp3');
alarm.loop = true;

function startCountdown() {
  isCounting = true;
  startTimestamp = Date.now();
  persistAll();

  document.getElementById('countBtn').textContent = 'Stop Countdown';
  beginCountdown();
}

#### Tick Function & Alarm Trigger
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

function triggerAlarmLoop() {
  alarm.play();
}

#### Stop Countdown (Pause or Alarm‑Stop)
function stopCountdown() {
  clearInterval(timerID);

  // If alarm is playing: this is a “time‑up” stop
  if (!alarm.paused) {
    alarm.pause();
    alarm.currentTime = 0;
    remainingSeconds = 0;
  } else {
    // Normal pause before zero
    const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
    remainingSeconds = Math.max(0, remainingSeconds - 0 /* already updated each tick */);
    
    // Record as history entry
    const entry = { type: 'countdown', seconds: elapsed, timestamp: Date.now() };
    history.push(entry);
    undoStack.push(entry);
    renderHistory();
  }

  isCounting = false;
  persistAll();
  document.getElementById('countBtn').textContent = 'Start Countdown';
}

document.getElementById('countBtn').addEventListener('click', () => {
  isCounting ? stopCountdown() : startCountdown();
});

### 6.5. Helper Functions
function updateDisplay(sec) {
  const h = String(Math.floor(sec/3600)).padStart(2,'0');
  const m = String(Math.floor((sec%3600)/60)).padStart(2,'0');
  const s = String(sec%60).padStart(2,'0');
  document.getElementById('display').textContent = `${h}:${m}:${s}`;
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





