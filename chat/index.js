let userConfig = new URL(window.location.href);
let userName, userTunnel, userEncryption, chatLog;
let tunnel;

async function initializeTunnel() {
    try {
        await new Promise((resolve) => {
            document.addEventListener("DOMContentLoaded", resolve);
        });
        userName = userConfig.searchParams.get("username") || localStorage.getItem("username");
        userTunnel = userConfig.searchParams.get("tunnel") || localStorage.getItem("tunnel");
        userEncryption = userConfig.searchParams.get("encryption") === "true";

        if (!userName || userName.length < 3 || userName.length > 20 || !userTunnel) {
            window.location.href = new URL("../index.html", window.location.href).href;
            return;
        }

        userName = DOMPurify.sanitize(userName);
        userTunnel = DOMPurify.sanitize(userTunnel);

        tunnel = new TunnelConnection("https://lluck.hackclub.app", userTunnel, "main", 
        processMessage, { encryption: userEncryption });

        await tunnel.create();
        await tunnel.init();
        tunnel.connect();

        updateTitleUi();
        registerKeyBinds();
        history.pushState({}, document.title, window.location.pathname);
    } catch (error) {
        displayMessage("Error Log", new Date().toLocaleTimeString(), `Error in initialization: ${error}`);
    }
}

function sendMessage() {
    try {
        messageInput = document.getElementById("messageInput");
        validateMessage = document.getElementById("validateMessage");

        if (messageInput.value.length > 0 && messageInput.value.length < 400) {
            let message = {
                sender: userName,
                time: `sent at ${new Date().toLocaleTimeString()}`,
                message: messageInput.value
            };
            tunnel.send(JSON.stringify(message));
            messageInput.value = "";
        } else {
            validateMessage.innerText = "Message must be between 1 and 400 characters.";
        }

    } catch (error) {
        displayMessage("Error Log", new Date().toLocaleTimeString(), `Error in sendMessage: ${error}`);
    }
}

function validateTooMany(){
    try {
        messageInput = document.getElementById("messageInput");
        validateMessage = document.getElementById("validateMessage");

        if (messageInput.value.length > 400) {
            messageInput.classList.add("is-warning");
            validateMessage.innerText = "Message must be between 1 and 400 characters.";
        } else {
            if(messageInput.classList.contains("is-warning"))
                messageInput.classList.remove("is-warning");

            if(validateMessage.innerText.length > 4)
                validateMessage.innerText = "";
        }

    } catch (error) {
        displayMessage("Error Log", new Date().toLocaleTimeString(), `Error in validateToMany: ${error}`);
    }
}

function processMessage(data){
    try {
        let incomingMessage = JSON.parse(data);
        displayMessage(incomingMessage.sender || incomingMessage.name || incomingMessage.userName, incomingMessage.time, incomingMessage.message);
    } catch (error) {
        displayMessage("???", new Date().toLocaleTimeString(), `${data} <br> <br> <p class="has-text-danger">We had some trouble with this message. Details: ${error}</p>`);
    }
}

function displayMessage(sender, time, message) {
    try {
        sender = sender || "???";
        time = time || new Date().toLocaleTimeString();
        message = message || "???";
    
        sender = sender.length > 20 ? sender.substring(0, 20) + "..." : sender;
        time = time.length > 20 ? time.substring(0, 20) + "..." : time;
        message = message.length > 400 ? message.substring(0, 400) + "..." : message;
    
        sender = DOMPurify.sanitize(sender);
        time = DOMPurify.sanitize(time);
    
        message = marked.parse(message);
        message = DOMPurify.sanitize(message);
    
        messageContainer = document.getElementById("messageContainer");
    
        let card = document.createElement("div");
        card.className = "card";
    
        let cardContent = document.createElement("div");
        cardContent.className = "card-content p-1 m-1";
    
        let content = document.createElement("div");
        content.className = "content";
    
        let title = document.createElement("p");
        title.className = "title is-5";
        title.textContent = sender;
    
        let subtitle = document.createElement("div");
        subtitle.className = "subtitle is-7 has-text-info p-0 m-0 is-italic";
        subtitle.innerText = time;
        
        
        let messageText = document.createElement("div");
        messageText.className = "subtile p-0 m-0";
        messageText.innerHTML = message;
    
        content.appendChild(title);
        content.appendChild(subtitle);
        content.appendChild(messageText);
        cardContent.appendChild(content);
        card.appendChild(cardContent);
        messageContainer.appendChild(card);

        messageContainer.scrollTop = messageContainer.scrollHeight;
    } catch (error) {
        console.log(`Error in displayMessage: ${error}`);
    }
}

function updateTitleUi(){
    try {
        nameDisplay = document.getElementById("titleNameDipslay");
        document.title = `TunnelChat - ${userTunnel}`;
    
        nameDisplay.innerHTML = `You are ${userName} in room <i>${userTunnel}</i>`;
    } catch (error) {
        displayMessage("Error Log", new Date().toLocaleTimeString(), `Error in updateTitleUi: ${error}`);
    }
}

function changeUsername(){
    try {
        let newUsername = prompt("Enter your new username:", userName);

        while(newUsername.length < 3 || newUsername.length > 20){
            newUsername = prompt("Username must be between 3 and 20 characters:", userName);
        }

        userName = DOMPurify.sanitize(newUsername);
        localStorage.setItem("username", userName);
        updateTitleUi();
    } catch (error) {
        displayMessage("Error Log", new Date().toLocaleTimeString(), `Error in changeUsername: ${error}`);
    }
}

async function changeTunnel(){
    try {
        if (tunnel) {
            tunnel.close();
        }

        let newTunnel = prompt("Enter the tunnel you want to join:", userTunnel);
        if (!newTunnel) {
            displayMessage("Error Log", new Date().toLocaleTimeString(), "No tunnel entered.");
            return;
        }

        userTunnel = DOMPurify.sanitize(newTunnel);
        localStorage.setItem("tunnel", userTunnel);
        
        tunnel = new TunnelConnection("https://lluck.hackclub.app", userTunnel, "main", 
        processMessage, { encryption: userEncryption });

        await tunnel.create();
        await tunnel.init();
        tunnel.connect();

        updateTitleUi();
        displayMessage("System", new Date().toLocaleTimeString(), `You have switched to the tunnel **${userTunnel}**`);
    } catch (error) {
        displayMessage("Error Log", new Date().toLocaleTimeString(), `Error in changeTunnel: ${error}`);
    }
}

async function downloadChatLog(){
    try {
        let chatLog = document.getElementById("messageContainer").innerHTML;
        let cssContent = await fetch('https://cdnjs.cloudflare.com/ajax/libs/bulma/1.0.2/css/bulma.min.css').then(response => response.text());
        let fullContent = `
            <html>
            <head>
                <title>Chat Log for Tunnel ${userTunnel}</title>
                <style>${cssContent}</style>
            </head>
            <body>
            <h3 class="title is-3">Chat Log for Tunnel ${userTunnel}</h3>
            <h4 class="subtitle is-5">downloaded at ${new Date().toLocaleTimeString()} by ${userName}</h4>
            ${chatLog}
            </body>
            </html>
        `;
        let blob = new Blob([fullContent], {type: "text/html"});
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = `chatlog-${userTunnel}.html`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        displayMessage("Error Log", new Date().toLocaleTimeString(), `Error in downloadChatLog: ${error}`);
    }
}

function registerKeyBinds(){
    try {
        document.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && event.ctrlKey) {
                sendMessage();
            } else if(event.key === "arrowUp")
                getLastMessage()
        });
    } catch (error) {
        displayMessage("Error Log", new Date().toLocaleTimeString(), `Error in registerKeyBinds: ${error}`);
    }
}

function getLastMessage(){
    try {
        let messageContainer = document.getElementById("messageContainer");
        let input = document.getElementById("messageInput");
        let lastMessageInnner = messageContainer.lastElementChild.querySelector(".content").lastElementChild;
        input.value = lastMessageInnner.innerHTML;
    } catch (error) {
        displayMessage("Error Log", new Date().toLocaleTimeString(), `Error in getLastMessage: ${error}`);
    }
}

initializeTunnel();