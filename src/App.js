import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './Auth/Signup';
import Signin from './Auth/Signin';
import ChatInbox from './Chats/chatinbox';
import ChatWindow from './Chats/chatroom';
import PrivateRoute from './Auth/privateroute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />

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
