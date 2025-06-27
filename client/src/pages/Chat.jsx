import React from 'react';
import { FaRobot, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/chat.css';

const Chat = () => {
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
        {/* Embedded External Chatbot */}
        <div className="flex-1 w-full p-4">
          <iframe
            src="https://intellichatbot.onrender.com"
            className="w-full h-full border-0 rounded-lg shadow-2xl"
            title="IntelliBazar AI Assistant"
            allow="microphone; camera; clipboard-read; clipboard-write"
            style={{
              minHeight: 'calc(100vh - 140px)',
              backgroundColor: 'transparent'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
