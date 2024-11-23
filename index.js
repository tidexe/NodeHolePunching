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
const io = socketIo(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('signal', ({ target, signal }) => {
    if (target) {
      io.to(target).emit('signal', { sender: socket.id, signal });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log('Signal server is running on port 3000 using HTTPS');
});



