const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Handle socket connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join activity (broadcast to others)
  socket.on('join_activity', (data) => {
    console.log(`User joined activity: ${data.activityName}`);

    socket.broadcast.emit('new_participant', {
      message: `A new user has joined ${data.activityName}!`
    });
  });

  // Room-based subscription
  socket.on('subscribe_to_event', (eventId) => {
    socket.join(eventId);
    console.log(`Socket ${socket.id} joined room: ${eventId}`);

    io.to(eventId).emit(
      'notification',
      `Live update for Event ${eventId}: The organizer has arrived!`
    );
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(3000, () => {
  console.log('Socket server running on http://localhost:3000');
});