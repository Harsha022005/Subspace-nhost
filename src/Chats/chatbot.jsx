import React, { useState } from "react";
import Navbar from "../navbar";
export default function ChatBot() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("https://harsha-568.app.n8n.cloud/webhook/5dc5f10e-dbfc-4d49-8161-28c5182ae11f", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      console.log("Bot response:", data);
      setReply(data.text);
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
       <div className="bg-indigo-600 text-white shadow-md">
            <Navbar />
          </div>
      <h2 className="text-2xl font-bold mb-6 text-indigo-600">Chatbot</h2>
      <div className="flex space-x-2 mb-4">
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
      {reply && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-indigo-600">Reply:</h3>
          <p className="text-gray-700">{reply}</p>
        </div>
      )}
    </div>
  );
}