# Time Tracker CLI Project – Improved Validation & Error Placement

## 1. Error Message Placement  
- Move the error `<p id="formError">…</p>` out of the form and position it **immediately above** the history list (`#history`), so it never shifts the input layout.  
- Use CSS `visibility` instead of `display` to show/hide the error message, preventing any reflow of surrounding elements:
  ```css
  #formError {
    visibility: hidden;
    color: #d9534f;
    font-size: 0.85em;
    margin: 10px 0;
  }
  #formError.visible {
    visibility: visible;
  }
## 2. Optional Input Filling Logic
- Treat empty hour/minute inputs as 0 instead of invalid.

- Only require at least one of the two inputs to be ≥ 0. If both are empty, show the error.

- On submission:
  let h = parseInt(hourInput.value, 10);
let m = parseInt(minuteInput.value, 10);
if (isNaN(h)) h = 0;
if (isNaN(m)) m = 0;
// Now h and m are guaranteed numbers ≥ 0
if (h < 0 || m < 0) showError();
else proceed();

- Disable Add/Subtract buttons only when both inputs are empty or either value is negative.

## 3. Updated Validation & UX
1. On input change:

- Read both hourInput.value and minuteInput.value.

- If (h ≥ 0 || m ≥ 0) and no non‑numeric characters, hide error and enable buttons.

- Otherwise, show error and disable buttons.

2. On Add/Subtract click:

- h and m default to 0 if left empty.

- Convert excess minutes:
const extra = Math.floor(m / 60);
h += extra;
m %= 60;

- Compute deltaSeconds = h * 3600 + m * 60.

- Reset both inputs to '' after successful submission

## 4. Placement in HTML
```<!-- After the #controls div and before the #history list -->
<p id="formError">Please enter at least one non‑negative number (hours or minutes).</p>
<ul id="history"></ul>
```

## 5. Instructions for Gemini CLI
Paste this entire markdown into your .md prompt file. The CLI should generate updated HTML, CSS, and JS that:

Moves the error message above the history and uses visibility toggling to prevent layout shifts.

Allows users to fill only one of the two inputs (hour or minute) and treats the other as zero.

Validates that at least one is ≥ 0 and neither is negative; disables buttons otherwise.

Converts large minute values into hours automatically.

Integrates seamlessly with existing countdown, undo, history, and persistence logic.