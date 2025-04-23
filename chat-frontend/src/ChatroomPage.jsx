import { useEffect, useState } from 'react';
import { useParams ,useSearchParams} from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

export default function ChatroomPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [searchParams] = useSearchParams();
  const username = searchParams.get('user') || 'anon';
  const roomName = searchParams.get('name') || id;

  useEffect(() => {
    socket.emit('join_room', id);
  
    const handler = (data) => setMessages((prev) => [...prev, data]);
    socket.on('receive_message', handler);
  
    return () => {
      socket.off('receive_message', handler); // clean up listener
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

      <form onSubmit={sendMessage}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message"
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
