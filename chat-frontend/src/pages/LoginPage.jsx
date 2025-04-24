import { useState } from 'react';

export default function LoginPage({ onLogin }) {
    const [username, setUsername] = useState('');
  
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center p-6">
        <div className="bg-gray-800 rounded-lg shadow-md p-6 max-w-md w-full text-center space-y-4">
          <h2 className="text-2xl font-semibold text-blue-300">Enter your username</h2>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
            className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400"
          />
          <button
            onClick={() => onLogin(username)}
            disabled={!username}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-md font-medium disabled:opacity-50"
          >
            Join Chat
          </button>
        </div>
      </div>
    );
  }