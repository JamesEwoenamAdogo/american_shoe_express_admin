import React, { useEffect, useState } from "react";
import axios from "axios";

// ✅ Define TypeScript type for a message
interface Message {
  id: string;
  name: string;
  phoneNumber: string;
  comment: string;
  createdAt?: string; // optional if your backend returns timestamp
}

const CommentPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("/all-messages");
        const allMessages: Message[] = response.data?.allMessages ?? [];
        console.log(response)
        setMessages(allMessages);
      } catch (err) {
        console.error(err);
        setError("Failed to load messages.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">User Comments</h1>
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <h2 className="font-semibold text-lg">{msg.name}</h2>
                <p className="text-sm text-gray-500 mb-2">{msg.phoneNumber}</p>
                <p className="text-gray-700">{msg.comment}</p>
                {msg.createdAt && (
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentPage;
