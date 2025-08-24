import React, { useState, useEffect } from 'react';
import { useQuery, gql, useApolloClient } from '@apollo/client';
import ChatWindow from './chatroom';
import { nhost } from '../nhost';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar';
import { FaRobot } from "react-icons/fa"; // React icon for chatbot
import ChatBot from "./chatbot"; 

const GET_CHATS = gql`
  query GetChats($user_id: uuid!) {
    chats(
      where: { _or: [{ sender_id: { _eq: $user_id } }, { receiver_id: { _eq: $user_id } }] }
      order_by: { updated_at: desc }
    ) {
      conversation_id
      sender_id
      receiver_id
      updated_at
    }
  }
`;

const GET_USERS = gql`
  query GetAllUsers {
    users_app {
      user_id
      user_name
      user_email
    }
  }
`;

export default function ChatInbox() {
  const [userId, setUserId] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchUsersList, setSearchUsersList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [usersMap, setUsersMap] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false); // Chatbot toggle

  const navigate = useNavigate();
  const client = useApolloClient();

  // Auth
  useEffect(() => {
    const user = nhost.auth.getUser();
    if (user) setUserId(user.id);
    else navigate('/');

    const unsubscribe = nhost.auth.onAuthStateChanged((event, session) => {
      if (event === 'SIGNED_IN') setUserId(session.user.id);
      else if (event === 'SIGNED_OUT') {
        setUserId(null);
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch all users once
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await client.query({ query: GET_USERS });
        const map = {};
        result.data.users_app.forEach((u) => (map[u.user_id] = u.user_name));
        setUsersMap(map);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, [client]);

  const { data, loading, error, refetch } = useQuery(GET_CHATS, {
    variables: { user_id: userId },
    skip: !userId,
    fetchPolicy: 'network-only',
  });

  const handleSearchUser = async () => {
    if (!searchText) return;
    const SEARCH_USERS = gql`
      query GetUsers($name: String!) {
        users_app(where: { user_name: { _ilike: $name } }) {
          user_id
          user_name
          user_email
        }
      }
    `;
    try {
      const result = await client.query({
        query: SEARCH_USERS,
        variables: { name: `%${searchText}%` },
        fetchPolicy: 'network-only',
      });
      setSearchUsersList(result.data.users_app || []);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  const handleAddChaters = async (receiver_user_id) => {
    const ADD_CHAT = gql`
      mutation AddChat($sender_id: uuid!, $receiver_id: uuid!) {
        insert_chats_one(object: { sender_id: $sender_id, receiver_id: $receiver_id }) {
          conversation_id
        }
      }
    `;
    try {
      const result = await client.mutate({
        mutation: ADD_CHAT,
        variables: { sender_id: userId, receiver_id: receiver_user_id },
      });
      const newChatId = result.data.insert_chats_one.conversation_id;
      setSelectedChatId(newChatId);
      refetch(); // refresh chat list
    } catch (err) {
      console.error('Error adding chat:', err);
    }
  };

  if (!userId)
    return <p className="flex items-center justify-center h-screen text-gray-500">Redirecting...</p>;
  if (loading)
    return <p className="flex items-center justify-center h-screen text-gray-500">Loading chats...</p>;
  if (error)
    return <p className="flex items-center justify-center h-screen text-red-500">Error fetching chats.</p>;

  const noChatsFound = !data?.chats || data.chats.length === 0;

  // Toggle chatbot
  const toggleChat = () => setIsChatOpen(!isChatOpen);

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800 relative">
      <div className="bg-indigo-600 text-white shadow-md">
        <Navbar />
      </div>
      <div className="flex flex-1 overflow-hidden relative">
        {/* Search Users */}
        <div className="w-1/4 p-4 border-r border-gray-200 bg-white overflow-y-auto relative">
          <div className="flex mb-4">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search username"
              className="p-2 border flex-grow rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSearchUser}
              className="px-4 bg-indigo-500 text-white rounded-r hover:bg-indigo-600 transition duration-150 ease-in-out"
            >
              Search
            </button>
          </div>

          {searchUsersList.map((user) => (
            <div key={user.user_id} className="mb-2">
              <button
                className="w-full p-3 bg-gray-100 rounded hover:bg-gray-200 transition duration-150 ease-in-out text-left"
                onClick={() => handleAddChaters(user.user_id)}
              >
                <p className="font-semibold">{user.user_name}</p>
                <p className="text-sm text-gray-500">{user.user_email}</p>
              </button>
            </div>
          ))}

          {/* Floating Chatbot Icon */}
          <div className="absolute left-4 bottom-4 z-50">
            <button
              onClick={toggleChat}
              className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition duration-200"
            >
              <FaRobot size={24} />
            </button>
          </div>

          {/* Mini Chatbot Popup */}
          {isChatOpen && (
            <div className="absolute left-4 bottom-20 w-80 h-96 bg-white shadow-xl rounded-lg flex flex-col z-50">
              <div className="flex justify-between items-center p-2 bg-indigo-600 text-white rounded-t-lg">
                <h3 className="font-semibold text-sm">Chatbot</h3>
                <button onClick={toggleChat} className="text-white font-bold">
                  X
                </button>
              </div>
              <div className="flex-1 overflow-auto p-2">
                <ChatBot />
              </div>
            </div>
          )}
        </div>

        {/* Chat List */}
        <div className="w-1/4 min-w-[250px] border-r border-gray-200 bg-white p-4 overflow-y-auto shadow-md">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Your Chats</h2>
          {noChatsFound ? (
            <p className="text-gray-500 italic">No chats found. Start a new conversation!</p>
          ) : (
            data.chats.map((chat) => {
              const otherUserId = chat.sender_id === userId ? chat.receiver_id : chat.sender_id;
              const otherUserName = usersMap[otherUserId] || 'Unknown';
              return (
                <div
                  key={chat.conversation_id}
                  className={`p-4 mb-2 cursor-pointer rounded-lg transition duration-150 ease-in-out ${
                    selectedChatId === chat.conversation_id
                      ? 'bg-indigo-100 font-semibold text-indigo-800 shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedChatId(chat.conversation_id)}
                >
                  <p className="truncate">{otherUserName}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedChatId ? (
            <ChatWindow chatId={selectedChatId} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
