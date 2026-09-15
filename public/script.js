// Connect to the Socket.IO backend
const socket = io();

const modal = document.getElementById('username-modal');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages-container');
const displayUsername = document.getElementById('display-username');
const currentUserAvatar = document.getElementById('current-user-avatar');

let myUsername = '';

// Login Flow
function joinChat() {
  const name = usernameInput.value.trim();
  if (name !== '') {
    myUsername = name;
    displayUsername.textContent = myUsername;
    currentUserAvatar.textContent = myUsername.charAt(0).toUpperCase();

    // Tell backend we connected
    socket.emit('join', myUsername);

    modal.style.display = 'none';
    messageInput.disabled = false;
    messageInput.focus();
  }
}

joinBtn.addEventListener('click', joinChat);
usernameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') joinChat();
});

// Sending Messages
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && messageInput.value.trim() !== '') {
    socket.emit('chatMessage', messageInput.value);
    messageInput.value = '';
  }
});

// Receiving Chat Messages from Server
socket.on('message', (data) => {
  const msgEl = document.createElement('div');
  msgEl.classList.add('message');
  const initial = data.username.charAt(0).toUpperCase();

  msgEl.innerHTML = `
    <div class="avatar">${initial}</div>
    <div class="message-content">
      <div class="message-header">
        <span class="author">${escapeHTML(data.username)}</span>
        <span class="timestamp">${data.time}</span>
      </div>
      <p class="text">${escapeHTML(data.text)}</p>
    </div>
  `;

  messagesContainer.appendChild(msgEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Receiving System Notifications (User Joined / Left)
socket.on('systemMessage', (text) => {
  const sysEl = document.createElement('div');
  sysEl.classList.add('system-msg');
  sysEl.textContent = `— ${text}`;
  
  messagesContainer.appendChild(sysEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Security function to prevent HTML injection
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
