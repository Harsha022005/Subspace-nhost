import React from 'react';
import ChatInbox from './Chats/chatinbox';
import ChatWindow from './Chats/chatroom'; 
import Signup from './Auth/Signup';
import Signin from './Auth/Signin';
import PrivateRoute from './Auth/privateroute';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { client } from './appoloclient'; 

function App() {
  return (
    <ApolloProvider client={client}>
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

          {/* Individual chatroom route */}
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
    </ApolloProvider>
  );
}

export default App;
