import { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // or 'register'
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`http://localhost:3001/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      localStorage.setItem('token', data.token);
      onLogin(data.username);
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center p-6">
      <div className="bg-gray-800 rounded-lg shadow-md p-6 max-w-sm w-full text-center space-y-4">
        <h2 className="text-2xl font-semibold text-blue-300">
          {mode === 'login' ? 'Login' : 'Register'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-400"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-400"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-md font-medium">
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-gray-400">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button onClick={() => setMode('register')} className="text-blue-400 underline">
                Register
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button onClick={() => setMode('login')} className="text-blue-400 underline">
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
