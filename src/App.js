import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './Auth/Signup';
import Signin from './Auth/Signin';
import ChatInbox from './Chats/chatinbox';
import ChatWindow from './Chats/chatroom';
import PrivateRoute from './Auth/privateroute';
import Navbar from './navbar';
import Profile from './profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />

        {/* Protected routes */}
        <Route
          path="/chatinbox"
          element={
            <PrivateRoute>
              <ChatInbox />
            </PrivateRoute>
          }
        />
        <Route
          path="/chatroom/:chatId"
          element={
            <PrivateRoute>
              <ChatWindow />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
