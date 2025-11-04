import React, { useEffect, useState } from "react";
import axios from "axios";

// ✅ Define TypeScript type for a message
interface Message {
  _id: string; // <-- Use _id from MongoDB
  name: string;
  phoneNumber: string;
  comment: string;
  email: string;
  createdAt?: string;
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

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this message?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/delete-message/${id}`);

      // Remove message from UI immediately
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete message.");
    }
  };

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
                key={msg._id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <h2 className="font-semibold text-lg">{msg.name}</h2>

                  {/* ✅ Delete Button */}
                  <button
                    onClick={() => handleDelete(msg._id)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>

                <p className="text-sm text-gray-500 mb-1">📞 {msg.phoneNumber}</p>
                <p className="text-sm text-gray-500 mb-1">✉️ {msg.email}</p>

                <p className="text-gray-700 mb-2">{msg.comment}</p>

                {msg.createdAt && (
                  <p className="text-xs text-gray-400">
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
