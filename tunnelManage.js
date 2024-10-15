/**
 * Initializes a tunnel stream using EventSource.
 * @async
 */
async function tunnelStream() {
  try {
    window.tunnelEventSource = new EventSource(
      window.txtTunnelInstance + `tunnel/stream?id=${window.tunnelObj.id}`,
    );

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
          type: 'START_SSE',
          url: window.txtTunnelInstance + `tunnel/stream?id=${window.tunnelObj.id}`,
      });
      } else {
        console.error('No active service worker controller found.');
      }

    window.tunnelEventSource.onmessage = (event) => {
      console.log(event.data);
      handelIncoming(event.data);
    };
  } catch (error) {
    console.error("Error initializing tunnel stream:", error);
    localMessage(1, "System", `Error initializing tunnel stream: ${error.message}`);
  }
}

/**
 * Creates a new tunnel and initializes the stream.
 * @async
 */
async function createTunnel() {
  try {
    let tunnelId = new URL("tunnel/create", window.txtTunnelInstance);
    let response = await fetch(tunnelId);
    if (!response.ok) throw new Error("Failed to create tunnel");
    let tunnelObj = await response.json();
    window.tunnelObj = tunnelObj;
    generateKeys();
    window.displayName = prompt("Enter your display name:");
    window.displayName = DOMPurify.sanitize(window.displayName,window.cleanConfig);
    window.userNameHeader.innerText = `You are... ${window.displayName}`;
    window.tunnelChatHeader.innerText = `Tunnel ID: ${window.tunnelObj.id}`;
    tunnelStream();
    localStorage["dataHisory"] = JSON.stringify({tunnelId: window.tunnelObj.id, displayName: window.displayName, time: Date.now()});
  } catch (error) {
    console.error("Error creating tunnel:", error);
    localMessage(1, "System", `Error creating tunnel: ${error.message}`);
  }
}

/**
 * Joins an existing tunnel and initializes the stream.
 * @async
 */
async function joinTunnel() {
  try {
    let tunnelId = prompt("Enter the tunnel ID:");
    window.tunnelObj = { id: tunnelId.toUpperCase() };
    await generateKeys();
    window.displayName = prompt("Enter your display name:");
    window.displayName = DOMPurify.sanitize(window.displayName,window.cleanConfig);
    window.userNameHeader.innerText = `You are... ${window.displayName}`;
    window.tunnelChatHeader.innerText = `Tunnel ID: ${window.tunnelObj.id}`;
    tunnelStream();
    localStorage["dataHisory"] = JSON.stringify({tunnelId: window.tunnelObj.id, displayName: window.displayName, time: Date.now()});
    sendPublicMessage("I have joined the tunnel.");
  } catch (error) {
    console.error("Error joining tunnel:", error);
    localMessage(1, "System", `Error joining tunnel: ${error.message}`);
  }
}

/**
 * Handles incoming messages from the tunnel stream.
 * @async
 * @param {string} content - The incoming message content.
 */
async function handelIncoming(content) {
  try {
    let message = JSON.parse(content);

    if (!message.userId || !message.displayName || !message.message) {
      throw new Error("Received message with missing details.");
    }

    if (message.name == "System") {
      message.name = "Dummy";
    }

    if (!window.keys[message.userId]) {
      window.keys[message.userId] = message.publicKey;
    }

    if(!await verifyMessage(unescapeSpecialChars(message.message),
    unescapeSpecialChars(message.signature), message.publicKey)){
      localMessage(1,"System",`The message from ${message.displayName} failed signature verification.`);
    }

    if (message.hash !== (await hashMessage(unescapeSpecialChars(message.message)))){
      localMessage(1,"System",`The message from ${message.displayName} failed hash verification.`);
    }

    if (message.attachmentList && message.attachmentData && message.displayName) {
      localMessage(message.userId, message.displayName, message.message);
      localMessage(1, "System", `<p>Attachment from ${message.displayName}</p> ${renderAttachment(message.attachmentList, message.attachmentData)}`);
      return;
    }

    if(!usersInTunnel[message.userId]){
      usersInTunnel[message.userId] = message.displayName;
      let userList = document.getElementById("userList");
      let userItem = document.createElement("li");
      userItem.innerText = DOMPurify.sanitize(message.displayName,window.cleanConfig);
      userItem.title = `User ID: ${DOMPurify.sanitize(message.userId,window.cleanConfig)}`;
      userList.appendChild(userItem);
    }

    localMessage(message.userId, message.displayName, unescapeSpecialChars(message.message));
  } catch (error) {
    console.error("Error handling incoming message:", error);
    localMessage(1, "System", `Error parsing incoming message: ${error.message}`);
  }
}

/**
 * Renders an attachment based on its file type.
 * @param {string} attachmentList - The list of attachments.
 * @param {string} attachmentData - The data of the attachment.
 * @returns {string} - The HTML string for the attachment.
 */
function renderAttachment(attachmentList, attachmentData) {
  let fileType = attachmentList.split(".").pop();
  console.log(fileType);
  if (fileType == "png" || fileType == "jpg" || fileType == "jpeg" || fileType == "gif") {
    let img = document.createElement("img");
    img.src = attachmentData;
    return img.outerHTML;
  } else if (fileType == "mp4" || fileType == "webm" || fileType == "mov" || fileType == "avi" || fileType == "mkv") {
    let video = document.createElement("video");
    video.src = attachmentData;
    video.controls = true;
    return video.outerHTML;
  } else if (fileType == "mp3" || fileType == "wav" || fileType == "flac" || fileType == "ogg") {
    let audio = document.createElement("audio");
    audio.src = attachmentData;
    audio.controls = true;
    return audio.outerHTML;
  } else {
    return `<a href="${attachmentData}" target="_blank">${attachmentList}</a>`;
  }
}

/**
 * Handles outgoing messages to the tunnel.
 * @async
 * @param {string} content - The content to send.
 */
async function handelOutgoing(content) {
  localStorage["dataHisory"] = JSON.stringify({tunnelId: window.tunnelObj.id, displayName: window.displayName, time: Date.now()});
  try {
    content = escapeSpecialChars(content);
      await fetch(
        new URL(`tunnel/send/post`, window.txtTunnelInstance),
        {
          method: "POST",
          body: JSON.stringify({ id: window.tunnelObj.id, content: content }),
        },
      );
  } catch (error) {
    console.error("Error sending message:", error);
    localMessage(1, "System", `Error sending message: ${error.message}`);
  }
}

/**
 * Sends a message from the UI.
 * @async
 */
async function sendMessage() {
  let userMessage = window.messageBox.value;
  window.messageBox.value = "";
  if (userMessage.length > 0) {
    sendPublicMessage(userMessage);
  } else {
    localMessage(1, "System", "Message is empty.");
  }
}

/**
 * Sends a public message with optional attachments.
 * @async
 * @param {string} message - The message content.
 * @param {string} [attachList] - The list of attachments.
 * @param {string} [attachData] - The data of the attachments.
 */
async function sendPublicMessage(message, attachList, attachData) {
  try {
    let messageObject = {
      userId: window.userId,
      displayName: window.displayName,
      message: message,
      hash: await hashMessage(message),
      publicKey: window.keys[window.userId].publicKey,
      signature: await signMessage(message),
      attachmentList: attachList,
      attachmentData: attachData
    };

    handelOutgoing(JSON.stringify(messageObject));
  } catch (error) {
    console.error("Error sending public message:", error);
    localMessage(1, "System", `Error sending public message: ${error.message}`);
  }
}

/**
 * Displays a local message in the chat log.
 * @param {number} id - The user ID.
 * @param {string} name - The display name.
 * @param {string} message - The message content.
 */
function localMessage(id, name, message) {
  if (name == window.displayName) {
    name = "You";
  }

  name = DOMPurify.sanitize(name,window.cleanConfig);

  if (name !== "System") {
    message = DOMPurify.sanitize(marked.parse(message), window.cleanConfig);
  } else {
    message = DOMPurify.sanitize(message,{ADD_DATA_URI_TAGS: ['a', 'img', 'video', 'audio', ], ALLOWED_TAGS: ['a', 'img', 'video', 'audio', ]});
  }

  let nameElement = document.createElement("b");
  let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  nameElement.innerText = `${name} - at ${currentTime}: `;
  nameElement.title = `User ID of ${name} is ${id}`;
  let messageContainer = document.createElement("div");
  messageContainer.appendChild(nameElement);
  messageContainer.innerHTML += message;
  window.chatLog.appendChild(messageContainer);
  window.chatLog.scrollTop = window.chatLog.scrollHeight;
}
