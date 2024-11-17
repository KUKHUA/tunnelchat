async function createTunnel(){
    window.tunnel = new TunnelConnection('https://lluck.hackclub.app/', 'tunnelId', 'main', renderMessage, {random: true,encryption: window.shouldEnableEncryption,firstuser:true});
    window.tunnelID = await tunnel.create();
    updateUI();
    window.tunnel.init();
    window.tunnel.connect();
}

async function joinTunnel(tunnelID){
    window.tunnelID = tunnelID;
    window.tunnel = new TunnelConnection('https://lluck.hackclub.app/', window.tunnelID, 'main', renderMessage, {encryption: window.shouldEnableEncryption});
    window.tunnel.init();
    window.tunnel.connect();
    updateUI();
}

function renderMessage(data){
    try{
        message = JSON.parse(data);
        if(message.message){
            localMessage(message.sender, message.message);
        } else {
            localMessage("System", `Invalid message: ${window.clean(message.message)}`, false, true);
        }
    } catch(e){
        localMessage("System", `Invalid message: ${window.clean(data)}`, false, true);
    }
}

function sendMessage(){
    let message = window.clean(window.messageBoxTextArea.value);
    if(message == "") return;
    window.messageBoxTextArea.value = "";
    let messageData = {
        message: window.clean(message),
        sender: window.clean(window.displayName),
    }
    window.tunnel.send(JSON.stringify(messageData));
    if(window.shouldEnableEncryption){
        localMessage(window.displayName, message, true);
    }
}

async function localMessage(name, message, isUser, isSystem) {
    if(!isUser) isUser = false;
    if(!isSystem) isSystem = false;
        const cardDiv = document.createElement("div");
        cardDiv.className = "card mb-2 text-white bg-secondary mb-2 text-left";

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        const userName = document.createElement("h6");
        userName.className = "card-title";
        if(isUser) {
            cardDiv.className = "card text-white text-right bg-primary mb-2";
            userName.innerText = `${window.clean(name)} (You)`;
            userName.style.fontStyle = "italic";
        } else if(isSystem) {
            cardDiv.className = "card text-white text-left bg-info mb-2";
        } else {
            userName.innerText = window.clean(name);
            userName.style.fontWeight = "bold";
        }

        const messageText = document.createElement("p");
        messageText.className = "card-text";
        messageText.innerHTML = window.clean(marked.parse(message));

        cardBody.appendChild(userName);
        cardBody.appendChild(messageText);
        cardDiv.appendChild(cardBody);

        window.chatDisplayDiv.appendChild(cardDiv);
}

function updateUI(){
    window.userNameHeader.innerText = `You are ${window.clean(window.displayName)}`;
    window.appNameHeader.innerText = `Tunnel Chat - ${window.clean(window.tunnelID)}`;
}
