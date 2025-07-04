# Time Tracker CLI Project – Reverse History Order

## New Requirement  
- **Render the history list newest → oldest** (top of the list should show the most recent action).

## Changes to Implement

1. **Modify `renderHistory()`**  
   - Instead of iterating `history` from index 0 → end, iterate it in reverse order:  
     ```js
     // Old:
     history.forEach(e => { /* append li for e */ });

     // New:
     [...history].reverse().forEach(e => {
       // create and append <li> for e exactly as before
     });
     ```

2. **Alternatively**, when you push new entries onto `history`, you can use `history.unshift(entry)` so that the newest item is always at index 0, and then render normally. But **do not** break undo logic or persistence—ensure `history` remains a plain array serialized exactly as before.

3. **Ensure** that all other logic (add, subtract, undo, countdown stop) still pushes entries correctly and that persistence to `localStorage` remains unchanged.

## Instructions for Gemini CLI  
Copy **all** of this markdown into your `.md` prompt file and run the Gemini CLI. The generated code should:

- Update the `renderHistory()` function to display the newest history entries at the top.  
- Keep the rest of the time‑tracker logic (add, subtract, undo, countdown, persistence) exactly as it was.  
