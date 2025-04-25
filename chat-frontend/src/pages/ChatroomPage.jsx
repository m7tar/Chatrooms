import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

export default function ChatroomPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const username = searchParams.get('user') || 'anon';
  const roomName = searchParams.get('name') || id;
  let typingTimeout = null;
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUser, setTypingUser] = useState(null);

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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Listen for typing events
    socket.on('user_typing', (username) => {
      setTypingUser(username);

      if (typingTimeout) clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        setTypingUser(null);
      }, 2000);
    });

    //remove messages after 3 min
    socket.on('message_deleted', (id) => {
      setMessages(prev => prev.filter(m => m.id !== id));
    });
    return () => {
      socket.off('receive_message', handler);
      socket.off('user_typing');
      socket.off('message_deleted');
    };
  }, [id] [messages]);

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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <div className="w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">
          Chatroom: <span className="text-white">{roomName}</span>
        </h2>
  
        <div className="bg-gray-800 rounded-lg p-4 shadow-xl mb-4 h-[28rem] overflow-y-auto border border-gray-700">
          <ul className="space-y-1">
            {messages.map((msg, index) => (
              <li
                key={index}
                className={`p-3 rounded-md ${
                  index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-600'
                }`}
              >
                <div className="text-sm">
                  <span className="text-blue-400 font-semibold">{msg.username}:</span>{' '}
                  {msg.text}
                </div>
                <div className="text-xs text-gray-400 ml-1 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </li>
            ))}
            <div ref={bottomRef} />
          </ul>
        </div>
  
        {typingUser && (
          <p className="text-sm italic text-gray-400 mb-2 text-right">{typingUser} is typing...</p>
        )}
  
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            value={text}
            onChange={handleTyping}
            placeholder="Type your message"
            required
            className="flex-1 p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition duration-200"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
  
}
