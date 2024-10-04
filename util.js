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
    sendPublicMessage(
      `Display name changed from ${oldDisplayName} to ${window.displayName}`,
    );
  } else {
    alert("Display name cannot be empty");
  }
}

/**
 * Escapes special characters in a string.
 *
 * @param {string} str - The string to escape.
 * @returns {string} - The escaped string.
 */
function escapeSpecialChars(str) {
  return str.replace(/[#<>?]/g, (char) => {
    switch (char) {
      case '#':
        return '%23';
      case '<':
        return '%3C';
      case '>':
        return '%3E';
      case '?':
        return '%3F';
      default:
        return char;
    }
  });
}

/**
 * Unescapes special characters in a string.
 *
 * @param {string} str - The string to unescape.
 * @returns {string} - The unescaped string.
 */
function unescapeSpecialChars(str) {
  return str.replace(/%23|%3C|%3E|%3F/g, (encoded) => {
    switch (encoded) {
      case '%23':
        return '#';
      case '%3C':
        return '<';
      case '%3E':
        return '>';
      case '%3F':
        return '?';
      default:
        return encoded;
    }
  });
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
    console.log(
      `INFO: ${displayName}(${userId}) is lagging behind by ${lag}ms`,
    );
  } else if (lag < -500) {
    console.log(`INFO: ${displayName}(${userId}) is ahead by ${-lag}ms`);
  } else {
    console.log(`INFO: ${displayName}(${userId}) is in sync`);
  }
}

/**
 * Adds an attachment by allowing the user to select a file and then sending it as a public message.
 * 
 * @async
 * @function addAttachment
 * @returns {Promise<void>}
 */
async function addAttachment() {
  try {
    let selectedFiles = await showOpenFilePicker();
    if (!selectedFiles.length) {
      throw new Error("No file selected");
    }
    let file = selectedFiles[0];
    let fileData = await file.getFile();
    let fileName = fileData.name;
    let fileBlob = await fileData.slice();
    let reader = new FileReader();
    reader.readAsDataURL(fileBlob);
    reader.onloadend = function() {
      try {
        let base64data = reader.result.split(',')[1];
        let mimeType = fileData.type;
        let dataUri = `data:${mimeType};base64,${base64data}`;
        sendPublicMessage("I have attached a file.", fileName, dataUri);
      } catch (error) {
        localMessage(1, "System", `Error processing file data: ${error.message}`);
        alert("Failed to process the file data.");
      }
    }
    reader.onerror = function() {
      localMessage(1, "System", `Error reading file: ${reader.error.message}`);
      alert("Failed to read the file.");
    }
  } catch (error) {
    localMessage(1, "System", `Error adding attachment: ${error.message}`);
    alert("Failed to add attachment.");
  }
}