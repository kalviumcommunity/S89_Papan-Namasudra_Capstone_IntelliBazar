import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaHome, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to IntelliBazar AI Assistant! I'm here to help you with all your shopping needs. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    }, 1500);
  };

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! Welcome to IntelliBazar. I can help you find products, track orders, get recommendations, or answer any questions about our services. What would you like to explore today?";
    } else if (input.includes('product') || input.includes('search') || input.includes('find')) {
      return "I'd be happy to help you find products! Here are some ways I can assist:\n\n• Search by category (electronics, fashion, books, etc.)\n• Find specific items by name or brand\n• Get personalized recommendations\n• Compare products and prices\n\nWhat type of product are you looking for?";
    } else if (input.includes('order') || input.includes('track') || input.includes('delivery')) {
      return "For order tracking, I can help you:\n\n• Check your order status\n• Get delivery updates\n• Modify or cancel recent orders\n• Handle return requests\n\nPlease provide your order number, or I can look it up using your account information.";
    } else if (input.includes('price') || input.includes('cost') || input.includes('discount') || input.includes('deal')) {
      return "Great question about pricing! I can help you:\n\n• Find current deals and discounts\n• Compare prices across similar products\n• Set up price alerts for items you want\n• Apply available coupon codes\n• Find the best value products in any category\n\nWhat specific product or category are you interested in?";
    } else if (input.includes('return') || input.includes('refund') || input.includes('exchange')) {
      return "I can help with returns and refunds:\n\n• 30-day return policy on most items\n• Free returns on orders over ₹500\n• Easy exchange process for size/color changes\n• Instant refunds to original payment method\n\nWould you like to start a return, or do you have questions about our return policy?";
    } else if (input.includes('recommend') || input.includes('suggest') || input.includes('best')) {
      return "I'd love to give you personalized recommendations! To suggest the best products for you, could you tell me:\n\n• What category interests you? (electronics, fashion, home, etc.)\n• Your budget range?\n• Any specific features you're looking for?\n• Is this for yourself or a gift?\n\nThe more details you share, the better I can tailor my suggestions!";
    } else if (input.includes('help') || input.includes('support')) {
      return "I'm here to provide comprehensive support! I can assist with:\n\n🛍️ **Shopping Help**\n• Product searches and recommendations\n• Price comparisons and deals\n• Category browsing guidance\n\n📦 **Order Support**\n• Order tracking and status\n• Delivery information\n• Returns and exchanges\n\n💳 **Account & Payment**\n• Account management\n• Payment options\n• Billing questions\n\n🎯 **Personalized Service**\n• Wishlist management\n• Custom recommendations\n• Shopping preferences\n\nWhat specific area would you like help with?";
    } else if (input.includes('account') || input.includes('profile') || input.includes('login')) {
      return "I can help with account-related questions:\n\n• Creating or accessing your account\n• Updating profile information\n• Managing your wishlist and preferences\n• Viewing order history\n• Setting up notifications\n\nAre you having trouble logging in, or would you like help with account settings?";
    } else {
      return "I understand you're asking about that. As your IntelliBazar AI assistant, I'm here to help with all your shopping needs. I can assist with:\n\n• Finding and recommending products\n• Tracking orders and deliveries\n• Answering questions about pricing and deals\n• Helping with returns and exchanges\n• Providing customer support\n\nCould you please let me know more specifically how I can help you today?";
    }
  };

  const quickActions = [
    { text: "Find Products", icon: "🔍" },
    { text: "Track Order", icon: "📦" },
    { text: "Best Deals", icon: "💰" },
    { text: "Help & Support", icon: "❓" }
  ];

  const handleQuickAction = (actionText) => {
    setInputMessage(actionText);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center text-gray-300 hover:text-white transition-colors group p-2 rounded-lg hover:bg-gray-800/50"
              title="Go back"
            >
              <FaArrowLeft className="text-lg group-hover:transform group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-3 mr-4 shadow-lg">
                <FaRobot size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">IntelliBazar AI Assistant</h1>
                <p className="text-sm text-green-400 flex items-center font-medium">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Online now
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 w-full flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-6xl mx-auto w-full custom-scrollbar">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div className={`flex items-start space-x-4 max-w-3xl ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                }`}>
                  {message.sender === 'user' ? <FaUser size={16} /> : <FaRobot size={16} />}
                </div>
                <div className={`px-5 py-4 rounded-2xl shadow-lg backdrop-blur-sm ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md border border-blue-500/30'
                    : 'bg-gray-800/90 text-gray-100 border border-gray-600/50 rounded-bl-md'
                }`}>
                  <p className="whitespace-pre-line text-sm leading-relaxed font-medium">{message.text}</p>
                  <p className={`text-xs mt-3 font-medium ${
                    message.sender === 'user' ? 'text-blue-100/80' : 'text-gray-400'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fadeIn">
              <div className="flex items-start space-x-4 max-w-3xl">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 text-white flex items-center justify-center shadow-lg">
                  <FaRobot size={16} />
                </div>
                <div className="bg-gray-800/90 text-gray-100 border border-gray-600/50 rounded-2xl rounded-bl-md px-5 py-4 shadow-lg backdrop-blur-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="px-6 py-6 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto">
              <p className="text-sm text-gray-300 mb-4 font-medium">Quick actions:</p>
              <div className="flex flex-wrap gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.text)}
                  className="flex items-center px-4 py-3 bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 hover:text-white rounded-xl text-sm transition-all duration-200 border border-gray-600/50 hover:border-gray-500/50 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span className="mr-2">{action.icon}</span>
                  {action.text}
                </button>
              ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 bg-gray-900/95 border-t border-gray-700/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 bg-gray-800/90 border border-gray-600/50 rounded-xl px-6 py-4 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm shadow-lg"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white rounded-xl px-6 py-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
            >
              <FaPaperPlane size={16} />
            </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
