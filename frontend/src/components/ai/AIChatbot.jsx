
import { useState } from "react";
import { askRoadAssistant } from "../../services/openaiService";

export default function AIChatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am RoadWatch AI Assistant. Ask me anything about roads, contractors, complaints or maintenance.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    const aiReply = await askRoadAssistant(input);

    setMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: aiReply,
      },
    ]);

    setInput("");
    setLoading(false);
  };

  return (
    <div className="bg-zinc-900 text-white rounded-2xl p-4 shadow-xl w-full">
      <h2 className="text-2xl font-bold mb-4">
        RoadWatch AI Assistant
      </h2>

      <div className="h-[400px] overflow-y-auto space-y-3 mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.sender === "user"
                ? "text-right"
                : "text-left"
            }
          >
            <div className="inline-block bg-zinc-800 px-4 py-2 rounded-xl max-w-[80%]">
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-sm text-gray-400">
            AI is analyzing road data...
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about roads..."
          className="flex-1 bg-zinc-800 p-3 rounded-xl outline-none"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 px-5 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}
