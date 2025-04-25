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

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'super-secret-key';


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
//register a new user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashed
      }
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Username already taken' });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
});
//User login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: 'Invalid User' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid Password' });

  const token = jwt.sign({ userId: user.id, username: user.username }, SECRET, { expiresIn: '2h' });

  res.json({ token, username: user.username });
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

app.get('/chatrooms/:id/messages', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { roomId: req.params.id },
      orderBy: { timestamp: 'asc' },
    });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});


// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('typing', ({ room, username }) => {
    socket.to(room).emit('user_typing', username);
  });

  socket.on('send_message', async (data) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 3 * 60 * 1000); // 3 mins later
  
    const saved = await prisma.message.create({
      data: {
        roomId: data.room,
        username: data.username,
        text: data.text,
        timestamp: now,
        expiresAt: expiresAt,
      }
    });
  
    io.to(data.room).emit('receive_message', saved);
  
    // Schedule message deletion
    setTimeout(async () => {
      await prisma.message.delete({ where: { id: saved.id } });
      io.to(data.room).emit('message_deleted', saved.id); // Notify clients
    }, 3 * 60 * 1000);
  });
});


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
