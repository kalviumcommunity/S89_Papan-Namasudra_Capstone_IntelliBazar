import { useState, useRef, useCallback, useEffect } from 'react';

const useVoiceSearch = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Check if Web Speech API is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Configure recognition settings
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    // Handle speech recognition results
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update transcript with final or interim results
      setTranscript(finalTranscript || interimTranscript);
    };

    // Handle recognition start
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
      
      // Set a timeout to stop listening after 10 seconds
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, 10000);
    };

    // Handle recognition end
    recognition.onend = () => {
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    // Handle recognition errors
    recognition.onerror = (event) => {
      setIsListening(false);
      setError(getErrorMessage(event.error));
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    // Handle no speech detected
    recognition.onnomatch = () => {
      setError('No speech was detected. Please try again.');
    };

    return recognition;
  }, [isSupported]);

  // Get user-friendly error messages
  const getErrorMessage = (error) => {
    switch (error) {
      case 'no-speech':
        return 'No speech was detected. Please try again.';
      case 'audio-capture':
        return 'No microphone was found. Please check your microphone settings.';
      case 'not-allowed':
        return 'Microphone access was denied. Please allow microphone access and try again.';
      case 'network':
        return 'Network error occurred. Please check your internet connection.';
      case 'service-not-allowed':
        return 'Speech recognition service is not allowed. Please try again.';
      case 'bad-grammar':
        return 'Speech recognition error. Please try again.';
      case 'language-not-supported':
        return 'Language not supported. Please try again.';
      default:
        return 'An error occurred during speech recognition. Please try again.';
    }
  };

  // Start voice recognition
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      return; // Already listening
    }

    try {
      const recognition = initializeRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
      }
    } catch (err) {
      setError('Failed to start speech recognition. Please try again.');
      console.error('Speech recognition error:', err);
    }
  }, [isSupported, isListening, initializeRecognition]);

  // Stop voice recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Reset transcript and error
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useVoiceSearch;
