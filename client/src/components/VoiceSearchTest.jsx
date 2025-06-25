import React from 'react';
import useVoiceSearch from '../hooks/useVoiceSearch';

const VoiceSearchTest = () => {
  const {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceSearch();

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Voice Search Test</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Browser Support: {isSupported ? '✅ Supported' : '❌ Not Supported'}
        </p>
        
        <p className="text-sm text-gray-600 mb-2">
          Status: {isListening ? '🎤 Listening...' : '⏸️ Not Listening'}
        </p>
        
        {transcript && (
          <p className="text-sm text-green-600 mb-2">
            Transcript: "{transcript}"
          </p>
        )}
        
        {error && (
          <p className="text-sm text-red-600 mb-2">
            Error: {error}
          </p>
        )}
      </div>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={startListening}
          disabled={!isSupported || isListening}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Start Listening
        </button>
        
        <button
          onClick={stopListening}
          disabled={!isListening}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Stop Listening
        </button>
        
        <button
          onClick={resetTranscript}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Reset
        </button>
      </div>
      
      <div className="text-xs text-gray-500">
        <p>• Click "Start Listening" and speak clearly</p>
        <p>• The transcript will appear above</p>
        <p>• Works best in Chrome, Edge, or Safari</p>
        <p>• Make sure microphone permissions are granted</p>
      </div>
    </div>
  );
};

export default VoiceSearchTest;
