import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import ChatWindow from './chatroom';
import { nhost } from '../nhost';

const GET_CHATS = gql`
  query GetChats($user_id: uuid!) {
    chats(where: { user_id: { _eq: $user_id } }) {
      id
      chat_name
    }
  }
`;

export default function ChatInbox() {
  const [userId, setUserId] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);

  useEffect(() => {
    const unsubscribe = nhost.auth.onAuthStateChanged((event, session) => {
      if (session) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const { data, loading, error } = useQuery(GET_CHATS, {
    variables: { user_id: userId },
    skip: !userId,
  });

  if (!userId) {
    return <p className="flex items-center justify-center h-screen text-lg text-gray-500">Loading user info...</p>;
  }

  if (loading) {
    return <p className="flex items-center justify-center h-screen text-lg text-gray-500">Loading chats...</p>;
  }

  if (error) {
    console.error('Error fetching chats:', error);
    return <p className="flex items-center justify-center h-screen text-lg text-red-500">Error fetching chats.</p>;
  }

  const noChatsFound = !data || !data.chats || data.chats.length === 0;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      
      {/* Chat List Pane */}
      <div className="w-1/4 min-w-[250px] border-r border-gray-200 bg-white p-4 overflow-y-auto shadow-md">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Your Chats</h2>
        {noChatsFound ? (
          <p className="text-gray-500 italic">No chats found. Start a new conversation!</p>
        ) : (
          data.chats.map(chat => (
            <div
              key={chat.id}
              className={`p-4 mb-2 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02]
                ${selectedChatId === chat.id ? 'bg-indigo-100 font-semibold text-indigo-800 shadow-md' : 'bg-gray-100 hover:bg-gray-200'}
                rounded-lg`}
              onClick={() => setSelectedChatId(chat.id)}
            >
              <p className="truncate">{chat.chat_name || "Untitled Chat"}</p>
            </div>
          ))
        )}
      </div>

      {/* Chat Window Pane */}
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <ChatWindow chatId={selectedChatId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-lg text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}