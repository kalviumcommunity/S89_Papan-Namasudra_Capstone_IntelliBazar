// Video optimization utilities for the Shorts page

/**
 * Preload videos for smooth playback
 * @param {Array} videos - Array of video objects
 * @param {number} currentIndex - Current video index
 * @param {number} preloadCount - Number of videos to preload ahead
 */
export const preloadVideos = (videos, currentIndex, preloadCount = 2) => {
  const preloadPromises = [];
  
  for (let i = 1; i <= preloadCount; i++) {
    const nextIndex = currentIndex + i;
    if (nextIndex < videos.length) {
      const video = videos[nextIndex];
      if (video.videoUrl) {
        const preloadPromise = new Promise((resolve, reject) => {
          const videoElement = document.createElement('video');
          videoElement.preload = 'metadata';
          videoElement.src = video.videoUrl;
          
          videoElement.addEventListener('loadedmetadata', () => {
            resolve(video);
          });
          
          videoElement.addEventListener('error', () => {
            reject(new Error(`Failed to preload video: ${video.title}`));
          });
          
          // Set a timeout to avoid hanging
          setTimeout(() => {
            reject(new Error(`Preload timeout for video: ${video.title}`));
          }, 10000);
        });
        
        preloadPromises.push(preloadPromise);
      }
    }
  }
  
  return Promise.allSettled(preloadPromises);
};

/**
 * Optimize video element for better performance
 * @param {HTMLVideoElement} videoElement - Video element to optimize
 */
export const optimizeVideoElement = (videoElement) => {
  if (!videoElement) return;
  
  // Set optimal attributes for mobile playback
  videoElement.playsInline = true;
  videoElement.preload = 'metadata';
  videoElement.setAttribute('webkit-playsinline', 'true');
  videoElement.setAttribute('playsinline', 'true');
  
  // Optimize for low latency
  if ('fastSeek' in videoElement) {
    videoElement.fastSeek = true;
  }
  
  // Set buffer size for smooth playback
  if (videoElement.buffered && videoElement.buffered.length > 0) {
    const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
    const currentTime = videoElement.currentTime;
    
    // If we have less than 5 seconds buffered ahead, prioritize buffering
    if (bufferedEnd - currentTime < 5) {
      videoElement.preload = 'auto';
    }
  }
};

/**
 * Check if video should be auto-played based on user preferences and connection
 * @returns {boolean} Whether auto-play should be enabled
 */
export const shouldAutoPlay = () => {
  // Check if user prefers reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }
  
  // Check connection type if available
  if ('connection' in navigator) {
    const connection = navigator.connection;
    
    // Don't auto-play on slow connections
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return false;
    }
    
    // Be conservative with data usage on cellular
    if (connection.type === 'cellular' && connection.saveData) {
      return false;
    }
  }
  
  return true;
};

/**
 * Get optimal video quality based on device and connection
 * @param {Object} video - Video object with multiple quality options
 * @returns {string} Optimal video URL
 */
export const getOptimalVideoQuality = (video) => {
  if (!video.videoUrl) return null;
  
  // If only one quality available, return it
  if (typeof video.videoUrl === 'string') {
    return video.videoUrl;
  }
  
  // If multiple qualities available, choose based on device
  const qualities = video.videoUrl;
  const screenWidth = window.screen.width;
  const devicePixelRatio = window.devicePixelRatio || 1;
  const effectiveWidth = screenWidth * devicePixelRatio;
  
  // Check connection speed
  let connectionSpeed = 'fast';
  if ('connection' in navigator) {
    const connection = navigator.connection;
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      connectionSpeed = 'slow';
    } else if (connection.effectiveType === '3g') {
      connectionSpeed = 'medium';
    }
  }
  
  // Select quality based on screen size and connection
  if (connectionSpeed === 'slow' || effectiveWidth < 720) {
    return qualities.low || qualities.medium || qualities.high || qualities.original;
  } else if (connectionSpeed === 'medium' || effectiveWidth < 1080) {
    return qualities.medium || qualities.high || qualities.original || qualities.low;
  } else {
    return qualities.high || qualities.original || qualities.medium || qualities.low;
  }
};

/**
 * Lazy load video thumbnails
 * @param {Array} videos - Array of video objects
 * @param {number} visibleRange - Range of videos to load thumbnails for
 */
export const lazyLoadThumbnails = (videos, visibleRange = 5) => {
  const imagePromises = [];
  
  videos.slice(0, visibleRange).forEach(video => {
    if (video.thumbnailUrl) {
      const imagePromise = new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(video);
        img.onerror = () => reject(new Error(`Failed to load thumbnail: ${video.title}`));
        img.src = video.thumbnailUrl;
      });
      
      imagePromises.push(imagePromise);
    }
  });
  
  return Promise.allSettled(imagePromises);
};

/**
 * Clean up video resources to prevent memory leaks
 * @param {HTMLVideoElement} videoElement - Video element to clean up
 */
export const cleanupVideoElement = (videoElement) => {
  if (!videoElement) return;
  
  try {
    // Pause and reset video
    videoElement.pause();
    videoElement.currentTime = 0;
    
    // Remove source to free up memory
    videoElement.removeAttribute('src');
    videoElement.load();
    
    // Remove event listeners if they were added dynamically
    const events = ['loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'error'];
    events.forEach(event => {
      videoElement.removeEventListener(event, () => {});
    });
  } catch (error) {
    console.warn('Error cleaning up video element:', error);
  }
};

/**
 * Monitor video performance and adjust quality if needed
 * @param {HTMLVideoElement} videoElement - Video element to monitor
 * @param {Function} onQualityChange - Callback when quality should be changed
 */
export const monitorVideoPerformance = (videoElement, onQualityChange) => {
  if (!videoElement) return;
  
  let stallCount = 0;
  let lastStallTime = 0;
  
  const handleStall = () => {
    stallCount++;
    lastStallTime = Date.now();
    
    // If too many stalls, suggest lower quality
    if (stallCount > 3) {
      console.warn('Video stalling frequently, suggesting quality reduction');
      onQualityChange && onQualityChange('lower');
    }
  };
  
  const handleProgress = () => {
    // Reset stall count if video is playing smoothly
    if (Date.now() - lastStallTime > 10000) {
      stallCount = 0;
    }
  };
  
  videoElement.addEventListener('stalled', handleStall);
  videoElement.addEventListener('progress', handleProgress);
  
  // Return cleanup function
  return () => {
    videoElement.removeEventListener('stalled', handleStall);
    videoElement.removeEventListener('progress', handleProgress);
  };
};

/**
 * Estimate video loading time based on file size and connection
 * @param {number} fileSize - Video file size in bytes
 * @returns {number} Estimated loading time in seconds
 */
export const estimateLoadingTime = (fileSize) => {
  if (!fileSize) return 0;
  
  let connectionSpeed = 1000000; // 1 Mbps default
  
  if ('connection' in navigator) {
    const connection = navigator.connection;
    
    // Convert effective type to approximate speed
    switch (connection.effectiveType) {
      case 'slow-2g':
        connectionSpeed = 50000; // 50 Kbps
        break;
      case '2g':
        connectionSpeed = 250000; // 250 Kbps
        break;
      case '3g':
        connectionSpeed = 1500000; // 1.5 Mbps
        break;
      case '4g':
        connectionSpeed = 10000000; // 10 Mbps
        break;
      default:
        connectionSpeed = 5000000; // 5 Mbps
    }
  }
  
  // Convert bytes to bits and calculate time
  const fileSizeBits = fileSize * 8;
  const estimatedSeconds = fileSizeBits / connectionSpeed;
  
  return Math.ceil(estimatedSeconds);
};

/**
 * Create video loading placeholder with progress
 * @param {Object} video - Video object
 * @param {number} progress - Loading progress (0-100)
 * @returns {HTMLElement} Placeholder element
 */
export const createVideoPlaceholder = (video, progress = 0) => {
  const placeholder = document.createElement('div');
  placeholder.className = 'video-placeholder';
  placeholder.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1f2937, #374151);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    z-index: 10;
  `;
  
  // Add thumbnail if available
  if (video.thumbnailUrl) {
    const thumbnail = document.createElement('img');
    thumbnail.src = video.thumbnailUrl;
    thumbnail.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.3;
      position: absolute;
      top: 0;
      left: 0;
    `;
    placeholder.appendChild(thumbnail);
  }
  
  // Add loading indicator
  const loadingContainer = document.createElement('div');
  loadingContainer.style.cssText = `
    position: relative;
    z-index: 11;
    text-align: center;
  `;
  
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  
  const progressText = document.createElement('div');
  progressText.textContent = `Loading... ${Math.round(progress)}%`;
  progressText.style.cssText = `
    margin-top: 10px;
    font-size: 14px;
    opacity: 0.8;
  `;
  
  loadingContainer.appendChild(spinner);
  loadingContainer.appendChild(progressText);
  placeholder.appendChild(loadingContainer);
  
  return placeholder;
};
