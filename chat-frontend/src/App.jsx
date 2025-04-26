import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

function App() {
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const handleLogin = (user) => {
    setUsername(user);
    localStorage.setItem('username', user);
  };
  

    if (!username) {
      return <LoginPage onLogin={setUsername} />;
    }

    return <Dashboard username={username} />;
}

export default App;
