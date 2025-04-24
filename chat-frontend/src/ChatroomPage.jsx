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
    <div style={{ padding: '2rem' }}>
      <h2>Chatroom: {roomName}</h2>

      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.username}:</strong> {msg.text}
            <small> ({new Date(msg.timestamp).toLocaleTimeString()})</small>
          </li>
        ))}
      </ul>

      {typingUser && <p><em>{typingUser} is typing...</em></p>}

      <form onSubmit={sendMessage}>
        <input
          value={text}
          onChange={handleTyping}
          placeholder="Type your message"
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
