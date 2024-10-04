function restoreTunnel() {
  let restoreData = localStorage["dataHistory"];
  restoreData = JSON.parse(restoreData);
  if (restoreData && Date.now() - JSON.parse(restoreData).time > 7200000) {
    let userResponse = confirm(`It has been a while since you last used the tunnel. Would you like to restore Tunnel ${JSON.parse(restoreData).tunnelId}?`);
    if (!userResponse) {
      return;
    }
  } 

  let data = JSON.parse(restoreData);
  window.tunnelObj = { id: data.tunnelId };
  window.displayName = data.displayName;
  window.userNameHeader.textContent = `You are... ${window.displayName}`;
  window.tunnelChatHeader.textContent = `Tunnel ID: ${window.tunnelObj.id}`;
  console.log(`INFO: Restored tunnel ${window.tunnelObj.id}`);
  localMessage(1, "System", `Restored tunnel ${window.tunnelObj.id}`);
  joinTunnel();
}
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
 * Adds an attachment by allowing the user to select a file and then sending it as a public message.
 * 
 * @async
 * @function addAttachment
 * @returns {Promise<void>}
 */
async function addAttachment() {
  if(!window.tunnelObj) {
    alert("Please create or join a tunnel first.");
    return;
  }

  if(!window.showOpenFilePicker){
    let fileInput = document.getElementById("attachmentInput");
    fileInput.click();
    fileInput.onchange = async function() {
      let file = fileInput.files[0];
      let fileName = file.name;
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = function() {
        try {
          let base64data = reader.result.split(',')[1];
          let mimeType = file.type;
          let dataUri = `data:${mimeType};base64,${base64data}`;
          sendPublicMessage("I have attached a file.", fileName, dataUri);
          return; 
        } catch (error) {
          localMessage(1, "System", `Error processing file data: ${error.message}`);
          alert("Failed to process the file data.");
          return;
        }
      }
      reader.onerror = function() {
        localMessage(1, "System", `Error reading file: ${reader.error.message}`);
        alert("Failed to read the file.");
        return;
      }
    }
  } else {
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
}

function copyTunnelId() {
  if (!window.tunnelObj) {
    alert("Please create or join a tunnel first.");
    return;
  }
  navigator.clipboard.writeText(window.tunnelObj.id);
  localMessage(1, "System", "Tunnel ID copied to clipboard.");
}