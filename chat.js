const socket = io();

const messages = document.getElementById("messages");
const form = document.getElementById("messageForm");
const input = document.getElementById("messageInput");

document.addEventListener('DOMContentLoaded', () => {
  let storedMessages = JSON.parse(localStorage.getItem('recentMessages')) || [];
  let lastMessageId = parseInt(localStorage.getItem('lastMessageId')) || 0;

  // Display stored messages first
  storedMessages.forEach(msg => {
    appendMessage(`${msg.username}: ${msg.message}`);
  });

  setInterval(() => {
    fetch(`/message/all${lastMessageId ? `?afterId=${lastMessageId}` : ''}`)
      .then(res => res.json())
      .then(data => {
        let newMessages = data;

        if (newMessages.length > 0) {
          newMessages.forEach(msg => {
            appendMessage(`${msg.username}: ${msg.message}`);
          });

          // Update stored messages and lastMessageId
          let updatedMessages = [...storedMessages, ...newMessages];
          updatedMessages = updatedMessages.slice(-10); // Keep only last 10
          localStorage.setItem('recentMessages', JSON.stringify(updatedMessages));

          lastMessageId = newMessages[newMessages.length - 1].id;
          localStorage.setItem('lastMessageId', lastMessageId);

          storedMessages = updatedMessages;
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

  const username = localStorage.getItem('username') || 'You';
  const userId = localStorage.getItem('userId');

  socket.emit("chat-message", msg);

  fetch('/message/store', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: msg,
      userId
    })
  });

  appendMessage(`${username}: ${msg}`, true);

  // Update recent messages in localStorage
  let storedMessages = JSON.parse(localStorage.getItem('recentMessages')) || [];
  storedMessages.push({ username, message: msg }); // id not known yet
  storedMessages = storedMessages.slice(-10);
  localStorage.setItem('recentMessages', JSON.stringify(storedMessages));

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
