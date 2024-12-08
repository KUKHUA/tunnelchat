function validate(){
    let validateMessage = document.getElementById("validateMessage");
    let usernameInput = document.getElementById("usernameInput");
    let tunnelInput = document.getElementById("tunnelInput");
    let startButton = document.getElementById("startButton");

    let isValid = true;

    if(usernameInput.value.length < 3 || usernameInput.value.length > 20){
        usernameInput.classList.add("is-warning");
        validateMessage.innerText = "Username must be between 3 and 20 characters.";
        isValid = false;
    } else {
        localStorage["username"] = usernameInput.value;
        usernameInput.classList.remove("is-warning");
        usernameInput.classList.add("is-success");
    }

    if(tunnelInput.value.length <= 1 ){
        tunnelInput.classList.add("is-warning");
        validateMessage.innerText = "The tunnel ID must be at least 2 letters.";
        isValid = false;
    } else {
        localStorage["tunnel"] = tunnelInput.value;
        tunnelInput.classList.remove("is-warning");
        tunnelInput.classList.add("is-success");
    }

    startButton.disabled = !isValid;
    if (isValid) {
        validateMessage.innerText = "";
    }
}

function sendData(){
    let usernameInput = document.getElementById("usernameInput");
    let tunnelInput = document.getElementById("tunnelInput");
    let encryptionInput = document.getElementById("encryptionInput");

    if(usernameInput.classList.contains("is-success")){
        let data = {
            username: usernameInput.value,
            tunnel: tunnelInput.value,
            encryption: encryptionInput.checked
        };

        let url = new URL("chat/index.html", window.location.href);
        url.search = new URLSearchParams(data).toString();
        window.location.href = url;
    } else {
        validate();
    }
}

document.addEventListener("DOMContentLoaded", function () {
    let usernameInput = document.getElementById("usernameInput");
    let tunnelInput = document.getElementById("tunnelInput");

    if(localStorage["username"]){
        usernameInput.value = localStorage["username"];
        validate();
    }

    if(localStorage["tunnel"]){
        tunnelInput.value = localStorage["tunnel"];
        validate();
    }

});