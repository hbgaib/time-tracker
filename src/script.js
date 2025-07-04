
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
  [...history].reverse().forEach(e => {
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



function onAddSubtract(type, deltaSeconds) {
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

  const btn = document.getElementById('countBtn');
  btn.textContent = 'Stop Countdown';
  btn.classList.add('state-stop');
  btn.classList.remove('state-start');
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
  const btn = document.getElementById('countBtn');
  btn.textContent = 'Start Countdown';
  btn.classList.add('state-start');
  btn.classList.remove('state-stop');
}


function init() {
  remainingSeconds = parseInt(localStorage.getItem('remainingSeconds')) || 0;
  history        = JSON.parse(localStorage.getItem('history'))    || [];
  undoStack      = JSON.parse(localStorage.getItem('undoStack'))  || [];
  isCounting     = localStorage.getItem('isCounting') === 'true';
  startTimestamp = parseInt(localStorage.getItem('startTimestamp')) || 0;

  updateDisplay(remainingSeconds);
  renderHistory();

  const btn = document.getElementById('countBtn');
  if (isCounting) {
    btn.textContent = 'Stop Countdown';
    btn.classList.add('state-stop');
    btn.classList.remove('state-start');
    if (remainingSeconds > 0) {
      beginCountdown();
    } else {
      triggerAlarmLoop();
    }
  } else {
    btn.textContent = 'Start Countdown';
    btn.classList.add('state-start');
    btn.classList.remove('state-stop');
  }
}

document.addEventListener('DOMContentLoaded', () => {
    init();

    const hourInput = document.getElementById('hourInput');
    const minuteInput = document.getElementById('minuteInput');
    const formError = document.getElementById('formError');
    const applyAddBtn = document.getElementById('applyAdd');
    const applySubBtn = document.getElementById('applySub');

    function validateInputs() {
        const hVal = hourInput.value;
        const mVal = minuteInput.value;

        const h = parseInt(hVal);
        const m = parseInt(mVal);

        const isHourValid = (!isNaN(h) && h >= 0) || hVal === '';
        const isMinuteValid = (!isNaN(m) && m >= 0) || mVal === '';

        const isBothEmpty = hVal === '' && mVal === '';

        if (isHourValid && isMinuteValid && !isBothEmpty) {
            formError.classList.remove('visible');
            applyAddBtn.disabled = false;
            applySubBtn.disabled = false;
        } else {
            formError.classList.add('visible');
            applyAddBtn.disabled = true;
            applySubBtn.disabled = true;
        }
    }

    hourInput.addEventListener('input', validateInputs);
    minuteInput.addEventListener('input', validateInputs);

    applyAddBtn.addEventListener('click', () => {
        let hours = parseInt(hourInput.value) || 0;
        let minutes = parseInt(minuteInput.value) || 0;

        if (minutes >= 60) {
            const extraHours = Math.floor(minutes / 60);
            hours += extraHours;
            minutes = minutes % 60;
        }

        const deltaSeconds = hours * 3600 + minutes * 60;
        if (deltaSeconds === 0) return;

        onAddSubtract('add', deltaSeconds);
        hourInput.value = '';
        minuteInput.value = '';
        validateInputs();
    });

    applySubBtn.addEventListener('click', () => {
        let hours = parseInt(hourInput.value) || 0;
        let minutes = parseInt(minuteInput.value) || 0;

        if (minutes >= 60) {
            const extraHours = Math.floor(minutes / 60);
            hours += extraHours;
            minutes = minutes % 60;
        }

        const deltaSeconds = hours * 3600 + minutes * 60;
        if (deltaSeconds === 0) return;

        onAddSubtract('sub', deltaSeconds);
        hourInput.value = '';
        minuteInput.value = '';
        validateInputs();
    });

    document.getElementById('undoBtn').addEventListener('click', onUndo);
    document.getElementById('countBtn').addEventListener('click', () => {
        isCounting ? stopCountdown() : startCountdown();
    });

    validateInputs(); // Initial validation on page load
});
