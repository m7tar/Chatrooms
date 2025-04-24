import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

export default function ChatroomPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const username = searchParams.get('user') || 'anon';
  const roomName = searchParams.get('name') || id;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUser, setTypingUser] = useState(null);
  let typingTimeout = null;

  useEffect(() => {
    // Join room
    socket.emit('join_room', id);

    // Fetch previous messages
    fetch(`http://localhost:3001/chatrooms/${id}/messages`)
      .then(res => res.json())
      .then(setMessages);

    // Listen for new messages
    const handler = (data) => setMessages(prev => [...prev, data]);
    socket.on('receive_message', handler);

    // Listen for typing events
    socket.on('user_typing', (username) => {
      setTypingUser(username);

      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        setTypingUser(null);
      }, 2000);
    });

    return () => {
      socket.off('receive_message', handler);
      socket.off('user_typing');
    };
  }, [id]);

  const sendMessage = (e) => {
    e.preventDefault();
    const msg = {
      room: id,
      text,
      username,
      timestamp: new Date().toISOString(),
    };
    socket.emit('send_message', msg);
    setText('');
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    socket.emit('typing', { room: id, username });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Chatroom: {roomName}</h2>
  
      <ul className="space-y-2 mb-4 max-h-96 overflow-y-auto bg-gray-800 p-4 rounded-md">
        {messages.map((msg, index) => (
          <li key={index} className="text-sm">
            <strong className="text-blue-400">{msg.username}:</strong> {msg.text}
            <span className="text-gray-400 ml-2 text-xs">({new Date(msg.timestamp).toLocaleTimeString()})</span>
          </li>
        ))}
      </ul>
  
      {typingUser && <p className="text-sm italic text-gray-400 mb-2">{typingUser} is typing...</p>}
  
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={text}
          onChange={handleTyping}
          placeholder="Type your message"
          required
          className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700">Send</button>
      </form>
    </div>
  );
}
