import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

const Toast = ({ toast }) => {
  const { removeToast } = useToast();

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div
      className={`flex items-center p-4 mb-3 rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out ${getBgColor()}`}
    >
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className={`flex-1 text-sm font-medium ${getTextColor()}`}>
        {toast.message}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className={`flex-shrink-0 ml-3 p-1 rounded-full hover:bg-opacity-20 hover:bg-gray-600 transition ${getTextColor()}`}
      >
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
