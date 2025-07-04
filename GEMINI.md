# Time Tracker CLI Project – Countdown Button Color States

## New Requirement  
The countdown button (`#countBtn`) should visually reflect its current state by using different colors for “Start Countdown” vs. “Stop Countdown.”

## Changes to Implement

1. **CSS**  
   - Define two new utility classes:
     ```css
     /* Green for “Start Countdown” */
     .state-start {
       background-color: #28a745;
     }
     .state-start:hover {
       background-color: #218838;
     }

     /* Red for “Stop Countdown” */
     .state-stop {
       background-color: #dc3545;
     }
     .state-stop:hover {
       background-color: #c82333;
     }
     ```
   - Ensure these override the existing `#controls button` styles. You may increase specificity if needed:
     ```css
     #countBtn.state-start,
     #countBtn.state-stop {
       color: #fff;
     }
     ```

2. **JavaScript**  
   - Whenever the button text is set to **“Start Countdown”**, make sure `#countBtn` has class `state-start` and does **not** have `state-stop`.
   - Whenever the button text is set to **“Stop Countdown”**, make sure `#countBtn` has class `state-stop` and does **not** have `state-start`.
   - Update **`init()`** to apply the correct class on page load based on `isCounting`:
     ```js
     const btn = document.getElementById('countBtn');
     if (isCounting) {
       btn.textContent = 'Stop Countdown';
       btn.classList.add('state-stop');
       btn.classList.remove('state-start');
     } else {
       btn.textContent = 'Start Countdown';
       btn.classList.add('state-start');
       btn.classList.remove('state-stop');
     }
     ```
   - In **`startCountdown()`**, after you change the text to “Stop Countdown”:
     ```js
     btn.classList.add('state-stop');
     btn.classList.remove('state-start');
     ```
   - In **`stopCountdown()`**, after you change the text to “Start Countdown”:
     ```js
     btn.classList.add('state-start');
     btn.classList.remove('state-stop');
     ```

3. **No Other Changes**  
   - All existing countdown, add/subtract, undo, history, and persistence logic remains unchanged. Only CSS and the few class‑toggling lines in JS are added.

## Instructions for Gemini CLI  
Copy **all** of this markdown into your `.md` prompt file and run Gemini CLI. The generated code should include:

- Updated **CSS** (new `.state-start` / `.state-stop` selectors).  
- Updated **JavaScript** to toggle these classes in `init()`, `startCountdown()`, and `stopCountdown()`.  
- The rest of your time‑tracker code untouched.  
