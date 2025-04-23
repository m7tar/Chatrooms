//Importing dep
const express = require('express');
const http = require('http'); //: Node's built-in HTTP module; used to create the actual web server.
const cors = require('cors'); 
const { Server } = require('socket.io'); //: A library for real-time, bi-directional communication using WebSockets.
//Server & Socket.IO Setup
const app = express(); //create express app
const server = http.createServer(app); //create HTTP server
const chatrooms = []; // This will hold all chatrooms temporarily
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
app.post('/chatrooms', (req, res) => {
    const { name, tags } = req.body;
  
    if (!name) {
      return res.status(400).json({ error: 'Chatroom name is required' });
    }
  
    const newChatroom = {
      id: Date.now().toString(),  // simple ID for now
      name,
      tags: tags || [],
    };
  
    chatrooms.push(newChatroom);
    res.status(201).json(newChatroom);
});
//GET all chatrooms
app.get('/chatrooms', (req, res) => {
    const { name, tags } = req.query;
  
    let filtered = chatrooms;
  
    // 🔍 Match partial room names (case-insensitive)
    if (name) {
      const nameQuery = name.toLowerCase();
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(nameQuery)
      );
    }
  
    // 🔍 Match tags (any tag that includes the query string)
    if (tags) {
      const tagList = tags.toLowerCase().split(',');
  
      filtered = filtered.filter(room =>
        room.tags.some(tag =>
          tagList.some(searchTag => tag.toLowerCase().includes(searchTag))
        )
      );
    }
  
    res.json(filtered);
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
