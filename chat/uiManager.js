document.addEventListener("DOMContentLoaded", function() {
    window.chatDisplayDiv = document.getElementById("chatDisplayDiv");
    window.messageBoxTextArea = document.getElementById("messageBoxTextArea");
    window.attachmentInput = document.getElementById("attachmentInput");
    window.sendButton = document.getElementById("sendButton");
    window.userNameHeader = document.getElementById("userNameHeader");
    window.appNameHeader = document.getElementById("appNameHeader");
    window.clean = function(text){
        return DOMPurify.sanitize(text, {
            ADD_DATA_URI_TAGS: ['a', 'img', 'video', 'audio'], 
            ALLOWED_TAGS: ['i', 'a', 'b', 'p', 'img', 'br', 'video', 'strong', 'audio',
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code','blockquote'
            ],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'controls'],
            ALLOWED_URI_REGEXP: /^(?:(?:ftp|http|https|mailto|tel|callto|sms|cid|xmpp|blob):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
            FORBID_ATTR: ['style','class']
        });
    } 

    // Get search params
    const urlParams = new URLSearchParams(window.location.search);
    window.history.replaceState({}, document.title, window.location.pathname);
    window.displayName = urlParams.get('username') ? urlParams.get('username') : "Anonymous";
    if(window.displayName.length > 20){
        alert("Name length should be less than 20 characters.");
        changeName();
    }
    let debug = urlParams.get('debug') ? true : false;
    let encryption = urlParams.get('encryption') === 'true';
    window.shouldEnableEncryption = encryption;

    if(urlParams.get('intent') == 'join'){
        document.getElementById('openModal').click();
    } else {
        if(window.displayName == "Anonymous") changeName();
        createTunnel();
    }

    document.addEventListener("keydown", function(event) {
        if (event.altKey) {
            sendMessage();
        }
    });
    
});

function changeName(){
    let olderUserName = window.displayName;
    let newUserName = prompt("Enter a new name", window.displayName);
    if (newUserName === null || newUserName === "") return;
    if(newUserName.length > 20){
        alert("Name length should be less than 20 characters.");
        changeName();
        return;
    }
    window.displayName = newUserName;
    window.userNameHeader.innerText = `You are ${window.displayName}`;
}