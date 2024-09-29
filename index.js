document.addEventListener('DOMContentLoaded', () => {
    const txtTunnelInstance = new URL("https://lluck.hackclub.app");
    let tunnelObj;
    let tunnelTickInterval = 3000;
    let userId;
    const keys = {};
    let previousMessageHash = "This is not a valid hash";
    let displayName;

    const createButton = document.getElementById('createButton');
    const joinButton = document.getElementById('joinButton');
    const sendButton = document.getElementById('sendButton');
    const tunnelChatHeader = document.getElementById('tunnelChatHeader');
    const chatLog = document.getElementById('chatBox');
    const userNameHeader = document.getElementById('userNameHeader');

    // Add event listener for CTRL+Enter to send messages
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.altKey) {
            sendMessage();
        }
    });
    createButton.addEventListener('click', createTunnel);
    joinButton.addEventListener('click', joinTunnel);
    sendButton.addEventListener('click', sendMessage);
    userNameHeader.addEventListener('click', changeDisplayName);

    function changeDisplayName() {
        const newDisplayName = prompt("Please enter your new display name:");
        if (newDisplayName && newDisplayName.trim() !== "") {
            displayName = newDisplayName;
            userNameHeader.textContent = `You are... ${displayName}`;
            console.log(`INFO: Display name changed to ${displayName}`);
        } else {
            alert("Display name cannot be empty");
        }
    }

    async function createTunnel() {
        const createTunnelURL = new URL("/tunnel/create", txtTunnelInstance);
        try {
            const response = await fetch(createTunnelURL);
            if (!response.ok) throw new Error('Network response was not ok');
            tunnelObj = await response.json();
            console.log(tunnelObj);
            await generateKeys();
            tunnelChatHeader.textContent = `Tunnel Chat Code: ${tunnelObj.id}`;
            displayName = prompt("Please set your display name:");
            userNameHeader.textContent = `You are... ${displayName}`;
            startTunnelTick();
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    async function joinTunnel() {
        const tunnelId = prompt("Please enter the tunnel code");
        if (tunnelId === null) return;
        tunnelObj = { id: tunnelId };
        const checkTunnelURL = new URL(`/tunnel?id=${tunnelObj.id}`, txtTunnelInstance);
        try {
            const response = await fetch(checkTunnelURL);
            if (!response.ok) throw new Error('Network response was not ok');
            tunnelObj = await response.json();
            console.log(tunnelObj);
            await generateKeys();
            tunnelChatHeader.textContent = `Tunnel Chat Code: ${tunnelObj.id}`;
            displayName = prompt("Please set your display name:");
            userNameHeader.textContent = `You are... ${displayName}`;
            startTunnelTick();
            firstMessageSetup();
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    async function generateKeys() {
        userId = window.crypto.getRandomValues(new Uint32Array(1))[0];
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "ECDSA",
                namedCurve: "P-384"
            },
            true,
            ["sign", "verify"]
        );
        keys[userId] = {
            publicKey: await window.crypto.subtle.exportKey("jwk", keyPair.publicKey),
            privateKey: keyPair.privateKey
        };
        console.log(keys, userId);
    }

    async function hashMessage(message) {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function startTunnelTick() {
        tunnelTicker = setInterval(tunnelTick, tunnelTickInterval);
    }

    async function tunnelTick() {
        const tunnelIncomingURL = new URL(`/tunnel?id=${tunnelObj.id}`, txtTunnelInstance);
        try {
            const response = await fetch(tunnelIncomingURL);
            const data = await response.json();
            handleIncoming(data);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function addToKeyStore(userId, publicKey) {
        keys[userId] = { publicKey };
    }

    async function handleIncoming(content) {
        const currentMessage = content.content;
        try {
            const JSONMessage = JSON.parse(currentMessage);
            const currentHash = await hashMessage(JSONMessage.message);
    
            // Check if the hash in the message matches the actual hash
            if (JSONMessage.hash !== currentHash) {
                displayMessage(1, "System", `The below message from ${JSONMessage.displayName} has been tampered with. Please be cautious.`);
                return;
            }
    
            if (JSONMessage.hash === previousMessageHash || currentHash === previousMessageHash) {
                console.log("INFO: Message already processed.");
                return;
            }
    
            if (JSONMessage.userId && JSONMessage.publicKey && !keys[JSONMessage.userId]) {
                console.log("INFO: Adding new user to key store.");
                addToKeyStore(JSONMessage.userId, JSONMessage.publicKey);
            }
    
            if (JSONMessage.message && JSONMessage.userId && JSONMessage.displayName && JSONMessage.time) {
                console.log(`INFO: Displaying message from ${JSONMessage.displayName}.`);
                logLag(JSONMessage.userId, JSONMessage.displayName, JSONMessage.time);
                displayMessage(JSONMessage.userId, JSONMessage.displayName, JSONMessage.message);
                previousMessageHash = currentHash;
                console.log(`INFO: Previous message hash is now ${previousMessageHash}`);
            }
        } catch (error) {
            console.log("INFO: We are the first message.");
            firstMessageSetup();
        }
    }
    
    async function firstMessageSetup() {
        const message = `${displayName} has joined the chat.`;
        const firstMessage = {
            userId: 1,
            displayName: "System",
            publicKey: keys[userId].publicKey,
            time: Date.now(),
            message,
            hash: await hashMessage(message)
        };
        handleOutgoing(JSON.stringify(firstMessage));
    }

    function displayMessage(messageUserId, displayName, message) {
        // Sanitize inputs
        displayName = DOMPurify.sanitize(displayName)
            .replace(/\n/g, '')
            .replace(/<br\s*\/?>/gi, '')
            .replace(/&10;/g, '');
        message = DOMPurify.sanitize(marked.parse(message))
            .replace(/\n/g, '')
            .replace(/<br\s*\/?>/gi, '')
            .replace(/&10;/g, '');
        
        // Check if the message is from the current user
        if (messageUserId === userId) {
            displayName = "You";
        }
        
        // Create a new paragraph element for the message
        let messageLine = document.createElement('p');
        messageLine.innerHTML = `<b>${displayName}:</b> ${message}`;
        
        // Append the new message element to the chat log
        chatLog.appendChild(messageLine);
    }

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

    function handleOutgoing(content) {
        const outgoingUrl = new URL(`/tunnel/send?id=${tunnelObj.id}&content=${content}`, txtTunnelInstance);
        fetch(outgoingUrl);
    }

    async function sendMessage() {
        const messageBox = document.getElementById('messageBox');
        const message = messageBox.value;
        if (message.trim() === "") {
            alert("Message cannot be empty");
            return;
        }
        const messageObj = {
            userId,
            displayName,
            publicKey: keys[userId].publicKey,
            time: Date.now(),
            message,
            hash: await hashMessage(message)
        };
        handleOutgoing(JSON.stringify(messageObj));
        messageBox.value = "";
    }
});