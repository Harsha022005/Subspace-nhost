import React, { useState, useEffect } from "react";
import Navbar from "../navbar";
import { gql, useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { useUserData, useAccessToken } from "@nhost/react";

const CREATE_CHAT = gql`
  mutation CreateChat($user_id: uuid!) {
    insert_chatbot_chats_one(object: { user_id: $user_id }) {
      id
    }
  }
`;

const GET_EXISTING_CHAT = gql`
  query GetChat($user_id: uuid!) {
    chatbot_chats(where: { user_id: { _eq: $user_id } }, limit: 1) {
      id
    }
  }
`;

const INSERT_MESSAGE = gql`
  mutation InsertMessage(
    $chat_id: uuid!
    $sender_id: uuid!
    $message: String!
    $is_user_message: Boolean!
  ) {
    insert_chatbot_messages_one(
      object: {
        chat_id: $chat_id
        sender_id: $sender_id
        message: $message
        is_user_message: $is_user_message
      }
    ) {
      id
      message
      is_user_message
      created_at
    }
  }
`;

const GET_MESSAGES = gql`
  query GetMessages($chat_id: uuid!) {
    chatbot_messages(
      where: { chat_id: { _eq: $chat_id } }
      order_by: { created_at: asc }
    ) {
      id
      message
      is_user_message
      created_at
    }
  }
`;

export default function ChatBot() {
  const user = useUserData();
  const accessToken = useAccessToken();
  const [chatId, setChatId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [createChat] = useMutation(CREATE_CHAT);
  const [insertMessage] = useMutation(INSERT_MESSAGE);
  const [getExistingChat] = useLazyQuery(GET_EXISTING_CHAT, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!user) return;

    const initChat = async () => {
      try {
        const { data } = await getExistingChat({
          variables: { user_id: user.id },
          context: { headers: { Authorization: `Bearer ${accessToken}` } },
        });

        if (data?.chatbot_chats?.length > 0) {
          setChatId(data.chatbot_chats[0].id);
        } else {
          const { data: newChat } = await createChat({
            variables: { user_id: user.id },
            context: { headers: { Authorization: `Bearer ${accessToken}` } },
          });
          setChatId(newChat.insert_chatbot_chats_one.id);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    initChat();
  }, [user, createChat, getExistingChat, accessToken]);

  const { data, refetch } = useQuery(GET_MESSAGES, {
    variables: { chat_id: chatId },
    skip: !chatId,
    context: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const messages = data?.chatbot_messages || [];

  const sendMessage = async () => {
    if (!message.trim() || !chatId) return;

    setLoading(true);
    try {
      await insertMessage({
        variables: {
          chat_id: chatId,
          sender_id: user.id,
          message,
          is_user_message: true,
        },
        context: { headers: { Authorization: `Bearer ${accessToken}` } },
      });

      const res = await fetch(
        process.env.REACT_APP_CHATBOT_WEBHOOK_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        }
      );

      const data = await res.json();
      const botReply = data?.text || "Sorry, I couldn't process that.";

      const BOT_ID = process.env.REACT_APP_BOT_ID;
      await insertMessage({
        variables: {
          chat_id: chatId,
          sender_id: BOT_ID,
          message: botReply,
          is_user_message: false,
        },
        context: { headers: { Authorization: `Bearer ${accessToken}` } },
      });

      setMessage("");
      refetch();
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="max-w-2xl mx-auto mt-24 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-indigo-600 text-center">
          Chatbot
        </h2>

        <div className="h-80 overflow-y-auto mb-4 p-3 border border-gray-300 rounded-lg bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center mt-32">
              No messages yet. Start chatting!
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 mb-2 rounded-lg max-w-xs break-words ${
                  msg.is_user_message
                    ? "ml-auto bg-indigo-100 text-indigo-900"
                    : "mr-auto bg-gray-200 text-gray-900"
                }`}
              >
                {msg.message}
              </div>
            ))
          )}
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Ask something..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors duration-300 ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
