/**
 * Utility functions
 */

/**
 * Changes the display name of the user.
 */
function changeDisplayName() {
    let oldDisplayName = window.displayName;
    const newDisplayName = prompt("Please enter your new display name:");
    if (newDisplayName && newDisplayName.trim() !== "") {
        window.displayName = newDisplayName;
        window.userNameHeader.textContent = `You are... ${window.displayName}`;
        console.log(`INFO: Display name changed to ${window.displayName}`);
        sendAPIMessage(`I have changed my display name to ${window.displayName} from ${oldDisplayName}`);
    } else {
        alert("Display name cannot be empty");
    }
}

/**
 * Starts the tunnel ticker.
 */
function startTunnelTick() {
    window.tunnelTicker = setInterval(window.tunnelTick, window.tunnelTickInterval);
}

/**
 * Updates the hash of a message.
 * 
 * @param {string} message - The message to hash.
 */
function updateHash(message) {
    window.previousMessageHash = window.hashMessage(message);
}

/**
 * Escapes special characters in a string.
 * 
 * @param {string} str - The string to escape.
 * @returns {string} - The escaped string.
 */
function escapeSpecialChars(str) {
    return str.replace(/[&<>"'`=\/]/g, function (s) {
        return '\\' + s;
    });
}

/**
 * Unescapes special characters in a string.
 * 
 * @param {string} str - The string to unescape.
 * @returns {string} - The unescaped string.
 */
function unEscapeSpecialChars(str) {
    return str.replace(/\\([\\'`"<>])/g, '$1');
}

/**
 * Logs the lag time for a user.
 * 
 * @param {string} userId - The ID of the user.
 * @param {string} displayName - The display name of the user.
 * @param {number} time - The time to compare against the current time.
 */
function logLag(userId, displayName, time) {
    const lag = time - Date.now();
    if (lag > 500) {
        console.log(`INFO: ${displayName}(${userId}) is lagging behind by ${lag}ms`);
    } else if (lag < -500) {
        console.log(`INFO: ${displayName}(${userId}) is ahead by ${-lag}ms`);
    } else {
        console.log(`INFO: ${displayName}(${userId}) is in sync`);
    }
}