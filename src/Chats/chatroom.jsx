// src/components/chatroom.js

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { nhost } from '../nhost';

// GraphQL query to get messages for a specific chat
const GET_MESSAGES = gql`
  query GetMessages($chatId: uuid!) {
    messages(where: { chat_id: { _eq: $chatId } }, order_by: { created_at: asc }) {
      id
      content
      created_at
      sender_id
    }
  }
`;

// GraphQL mutation to insert a new message
const INSERT_MESSAGE = gql`
  mutation InsertMessage($content: String!, $chat_id: uuid!, $sender_id: uuid!) {
    insert_messages_one(
      object: {
        content: $content,
        chat_id: $chat_id,
        sender_id: $sender_id
      }
    ) {
      id
      content
    }
  }
`;

export default function ChatWindow({ chatId }) {
  const [messageContent, setMessageContent] = useState('');
  const [senderId, setSenderId] = useState(null);

  // Get the logged-in user ID
  useEffect(() => {
    const user = nhost.auth.getUser();
    if (user) {
      setSenderId(user.id);
    }
  }, []);

  // Fetch messages using the chat ID
  const { data, loading, error, refetch } = useQuery(GET_MESSAGES, {
    variables: { chatId },
    skip: !chatId,
  });

  // Prepare the mutation for sending a new message
  const [insertMessage, { loading: mutationLoading }] = useMutation(INSERT_MESSAGE);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim() || !senderId) return;

    try {
      await insertMessage({
        variables: {
          content: messageContent,
          chat_id: chatId,
          sender_id: senderId
        }
      });
      setMessageContent('');
      // Refetch the messages to show the new one instantly
      refetch();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (!chatId) {
    return <p className="p-4 text-center text-gray-500">Select a chat to begin.</p>;
  }

  if (loading) return <p className="p-4 text-center text-gray-500">Loading messages...</p>;
  if (error) return <p className="p-4 text-center text-red-500">Error fetching messages.</p>;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {data.messages.length === 0 ? (
          <p className="text-gray-400 text-center italic">No messages yet. Send one to start the conversation!</p>
        ) : (
          data.messages.map(message => (
            <div key={message.id} className={`p-3 rounded-lg max-w-xs ${message.sender_id === senderId ? 'bg-indigo-500 text-white ml-auto' : 'bg-gray-200'}`}>
              <p className="font-medium">{message.content}</p>
              <span className="block text-xs mt-1 opacity-70">
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex">
        <input
          type="text"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={mutationLoading}
        />
        <button
          type="submit"
          className="p-3 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-300"
          disabled={mutationLoading || !messageContent.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}