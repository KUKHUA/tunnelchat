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

initializeTunnel();