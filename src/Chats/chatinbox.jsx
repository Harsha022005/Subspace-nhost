import React, { useState, useEffect } from 'react';
import { useQuery, gql, useApolloClient } from '@apollo/client';
import ChatWindow from './chatroom';
import { nhost } from '../nhost';
import { useNavigate } from 'react-router-dom';

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
    }
  }
`;

export default function ChatInbox() {
  const [userId, setUserId] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchUsersList, setSearchUsersList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [usersMap, setUsersMap] = useState({});
  const navigate = useNavigate();
  const client = useApolloClient();

  // Auth state
  useEffect(() => {
    const initialUser = nhost.auth.getUser();
    if (initialUser) setUserId(initialUser.id);
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
        result.data.users_app.forEach((u) => {
          map[u.user_id] = u.user_name;
        });
        setUsersMap(map);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, [client]);

  const { data, loading, error } = useQuery(GET_CHATS, {
    variables: { user_id: userId },
    skip: !userId,
    fetchPolicy: 'network-only',
  });

  const handleSignOut = async () => await nhost.auth.signOut();

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
    
    console.log('Search results:', result.data.users_app)
    setSearchUsersList(result.data.users_app || []);
  } catch (err) {
    console.error('Error fetching users:', err);
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
      navigate(`/chat/${newChatId}`);
    } catch (err) {
      console.error('Error adding chat:', err);
    }
  };

  if (!userId)
    return (
      <p className="flex items-center justify-center h-screen text-lg text-gray-500">
        You are not signed in. Redirecting...
      </p>
    );

  if (loading)
    return (
      <p className="flex items-center justify-center h-screen text-lg text-gray-500">
        Loading chats...
      </p>
    );

  if (error) {
    console.error('Error fetching chats:', error);
    return (
      <p className="flex items-center justify-center h-screen text-lg text-red-500">
        Error fetching chats.
      </p>
    );
  }

  const noChatsFound = !data?.chats || data.chats.length === 0;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Search Users */}
      <div className="w-1/4 p-4 border-r border-gray-200">
        <div className="flex mb-4">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search username"
            className="p-2 border w-full rounded"
          />
          <button
            onClick={handleSearchUser}
            className="ml-2 px-4 bg-indigo-500 text-white rounded"
          >
            Search
          </button>
        </div>

        {searchUsersList.map((user) => (
          <div key={user.user_id} className="mb-2">
            <button
              className="w-full p-2 bg-gray-100 rounded hover:bg-gray-200"
              onClick={() => handleAddChaters(user.user_id)}
            >
              <p>{user.user_name}</p>
              <p className="text-sm text-gray-500">{user.user_email}</p>
            </button>
          </div>
        ))}
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
                className={`p-4 mb-2 cursor-pointer transition-all duration-200 ease-in-out transform rounded-lg ${
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
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <ChatWindow chatId={selectedChatId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="text-lg text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="m-4 px-4 py-2 bg-red-500 text-white rounded"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
