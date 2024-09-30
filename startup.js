document.addEventListener('DOMContentLoaded', () => {
    window.txtTunnelInstance = new URL("https://lluck.hackclub.app");
    window.tunnelObj;
    window.tunnelTickInterval = 3000;
    window.userId;
    window.keys = {};
    window.previousMessageHash = "This is not a valid hash";
    window.displayName;
    window.usersInTunnel = {};

    const createButton = document.getElementById('createButton');
    const joinButton = document.getElementById('joinButton');
    const sendButton = document.getElementById('sendButton');
    window.tunnelChatHeader = document.getElementById('tunnelChatHeader');
    window.chatLog = document.getElementById('chatBox');
    window.userNameHeader = document.getElementById('userNameHeader');

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
});