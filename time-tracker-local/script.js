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

/**
 * Initializes the application by loading data from localStorage and rendering the UI.
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
}

/**
 * Renders the current total time allowance in 'X hours Y minutes' format.
 */
function renderDisplay() {
    displayElement.textContent = formatTime(totalMinutes);
}

/**
 * Populates the history list with chronological entries.
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
 * Parses the hours and minutes input fields.
 * @returns {{hours: number, minutes: number, isValid: boolean}} An object containing parsed hours, minutes, and a validity flag.
 */
function parseInputs() {
    const hours = parseInt(hoursInput.value, 10) || 0; // Treat blank or NaN as 0
    const minutes = parseInt(minutesInput.value, 10);

    // Minutes must be a positive integer
    if (isNaN(minutes) || minutes < 0) {
        alert('Please enter a valid non-negative integer for minutes.');
        return { hours: 0, minutes: 0, isValid: false };
    }

    // Hours must be non-negative if entered
    if (isNaN(hours) || hours < 0) {
        alert('Please enter a valid non-negative integer for hours.');
        return { hours: 0, minutes: 0, isValid: false };
    }

    // At least one of hours or minutes must be greater than zero
    if (hours === 0 && minutes === 0) {
        alert('Please enter a value greater than zero for either hours or minutes.');
        return { hours: 0, minutes: 0, isValid: false };
    }

    return { hours, minutes, isValid: true };
}

/**
 * Handles the 'Add Time' button click event.
 * Validates input, updates totalMinutes, adds history entry, saves, and re-renders.
 */
function handleAdd() {
    const { hours, minutes, isValid } = parseInputs();
    if (!isValid) return;

    const deltaMinutes = (hours * 60) + minutes;

    totalMinutes += deltaMinutes;
    const timestamp = new Date().toLocaleString();
    const historyEntry = `${hours > 0 ? hours + 'h ' : ''}${minutes}m – ${timestamp}`;
    history.push(`+${historyEntry}`);

    saveAndRender();
    hoursInput.value = ''; // Clear input field
    minutesInput.value = ''; // Clear input field
}

/**
 * Handles the 'Subtract Time' button click event.
 * Validates input, updates totalMinutes, adds history entry, saves, and re-renders.
 */
function handleSubtract() {
    const { hours, minutes, isValid } = parseInputs();
    if (!isValid) return;

    const deltaMinutes = (hours * 60) + minutes;

    if (totalMinutes < deltaMinutes) {
        alert('Cannot subtract more time than available.');
        return;
    }

    totalMinutes -= deltaMinutes;
    const timestamp = new Date().toLocaleString();
    const historyEntry = `${hours > 0 ? hours + 'h ' : ''}${minutes}m – ${timestamp}`;
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
 * Saves the current totalMinutes and history to localStorage and re-renders the UI.
 */
function saveAndRender() {
    localStorage.setItem('totalMinutes', totalMinutes);
    localStorage.setItem('history', JSON.stringify(history));
    renderDisplay();
    renderHistory();
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);