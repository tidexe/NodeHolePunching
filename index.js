const fs = require('fs');
const express = require('express');
const https = require('https');
const socketIo = require('socket.io');

const app = express();
const options = {
  key: fs.readFileSync('/etc/ssl/https/cert.key'),
  cert: fs.readFileSync('/etc/ssl/https/cert.pem')
};

const server = https.createServer(options, app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('signal', ({ target, signal }) => {
    if (target) {
      console.log(`Received signal from ${socket.id} to ${target}:`, signal);
      io.to(target).emit('signal', { sender: socket.id, signal });
      console.log(`Forwarded signal from ${socket.id} to ${target}`);
    } else {
      console.warn(`No target specified in signal from ${socket.id}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  socket.on('error', (err) => {
    console.error(`Error on client ${socket.id}:`, err);
  });
});

server.listen(3000, () => {
  console.log('Signal server is running on port 3000 using HTTPS');
});


