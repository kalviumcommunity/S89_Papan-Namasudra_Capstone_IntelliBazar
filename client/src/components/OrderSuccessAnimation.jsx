import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaShoppingBag, FaStar } from 'react-icons/fa';

const OrderSuccessAnimation = ({ orderData, totalAmount }) => {
  const [animationStep, setAnimationStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStep(1), 300);
    const timer2 = setTimeout(() => setAnimationStep(2), 800);
    const timer3 = setTimeout(() => {
      setShowConfetti(true);
      setAnimationStep(3);
    }, 1200);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Confetti component
  const Confetti = () => {
    const confettiPieces = Array.from({ length: 50 }, (_, i) => {
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
      const shapes = ['circle', 'square', 'triangle'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      return (
        <div
          key={i}
          className={`absolute opacity-80 confetti-piece ${shape}`}
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            width: shape === 'circle' ? '8px' : '6px',
            height: shape === 'circle' ? '8px' : '6px',
            borderRadius: shape === 'circle' ? '50%' : '0',
          }}
        />
      );
    });

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        {confettiPieces}
      </div>
    );
  };

  return (
    <div className="relative">
      {showConfetti && <Confetti />}
      
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center relative z-20">
        {/* Success Icon with Animation */}
        <div className="relative mb-6">
          <div 
            className={`transition-all duration-1000 ${
              animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
          >
            <div className="relative">
              <FaCheckCircle className="text-green-500 text-8xl mx-auto" />
              {/* Pulse ring animation */}
              <div 
                className={`absolute inset-0 border-4 border-green-500 rounded-full transition-all duration-1000 ${
                  animationStep >= 2 ? 'scale-150 opacity-0' : 'scale-100 opacity-50'
                }`}
              />
              <div 
                className={`absolute inset-0 border-4 border-green-400 rounded-full transition-all duration-1000 delay-300 ${
                  animationStep >= 2 ? 'scale-200 opacity-0' : 'scale-100 opacity-30'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div 
          className={`transition-all duration-800 delay-500 ${
            animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed!</h1>
          <p className="text-gray-600 mb-4">Your order has been successfully placed and confirmed.</p>
        </div>

        {/* Order Details */}
        <div 
          className={`transition-all duration-800 delay-700 ${
            animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center mb-2">
              <FaShoppingBag className="text-gray-600 mr-2" />
              <span className="font-semibold text-gray-800">Order Details</span>
            </div>
            
            {orderData && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-semibold text-gray-800">
                    {orderData.orderNumber || `#IB${Date.now().toString().slice(-6)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-lg text-green-600">₹{totalAmount}</span>
                </div>
              </div>
            )}
          </div>

          {/* Success indicators */}
          <div className="flex justify-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span>Order Confirmed</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              <span>Email Sent</span>
            </div>
          </div>
        </div>

        {/* Celebration elements */}
        <div className="absolute -top-4 -right-4 text-yellow-400 animate-bounce">
          <FaStar className="text-2xl" />
        </div>
        <div className="absolute -top-2 -left-4 text-yellow-400 animate-bounce delay-300">
          <FaStar className="text-xl" />
        </div>
        <div className="absolute -bottom-2 -right-2 text-yellow-400 animate-bounce delay-500">
          <FaStar className="text-lg" />
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .confetti-piece {
          animation: confetti-fall linear infinite;
        }

        .circle {
          border-radius: 50%;
        }

        .triangle {
          width: 0 !important;
          height: 0 !important;
          border-left: 3px solid transparent;
          border-right: 3px solid transparent;
          border-bottom: 6px solid;
          background: transparent !important;
        }
      `}</style>
    </div>
  );
};

export default OrderSuccessAnimation;
