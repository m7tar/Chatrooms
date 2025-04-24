//Importing dep
const express = require('express');
const http = require('http'); //: Node's built-in HTTP module;
const cors = require('cors'); 
const { Server } = require('socket.io'); //: A library for real-time, bi-directional communication using WebSockets.
const { PrismaClient } = require('@prisma/client');


//Server & Socket.IO Setup
const app = express(); //create express app
const server = http.createServer(app); //create HTTP server
const chatrooms = []; // This will hold all chatrooms temporarily
const prisma = new PrismaClient();

//this is the websocket server
const io = new Server(server, {
  cors: {
    origin: "*", // replace with your frontend origin later
    methods: ["GET", "POST"]
  }
});

app.use(cors()); //enable CORS on all routes
app.use(express.json()); //parse incming JASON

// Basic test route
app.get('/', (req, res) => {
  res.send('Chat backend is running!');
});

// POST endpoint to create a new chatroom
app.post('/chatrooms', async (req, res) => {
  const { name, tags } = req.body;
  if (!name) return res.status(400).json({ error: 'Chatroom name is required' });

  try {
    const newChatroom = await prisma.chatroom.create({
      data: {
        name,
        tags: tags || [],
      },
    });

    res.status(201).json(newChatroom);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create chatroom' });
  }
});

//GET all chatrooms
app.get('/chatrooms', async (req, res) => {
  const { name, tags } = req.query;

  try {
    const where = {};

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      };
    }

    if (tags) {
      const tagList = tags.toLowerCase().split(',');
      where.tags = {
        hasSome: tagList,
      };
    }

    const chatrooms = await prisma.chatroom.findMany({ where });

    res.json(chatrooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch chatrooms' });
  }
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
