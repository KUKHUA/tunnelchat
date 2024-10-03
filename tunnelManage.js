/**
 * Initializes a tunnel stream using EventSource.
 * @async
 */
async function tunnelStream() {
  try {
    window.tunnelEventSource = new EventSource(
      window.txtTunnelInstance + `tunnel/stream?id=${window.tunnelObj.id}`,
    );

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
    window.userNameHeader.innerText = `You are... ${window.displayName}`;
    window.tunnelChatHeader.innerText = `Tunnel ID: ${window.tunnelObj.id}`;
    tunnelStream();
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
    window.tunnelObj = { id: tunnelId };
    generateKeys();
    window.displayName = prompt("Enter your display name:");
    window.userNameHeader.innerText = `You are... ${window.displayName}`;
    window.tunnelChatHeader.innerText = `Tunnel ID: ${window.tunnelObj.id}`;
    tunnelStream();
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
      message.name == "Dummy";
    }

    if (!window.keys[message.userId]) {
      window.keys[message.userId] = message.publicKey;
    }

    if (message.hash !== (await hashMessage(message.message))) {
      throw new Error(`The message from ${message.displayName} failed hash verification.`);
    }

    if (message.attachmentList && message.attachmentData && message.displayName) {
      localMessage(message.userId, message.displayName, message.message);
      localMessage(1, "System", `<p>Attachment from ${message.displayName}</p> ${renderAttachment(message.attachmentList, message.attachmentData)}`);
      return;
    }

    localMessage(message.userId, message.displayName, message.message);
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
  } else if (fileType == "pdf") {
    let embed = document.createElement("embed");
    embed.src = attachmentData;
    embed.width = "100%";
    embed.height = "100%";
    return embed.outerHTML;
  } else {
    return `<a href="${attachmentData}" target="_blank">${attachmentList}</a>`;
  }
}

/**
 * Handles outgoing messages to the tunnel.
 * @async
 * @param {string} content - The content to send.
 * @param {string} sendMethod - The method to use for sending (e.g., "post").
 */
async function handelOutgoing(content, sendMethod) {
  try {
    content = escapeSpecialChars(content);
    if (sendMethod == "post") {
      await fetch(
        new URL(`tunnel/send/post`, window.txtTunnelInstance),
        {
          method: "POST",
          body: JSON.stringify({ id: window.tunnelObj.id, content: content }),
        },
      );
    } else {
      let sendURL = new URL(
        `tunnel/send?id=${window.tunnelObj.id}&content=${content}`,
        window.txtTunnelInstance,
      );
      await fetch(sendURL);
    }
  } catch (error) {
    console.error("Error sending message:", error);
    localMessage(1, "System", `Error sending message: ${error.message}`);
  }
}

/**
 * Sends a message from the user.
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
 * @param {string} [sendMethod] - The method to use for sending (e.g., "post").
 */
async function sendPublicMessage(message, attachList, attachData, sendMethod) {
  try {
    let messageObject = {
      userId: window.userId,
      displayName: window.displayName,
      message: message,
      hash: await hashMessage(message),
      attachmentList: attachList,
      attachmentData: attachData
    };

    handelOutgoing(JSON.stringify(messageObject), sendMethod);
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

  name = DOMPurify.sanitize(name);

  if (name !== "System") {
    message = DOMPurify.sanitize(marked.parse(message));
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