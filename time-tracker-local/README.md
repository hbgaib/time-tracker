# Local Time Tracker

This is a simple, client-side web application that allows you to track time allowances in hours and minutes. It runs entirely in your browser, with no server-side components or external libraries.

## Features

-   **Time Tracking:** Add or subtract time using both hours (optional) and minutes (required).
-   **History Log:** View a chronological history of all time additions and subtractions.
-   **Persistence:** All data (total time and history) is saved locally in your browser's `localStorage`, so your progress is retained even if you close the browser.
-   **Responsive Design:** The interface is designed to work well on both desktop and mobile devices.

## How to Run Locally

1.  **Clone or Download:** Get the project files to your local machine.
2.  **Open `index.html`:** Simply open the `index.html` file in your web browser. You can do this by double-clicking the file or by dragging it into an open browser window.

That's it! The application will load and be ready to use.

## Usage

To add or subtract time:

1.  **Enter Hours (Optional):** You can enter a number in the "Enter hours" field. If left blank, it will be treated as 0 hours.
2.  **Enter Minutes (Required):** You must enter a number in the "Enter minutes" field. This value must be a non-negative integer.
3.  **Click a Button:**
    *   Click "Add Time" to add the specified hours and minutes to your total allowance.
    *   Click "Subtract Time" to subtract the specified hours and minutes from your total allowance. You cannot subtract more time than you currently have.

**Examples:**

*   To add 1 hour and 30 minutes: Enter `1` in the hours field and `30` in the minutes field, then click "Add Time".
*   To add only 45 minutes: Leave the hours field blank (or enter `0`) and enter `45` in the minutes field, then click "Add Time".
*   To subtract 2 hours: Enter `2` in the hours field and `0` in the minutes field, then click "Subtract Time".

## File Structure

```
time-tracker-local/
├── index.html      # The main HTML file that structures the web page.
├── style.css       # Contains all the CSS rules for styling the application.
└── script.js       # The JavaScript file that handles all the application logic and interactivity.
└── README.md       # This file, providing information about the project.
```

## Data Persistence

The application uses your browser's `localStorage` to store the `totalMinutes` and the `history` array. This means:

-   Your data will persist even if you close the browser tab or window.
-   The data is specific to the browser and device you are using. It will not sync across different browsers or devices.

### How to Reset Data

If you wish to clear all your saved time and history, you can do so by:

1.  **Opening Developer Tools:** In your browser, open the Developer Tools (usually by pressing `F12` or right-clicking on the page and selecting "Inspect").
2.  **Navigating to Application/Storage:** Go to the "Application" tab (or "Storage" in some browsers).
3.  **Clearing Local Storage:** Under "Local Storage" (or "Local Storage" within "Storage"), find the entry for `file://` (or the local file path if you opened it directly). Right-click on it and select "Clear" or "Delete All".

Alternatively, you can manually clear the specific keys:

-   `totalMinutes`
-   `history`

After clearing, refresh the page, and the application will start with default values (0 minutes and an empty history).