import React, { useState, useRef, useEffect } from "react";
import { streamGeminiResponse } from "../utils/geminiChat"; // adjust path if needed
import "./GeneralChatbot.css";

const GeneralChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      let assistantMessage = "";
      for await (const partial of streamGeminiResponse(apiKey, [
        ...messages,
        { role: "user", content: userMessage },
      ])) {
        assistantMessage = partial;
        setMessages((prev) => {
          if (prev.length && prev[prev.length - 1].role === "assistant") {
            return [...prev.slice(0, -1), { role: "assistant", content: assistantMessage }];
          } else {
            return [...prev, { role: "assistant", content: assistantMessage }];
          }
        });
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className="chatbot-fab-modern"
          onClick={() => setIsOpen(true)}
          aria-label="Open chatbot"
        >
          💬
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="chatbot-float-modern">
          <div className="chatbot-header-modern">
            <span>AI Assistant</span>
            <button className="chatbot-close-modern" onClick={() => setIsOpen(false)} aria-label="Close chatbot">
              ×
            </button>
          </div>
          <div className="chatbot-messages-modern">
            {messages.length === 0 && (
              <div className="message-modern assistant" style={{ textAlign: "center", opacity: 0.7 }}>
                Hi! Ask me anything.
              </div>
            )}
            {messages.map((message, idx) => (
              <div key={idx} className={`message-modern ${message.role}`}>
                {message.content}
              </div>
            ))}
            {isLoading && <div className="message-modern assistant">Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="chatbot-input-modern">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              autoFocus
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default GeneralChatbot;