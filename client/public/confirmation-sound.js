// Confirmation sound generator using Web Audio API
// This creates a pleasant confirmation sound without needing external audio files

export const playOrderConfirmationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a pleasant confirmation melody
    const notes = [
      { freq: 523.25, duration: 0.2 }, // C5
      { freq: 659.25, duration: 0.2 }, // E5
      { freq: 783.99, duration: 0.4 }  // G5
    ];
    
    let startTime = audioContext.currentTime;
    
    notes.forEach((note, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set frequency
      oscillator.frequency.setValueAtTime(note.freq, startTime);
      
      // Create envelope (attack, decay, sustain, release)
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05); // Attack
      gainNode.gain.exponentialRampToValueAtTime(0.05, startTime + note.duration - 0.05); // Decay
      gainNode.gain.linearRampToValueAtTime(0, startTime + note.duration); // Release
      
      // Start and stop the oscillator
      oscillator.start(startTime);
      oscillator.stop(startTime + note.duration);
      
      startTime += note.duration;
    });
    
    return true;
  } catch (error) {
    console.log("Audio not supported:", error);
    return false;
  }
};

// Alternative simple beep sound
export const playSimpleConfirmationBeep = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    return true;
  } catch (error) {
    console.log("Audio not supported:", error);
    return false;
  }
};
