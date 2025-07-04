/**
 * Global variables for time tracking and history.
 */
let totalMinutes = 0;
let history = [];

/**
 * DOM elements.
 */
const hoursInput = document.getElementById('hoursInput');
const minutesInput = document.getElementById('minutesInput');
const addTimeBtn = document.getElementById('addTimeBtn');
const subtractTimeBtn = document.getElementById('subtractTimeBtn');
const displayElement = document.querySelector('.tracker__display');
const historyList = document.getElementById('historyList');
const errorMessageElement = document.getElementById('errorMessage');

/**
 * Initializes the application by loading data from localStorage and rendering the UI.
 * It also sets up event listeners for the add and subtract buttons and input fields.
 */
function initialize() {
    const storedMinutes = localStorage.getItem('totalMinutes');
    const storedHistory = localStorage.getItem('history');

    if (storedMinutes) {
        totalMinutes = parseInt(storedMinutes, 10);
    }

    if (storedHistory) {
        history = JSON.parse(storedHistory);
    }

    renderDisplay();
    renderHistory();

    // Add event listeners
    addTimeBtn.addEventListener('click', handleAdd);
    subtractTimeBtn.addEventListener('click', handleSubtract);

    // Clear error message on input change
    hoursInput.addEventListener('input', clearErrorMessage);
    minutesInput.addEventListener('input', clearErrorMessage);
}

/**
 * Renders the current total time allowance in 'X hours Y minutes' format.
 * This function updates the text content of the display element.
 */
function renderDisplay() {
    displayElement.textContent = formatTime(totalMinutes);
}

/**
 * Populates the history list with chronological entries.
 * It clears existing entries and then adds new ones in reverse order (newest first).
 */
function renderHistory() {
    historyList.innerHTML = ''; // Clear existing entries
    // Render history in reverse order to show newest first
    for (let i = history.length - 1; i >= 0; i--) {
        const listItem = document.createElement('li');
        listItem.textContent = history[i];
        historyList.appendChild(listItem);
    }
}

/**
 * Displays an error message to the user by updating the text content of the error message element.
 * @param {string} message - The error message to display.
 */
function showErrorMessage(message) {
    errorMessageElement.textContent = message;
}

/**
 * Clears any displayed error messages by setting the text content of the error message element to an empty string.
 */
function clearErrorMessage() {
    errorMessageElement.textContent = '';
}

/**
 * Parses the hours and minutes input fields and validates them.
 * It checks for negative values and ensures at least one input is greater than zero.
 * @returns {{deltaMinutes: number, isValid: boolean}} An object containing the calculated delta in minutes and a validity flag.
 */
function parseAndValidateInputs() {
    const hours = parseInt(hoursInput.value, 10) || 0; // Treat blank or NaN as 0
    const minutes = parseInt(minutesInput.value, 10) || 0; // Treat blank or NaN as 0

    if (hours < 0 || minutes < 0) {
        showErrorMessage('Hours and minutes cannot be negative.');
        return { deltaMinutes: 0, isValid: false };
    }

    const deltaMinutes = (hours * 60) + minutes;

    if (deltaMinutes <= 0) {
        showErrorMessage('Please enter a value greater than zero for either hours or minutes.');
        return { deltaMinutes: 0, isValid: false };
    }

    clearErrorMessage();
    return { deltaMinutes, isValid: true };
}

/**
 * Handles the 'Add Time' button click event.
 * Validates input, updates totalMinutes, adds history entry, saves, and re-renders the UI.
 * Clears the input fields after a successful addition.
 */
function handleAdd() {
    const { deltaMinutes, isValid } = parseAndValidateInputs();
    if (!isValid) return;

    totalMinutes += deltaMinutes;
    const timestamp = new Date().toLocaleString();
    const historyEntry = `${formatDeltaTime(deltaMinutes)} – ${timestamp}`;
    history.push(`+${historyEntry}`);

    saveAndRender();
    hoursInput.value = ''; // Clear input field
    minutesInput.value = ''; // Clear input field
}

/**
 * Handles the 'Subtract Time' button click event.
 * Validates input, updates totalMinutes, adds history entry, saves, and re-renders the UI.
 * Displays an error if attempting to subtract more time than available.
 * Clears the input fields after a successful subtraction.
 */
function handleSubtract() {
    const { deltaMinutes, isValid } = parseAndValidateInputs();
    if (!isValid) return;

    if (totalMinutes < deltaMinutes) {
        showErrorMessage('Cannot subtract more time than available.');
        return;
    }

    totalMinutes -= deltaMinutes;
    const timestamp = new Date().toLocaleString();
    const historyEntry = `${formatDeltaTime(deltaMinutes)} – ${timestamp}`;
    history.push(`-${historyEntry}`);

    saveAndRender();
    hoursInput.value = ''; // Clear input field
    minutesInput.value = ''; // Clear input field
}

/**
 * Formats a given number of minutes into 'X hours Y minutes' string.
 * @param {number} minutes - The total minutes to format.
 * @returns {string} The formatted time string.
 */
function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hours ${remainingMinutes} minutes`;
}

/**
 * Formats a given number of minutes into 'Hh Mm' string, omitting zero segments.
 * If both hours and minutes are zero, it will display '0m'.
 * @param {number} minutes - The total minutes to format.
 * @returns {string} The formatted time string for history.
 */
function formatDeltaTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    let parts = [];
    if (hours > 0) {
        parts.push(`${hours}h`);
    }
    if (remainingMinutes > 0 || (hours === 0 && remainingMinutes === 0)) { // Include 0m if both are 0
        parts.push(`${remainingMinutes}m`);
    }
    return parts.join(' ');
}

/**
 * Saves the current totalMinutes and history to localStorage and re-renders the UI.
 * This function ensures data persistence and UI consistency.
 */
function saveAndRender() {
    localStorage.setItem('totalMinutes', totalMinutes);
    localStorage.setItem('history', JSON.stringify(history));
    renderDisplay();
    renderHistory();
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);