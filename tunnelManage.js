/**
 * Periodically fetches incoming messages from the tunnel.
 */
async function tunnelTick() {
    const tunnelIncomingURL = new URL(`/tunnel?id=${window.tunnelObj.id}`, window.txtTunnelInstance);
    try {
        const response = await fetch(tunnelIncomingURL);
        const data = await response.json();
        window.handleIncoming(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

/**
 * Creates a new tunnel and initializes the chat.
 */
async function createTunnel() {
    const createTunnelURL = new URL("/tunnel/create", window.txtTunnelInstance);
    try {
        const response = await fetch(createTunnelURL);
        if (!response.ok) throw new Error("ERROR: Network response was not ok");
        window.tunnelObj = await response.json();
        console.log(window.tunnelObj);
        await generateKeys();
        window.tunnelChatHeader.textContent = `Tunnel Chat Code: ${window.tunnelObj.id}`;
        window.displayName = prompt("Please set your display name:");
        window.userNameHeader.textContent = `You are... ${window.displayName}`;
        startTunnelTick();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

/**
 * Joins an existing tunnel using a tunnel code.
 */
async function joinTunnel() {
    const tunnelId = prompt("Please enter the tunnel code");
    if (tunnelId === null) return;
    window.tunnelObj = { id: tunnelId };
    const checkTunnelURL = new URL(`/tunnel?id=${window.tunnelObj.id}`, window.txtTunnelInstance);
    try {
        const response = await fetch(checkTunnelURL);
        if (!response.ok) throw new Error('Network response was not ok');
        window.tunnelObj = await response.json();
        console.log(window.tunnelObj);
        await generateKeys();
        window.tunnelChatHeader.textContent = `Tunnel Chat Code: ${window.tunnelObj.id}`;
        window.displayName = prompt("Please set your display name:");
        window.userNameHeader.textContent = `You are... ${window.displayName}`;
        startTunnelTick();
        firstMessageSetup();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

/**
 * Handles incoming messages and processes them.
 * @param {Object} content - The incoming message content.
 */
async function handleIncoming(content) {
    const currentMessage = content.content;
    try {
        const JSONMessage = JSON.parse(currentMessage);
        const currentHash = await hashMessage(JSONMessage.message);

        if (JSONMessage.hash === window.previousMessageHash || currentHash === window.previousMessageHash) {
            console.log("INFO: Message already processed.");
            return;
        }

        if (JSONMessage.userId && JSONMessage.publicKey && !window.keys[JSONMessage.userId]) {
            console.log("INFO: Adding new user to key store.");
            addToKeyStore(JSONMessage.userId, JSONMessage.publicKey);
        }

        if (JSONMessage.hash != currentHash) {
            console.log(`INFO: Message from ${JSONMessage.displayName} has been tampered with, expected hash ${JSONMessage.hash} but got ${currentHash}.`);
            displayMessage(1, "System", `The below message from ${JSONMessage.displayName} has been tampered with. Please be cautious.`);
            updateHash(JSONMessage.message);
            return;
        }   

        if (JSONMessage.message && JSONMessage.userId && JSONMessage.displayName && JSONMessage.time) {
            console.log(`INFO: Displaying message from ${JSONMessage.displayName}.`);
            logLag(JSONMessage.userId, JSONMessage.displayName, JSONMessage.time);
            //let verified = await verifySignature(JSONMessage.message, JSONMessage.signature, JSONMessage.publicKey);
            //console.log(`INFO: Signature verified: ${verified}`);
            displayMessage(JSONMessage.userId, JSONMessage.displayName, JSONMessage.message);
            window.previousMessageHash = currentHash;
            console.log(`INFO: Previous message hash is now ${window.previousMessageHash}`);
        }
    } catch (error) {
        const currentHash = await hashMessage(content.content);
        if(content.content !== "" && currentHash !== window.previousMessageHash) {
            displayMessage(1, "System", `Someone sent a message that could not be processed. Please create a new tunnel if this persists.`);
            updateHash(content.content);
        } else {
            console.log("INFO: We are the first message." + error);
            firstMessageSetup();
        }
    }
}

/**
 * Sets up the first message in the chat.
 */
async function firstMessageSetup() {
    sendAPIMessage("I have joined the chat!");
}

/**
 * Displays a message in the chat log.
 * @param {number} messageUserId - The ID of the user sending the message.
 * @param {string} displayName - The display name of the user.
 * @param {string} message - The message content.
 */
function displayMessage(messageUserId, displayName, message) {
    // Sanitize inputs
    displayName = DOMPurify.sanitize(displayName)
    message = DOMPurify.sanitize(unEscapeSpecialChars(marked.parse(message)))
    // Check if the message is from the current user
    if (messageUserId === window.userId) {
        displayName = "You";
    }
    
    // Create a new div element for the message area
    const messageArea = document.createElement('div');

    // Create a bold element for the display name
    const nameArea = document.createElement('b');
    nameArea.textContent = displayName;

    // Create a span element for the timestamp
    const timeArea = document.createElement('span');
    timeArea.textContent = ` - ${new Date().toLocaleTimeString()} :`;

    // Append the timestamp to the name area
    nameArea.appendChild(timeArea);

    // Create a paragraph element for the message text
    const messageText = document.createElement('span');
    messageText.innerHTML = message;

    // Append the name area and message text to the message area
    messageArea.appendChild(nameArea);
    messageArea.appendChild(messageText);
    
    // Append the new message element to the chat log
    window.chatLog.appendChild(messageArea);
}

/**
 * Sends an outgoing message to the tunnel.
 * @param {string} content - The message content.
 */
function handleOutgoing(content) {
    const outgoingUrl = new URL(`/tunnel/send?id=${window.tunnelObj.id}&content=${encodeURIComponent(content)}`, window.txtTunnelInstance);
    fetch(outgoingUrl);
}

/**
 * Sends a message typed by the user.
 */
async function sendMessage() {
    const messageBox = document.getElementById('messageBox');
    const message = messageBox.value;
    if (message.trim() === "") {
        alert("Message cannot be empty");
        return;
    }
    const messageObj = {
        userId: window.userId,
        displayName: window.displayName,
        publicKey: window.keys[window.userId].publicKey,
        time: Date.now(),
        message : escapeSpecialChars(message),
        hash: await hashMessage(escapeSpecialChars(message)),
        signature: await signMessage(escapeSpecialChars(message), window.keys[window.userId].privateKey)
    };
    console.log(messageObj);
    handleOutgoing(JSON.stringify(messageObj));
    messageBox.value = "";
}

/**
 * Sends an API message.
 * @param {string} message - The message content.
 */
async function sendAPIMessage(message) {
    const messageObj = {
        userId: window.userId,
        displayName: window.displayName,
        publicKey: window.keys[window.userId].publicKey,
        time: Date.now(),
        message : escapeSpecialChars(message),
        hash: await hashMessage(escapeSpecialChars(message)),
        signature: await signMessage(escapeSpecialChars(message), window.keys[window.userId].privateKey)
    };
    handleOutgoing(JSON.stringify(messageObj));
}