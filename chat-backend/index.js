//Importing dep
const express = require('express');
const http = require('http'); //: Node's built-in HTTP module; used to create the actual web server.
const cors = require('cors'); 
const { Server } = require('socket.io'); //: A library for real-time, bi-directional communication using WebSockets.
//Server & Socket.IO Setup
const app = express(); //create express app
const server = http.createServer(app); //create HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // replace with your frontend origin later
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.send('Chat backend is running!');
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
