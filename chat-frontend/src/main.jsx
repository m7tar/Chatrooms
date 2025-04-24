import './index.css'
import App from './App.jsx'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatroomPage from './pages/ChatroomPage.jsx'; // You'll create this next

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/chat/:id" element={<ChatroomPage />} />
    </Routes>
  </BrowserRouter>
);