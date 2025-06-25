import React, { useState } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaExpand } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ChatbotFloat = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your IntelliBazar assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const goToFullChat = () => {
    navigate('/chat');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response (replace with actual API call later)
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! Welcome to IntelliBazar. I can help you find products, track orders, or answer any questions you have.";
    } else if (input.includes('product') || input.includes('search') || input.includes('find')) {
      return "I can help you find products! What are you looking for? You can search by category like electronics, fashion, books, or tell me about a specific item.";
    } else if (input.includes('order') || input.includes('track') || input.includes('delivery')) {
      return "To track your order, please provide your order number. You can also check your order status in your profile section.";
    } else if (input.includes('price') || input.includes('cost') || input.includes('discount')) {
      return "I can help you find the best deals! Check out our special offers section or let me know what product you're interested in for current pricing.";
    } else if (input.includes('return') || input.includes('refund') || input.includes('exchange')) {
      return "Our return policy allows returns within 30 days of purchase. Items must be in original condition. Would you like me to guide you through the return process?";
    } else if (input.includes('help') || input.includes('support')) {
      return "I'm here to help! I can assist with:\n• Product searches and recommendations\n• Order tracking and status\n• Account and profile questions\n• Return and refund policies\n• General shopping assistance";
    } else {
      return "I understand you're asking about that. Let me help you find what you need. You can also browse our categories or use the search feature to find specific products.";
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="bg-black  text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label="Open chat"
        >
          {isOpen ? <FaTimes size={24} /> : <FaComments size={24} />}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Chat Header */}
          <div className="bg-black text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center cursor-pointer" onClick={goToFullChat}>
              <img
                src="https://png.pngtree.com/png-clipart/20241120/original/pngtree-creative-design-shopping-cart-icon-png-image_17269496.png"
                alt="IntelliBazar Logo"
                className="w-8 h-8 mr-2 bg-white rounded-full p-1"
              />
              <div>
                <h3 className="font-semibold">IntelliBazar Assistant</h3>
                <p className="text-xs opacity-90">Online now • Click to expand</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={goToFullChat}
                className="text-white hover:text-gray-200 transition-colors"
                title="Open full chat"
              >
                <FaExpand size={16} />
              </button>
              <button
                onClick={toggleChat}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-3 py-2 text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotFloat;
