document.addEventListener("DOMContentLoaded", () => {
  window.txtTunnelInstance = new URL("https://lluck.hackclub.app");
  window.tunnelObj;
  window.userId;
  window.keys = {};
  window.displayName;
  window.usersInTunnel = {};
  window.tunnelEventSource;
  window.cleanConfig = {
    ALLOWED_TAGS: ['i', 'a', 'b', 'p', 'img', 'br', 'video', 'strong', 'audio'],
    ALLOWED_ATTR: ['href', 'src'],
    FORBID_ATTR: ['style']
  }
  window.cleanConfigAttachment = {
    ADD_DATA_URI_TAGS: ['a', 'img', 'video', 'audio', ], 
    ALLOWED_TAGS: ['i', 'a', 'b', 'p', 'img', 'br', 'video', 'strong', 'audio'],
    ALLOWED_ATTR: ['href', 'src'],
    FORBID_ATTR: ['style']
  }

  const createButton = document.getElementById("createButton");
  const joinButton = document.getElementById("joinButton");
  const sendButton = document.getElementById("sendButton");
  let attachButton = document.getElementById("addAttachmentButton");
  window.tunnelChatHeader = document.getElementById("tunnelChatHeader");
  window.chatLog = document.getElementById("chatBox");
  window.userNameHeader = document.getElementById("userNameHeader");
  window.messageBox = document.getElementById("messageBox");

  // Add event listener for CTRL+Enter to send messages
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.altKey) {
      sendMessage();
    }
  });
  createButton.addEventListener("click", createTunnel);
  joinButton.addEventListener("click", joinTunnel);
  sendButton.addEventListener("click", sendMessage);
  userNameHeader.addEventListener("click", changeDisplayName);
  attachButton.addEventListener("click", addAttachment);
  tunnelChatHeader.addEventListener("click", copyTunnelId);
  restoreTunnel();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service_worker.js')
    .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(error => {
        console.error('Service Worker registration failed:', error);
    });
}
});
