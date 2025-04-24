import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3001';

function App() {
  const [username, setUsername] = useState('');
  const [isReady, setIsReady] = useState(false);
  
  const [chatrooms, setChatrooms] = useState([]);
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');

  const [searchName, setSearchName] = useState('');
  const [searchTags, setSearchTags] = useState('');

  const fetchChatrooms = async () => {
    const params = new URLSearchParams();
    if (searchName) params.append('name', searchName);
    if (searchTags) params.append('tags', searchTags);
    console.log(params)
  
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
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center p-6">
        {!isReady ? (
          <div className="bg-gray-800 rounded-lg shadow-md p-6 max-w-md w-full text-center space-y-4">
            <h2 className="text-2xl font-semibold text-blue-300">Enter your username</h2>
    
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
    
            <button
              onClick={() => setIsReady(true)}
              disabled={!username}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition duration-200 disabled:opacity-50"
            >
              Join Chat
            </button>
          </div>
        ) : (
          <div className="w-full max-w-3xl space-y-8">
            <h1 className="text-4xl font-bold text-center text-blue-400">Chatrooms</h1>
    
            {/* Search form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchChatrooms();
              }}
              className="flex flex-wrap gap-4 mb-4"
            >
              <input
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Search by name"
                className="flex-1 p-2 bg-gray-700 rounded-md placeholder-gray-400 text-white"
              />
              <input
                value={searchTags}
                onChange={(e) => setSearchTags(e.target.value)}
                placeholder="Search by tags (comma separated)"
                className="flex-1 p-2 bg-gray-700 rounded-md placeholder-gray-400 text-white"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium"
              >
                Search
              </button>
            </form>
    
            {/* Create room form */}
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 mb-6">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Room name"
                required
                className="flex-1 p-2 bg-gray-700 rounded-md placeholder-gray-400 text-white"
              />
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags (comma separated)"
                className="flex-1 p-2 bg-gray-700 rounded-md placeholder-gray-400 text-white"
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md font-medium"
              >
                Create Room
              </button>
            </form>
    
            {/* Chatroom list */}
            <ul className="space-y-4">
              {chatrooms.map((room) => (
                <li
                  key={room.id}
                  className="bg-gray-800 p-4 rounded-md shadow-md flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-blue-300">{room.name}</h3>
                    <p className="text-sm text-gray-400">Tags: {room.tags.join(', ')}</p>
                  </div>
                  <a
                    href={`/chat/${room.id}?user=${username}&name=${encodeURIComponent(room.name)}`}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Join
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
export default App;
