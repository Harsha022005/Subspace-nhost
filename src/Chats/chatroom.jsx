import React, { useState, useEffect } from 'react';
import { useSubscription, gql, useApolloClient } from '@apollo/client';
import { nhost } from '../nhost';

const MESSAGE_SUBSCRIPTION = gql`
  subscription GetMessages($chatId: uuid!) {
    messages(where: { conversation_id: { _eq: $chatId } }, order_by: { timestamp: asc }) {
      id
      sender_id
      content
      timestamp
    }
  }
`;

const INSERT_MESSAGE = gql`
  mutation InsertMessage($conversation_id: uuid!, $sender_id: uuid!, $content: String!) {
    insert_messages_one(object: { conversation_id: $conversation_id, sender_id: $sender_id, content: $content }) {
      id
      content
    }
  }
`;

export default function ChatWindow({ chatId }) {
  const [messageContent, setMessageContent] = useState('');
  const [senderId, setSenderId] = useState(null);
  const client = useApolloClient();

  // Get current user ID
  useEffect(() => {
    const user = nhost.auth.getUser();
    if (user) setSenderId(user.id);
  }, []);

  // Subscription for real-time messages
  const { data, loading, error } = useSubscription(MESSAGE_SUBSCRIPTION, {
    variables: { chatId },
    skip: !chatId,
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent.trim() || !senderId) return;

    try {
      await client.mutate({
        mutation: INSERT_MESSAGE,
        variables: {
          conversation_id: chatId,
          sender_id: senderId,
          content: messageContent,
        },
      });
      setMessageContent('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <p className="text-gray-500 text-center">Loading messages...</p>
        ) : (!data?.messages || data.messages.length === 0) ? (
          <p className="text-gray-400 text-center italic">No messages yet. Start chatting!</p>
        ) : (
          data.messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg max-w-xs ${
                msg.sender_id === senderId ? 'bg-indigo-500 text-white ml-auto' : 'bg-gray-200'
              }`}
            >
              <p>{msg.content}</p>
              <span className="block text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          placeholder="Type a message..."
          className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="p-3 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          Send
        </button>
      </form>
    </div>
  );
}
