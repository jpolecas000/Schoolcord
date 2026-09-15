const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Use port assigned by Codespaces environment or default to 3000
const PORT = process.env.PORT || 3000;

// Serve static frontend files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO Real-time Connection Handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // User joins with a username
  socket.on('join', (username) => {
    socket.username = username || 'Anonymous';
    io.emit('systemMessage', `${socket.username} has joined the chat!`);
  });

  // Handle incoming chat messages
  socket.on('chatMessage', (msgText) => {
    if (!msgText || !msgText.trim()) return;

    const messageData = {
      username: socket.username || 'Anonymous',
      text: msgText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Send message to everyone connected
    io.emit('message', messageData);
  });

  // User disconnects
  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('systemMessage', `${socket.username} left the chat.`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
