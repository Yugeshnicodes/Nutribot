const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const chatContainer = document.getElementById("chatContainer");
const welcome = document.getElementById("welcome");


/* ================= SEND MESSAGE ================= */

async function sendMessage() {

    const message = input.value.trim();

    if (!message) {
        return;
    }

    // Remove welcome screen
    if (welcome) {
        welcome.remove();
    }

    // Add user message
    addMessage(message, "user");

    input.value = "";

    input.style.height = "auto";

    sendButton.disabled = true;

    // Show typing
    const typingId = showTyping();

    try {

        const response = await fetch("/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })

        });


        const data = await response.json();

        removeTyping(typingId);


        if (data.success) {

            addMessage(
                data.reply,
                "bot"
            );

        } else {

            addMessage(
                data.reply ||
                "Sorry, something went wrong.",
                "bot"
            );

        }

    } catch (error) {

        console.error(error);

        removeTyping(typingId);

        addMessage(
            "Unable to connect to the AI server. Please try again.",
            "bot"
        );

    }

    sendButton.disabled = false;

    input.focus();
}


/* ================= ADD MESSAGE ================= */

function addMessage(text, sender) {

    const messageDiv = document.createElement("div");

    messageDiv.className =
        `message ${sender}`;


    const avatar = document.createElement("div");

    avatar.className =
        `avatar ${sender === "bot"
            ? "bot-avatar"
            : "user-avatar"}`;

    avatar.textContent =
        sender === "bot"
            ? "🥗"
            : "👤";


    const bubble = document.createElement("div");

    bubble.className = "bubble";

    bubble.textContent = text;


    messageDiv.appendChild(avatar);

    messageDiv.appendChild(bubble);

    chatContainer.appendChild(messageDiv);


    chatContainer.scrollTop =
        chatContainer.scrollHeight;
}


/* ================= SUGGESTION ================= */

function sendSuggestion(text) {

    input.value = text;

    sendMessage();
}


/* ================= TYPING ================= */

function showTyping() {

    const id =
        "typing-" + Date.now();

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        "message bot";

    messageDiv.id = id;


    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar bot-avatar";

    avatar.textContent = "🥗";


    const bubble =
        document.createElement("div");

    bubble.className = "bubble";


    const typing =
        document.createElement("div");

    typing.className = "typing";

    typing.innerHTML =
        "<span></span><span></span><span></span>";


    bubble.appendChild(typing);

    messageDiv.appendChild(avatar);

    messageDiv.appendChild(bubble);

    chatContainer.appendChild(messageDiv);


    chatContainer.scrollTop =
        chatContainer.scrollHeight;


    return id;
}


function removeTyping(id) {

    const element =
        document.getElementById(id);

    if (element) {
        element.remove();
    }
}


/* ================= ENTER KEY ================= */

input.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }

    }
);


/* ================= AUTO RESIZE ================= */

input.addEventListener(
    "input",
    function() {

        this.style.height = "auto";

        this.style.height =
            Math.min(
                this.scrollHeight,
                120
            ) + "px";

    }
);
