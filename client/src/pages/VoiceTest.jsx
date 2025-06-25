import React from 'react';
import VoiceSearchTest from '../components/VoiceSearchTest';

const VoiceTest = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Voice Search Testing</h1>
        <VoiceSearchTest />
      </div>
    </div>
  );
};

export default VoiceTest;
