const socket = io();

const messages = document.getElementById("messages");
const form = document.getElementById("messageForm");
const input = document.getElementById("messageInput");

document.addEventListener('DOMContentLoaded', () => {
 let lastMessageCount = 0;

setInterval(() => {
  fetch('/message/all')
    .then(res => res.json())
    .then(data => {
      if (data.length > lastMessageCount) {
        const newMessages = data.slice(lastMessageCount);
        newMessages.forEach(msg => {
          appendMessage(`${msg.username}: ${msg.message}`);
        });
        lastMessageCount = data.length;
      }
    })
    .catch(err => console.error('Polling error:', err));
}, 1000);
});


function appendMessage(message, isYou = false) {
  const div = document.createElement("div");
  div.classList.add("message");
  if (isYou) div.classList.add("you");
  div.textContent = message;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = input.value;
  if (msg.trim() === "") return;
  socket.emit("chat-message", msg);
  fetch('/message/store', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: msg,
    userId: localStorage.getItem('userId')
  })
});

  appendMessage(`You: ${msg}`, true);
  input.value = "";
});

// Receive message from others
socket.on("chat-message", (data) => {
  appendMessage(`${data.name}: ${data.message}`);
});

// User joined
socket.on("user-joined", (name) => {
  appendMessage(`${name} joined`);
});

// User left
socket.on("user-left", (name) => {
  appendMessage(`${name} left`);
});
