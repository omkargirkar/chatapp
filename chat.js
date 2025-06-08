const socket = io();

const messages = document.getElementById("messages");
const form = document.getElementById("messageForm");
const input = document.getElementById("messageInput");

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
