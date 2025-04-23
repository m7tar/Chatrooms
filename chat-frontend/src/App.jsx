import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3001';

function App() {
  const [chatrooms, setChatrooms] = useState([]);
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');

  const [searchName, setSearchName] = useState('');
  const [searchTags, setSearchTags] = useState('');

  const fetchChatrooms = async () => {
    const params = new URLSearchParams();
    if (searchName) params.append('name', searchName);
    if (searchTags) params.append('tags', searchTags);
  
    const res = await fetch(`${API_URL}/chatrooms?${params.toString()}`);
    const data = await res.json();
    setChatrooms(data);
  };
  
  useEffect(() => {
    fetchChatrooms();
  }, []); // still runs on initial load

  // Create new chatroom
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/chatrooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, tags: tags.split(',').map(t => t.trim()) }),
    });
    const newRoom = await res.json();
    setChatrooms(prev => [...prev, newRoom]);
    setName('');
    setTags('');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Chatrooms</h1>
      <form onSubmit={(e) => { e.preventDefault(); fetchChatrooms(); }} style={{ marginBottom: '1rem' }}>
        <input
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          placeholder="Search by name"
        />
        <input
          value={searchTags}
          onChange={(e) => setSearchTags(e.target.value)}
          placeholder="Search by tags (comma separated)"
        />
        <button type="submit">Search</button>
      </form>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Room name"
          required
        />
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated)"
        />
        <button type="submit">Create Room</button>
      </form>

      <ul>
        {chatrooms.map(room => (
          <li key={room.id}>
            <strong>{room.name}</strong> — Tags: {room.tags.join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
