import React, { useState, useRef, useEffect } from 'react';

const VideoDebugger = ({ videos, currentIndex }) => {
  const [debugInfo, setDebugInfo] = useState({});
  const videoRefs = useRef({});

  useEffect(() => {
    // Test each video URL
    videos.forEach((video, index) => {
      const testVideo = document.createElement('video');
      testVideo.preload = 'metadata';
      testVideo.muted = true;
      
      const updateDebugInfo = (status, details = {}) => {
        setDebugInfo(prev => ({
          ...prev,
          [video._id]: {
            index,
            title: video.title,
            url: video.videoUrl,
            status,
            ...details
          }
        }));
      };

      testVideo.addEventListener('loadstart', () => {
        updateDebugInfo('loading', { networkState: testVideo.networkState });
      });

      testVideo.addEventListener('loadedmetadata', () => {
        updateDebugInfo('metadata-loaded', { 
          duration: testVideo.duration,
          videoWidth: testVideo.videoWidth,
          videoHeight: testVideo.videoHeight
        });
      });

      testVideo.addEventListener('canplay', () => {
        updateDebugInfo('can-play', { readyState: testVideo.readyState });
      });

      testVideo.addEventListener('error', (e) => {
        updateDebugInfo('error', { 
          error: e.target.error?.message || 'Unknown error',
          code: e.target.error?.code
        });
      });

      testVideo.src = video.videoUrl;
      videoRefs.current[video._id] = testVideo;
    });

    return () => {
      // Cleanup
      Object.values(videoRefs.current).forEach(video => {
        video.src = '';
        video.load();
      });
    };
  }, [videos]);

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-md max-h-96 overflow-y-auto text-xs z-50">
      <h3 className="font-bold mb-2">Video Debug Info</h3>
      <div className="space-y-2">
        {Object.values(debugInfo).map((info) => (
          <div 
            key={info.index} 
            className={`p-2 rounded ${info.index === currentIndex ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            <div className="font-semibold">
              {info.index + 1}. {info.title.substring(0, 30)}...
            </div>
            <div className="mt-1">
              Status: <span className={`font-bold ${
                info.status === 'can-play' ? 'text-green-400' :
                info.status === 'error' ? 'text-red-400' :
                info.status === 'loading' ? 'text-yellow-400' :
                'text-gray-400'
              }`}>
                {info.status}
              </span>
            </div>
            {info.duration && (
              <div>Duration: {Math.round(info.duration)}s</div>
            )}
            {info.error && (
              <div className="text-red-400">Error: {info.error}</div>
            )}
            {info.videoWidth && (
              <div>Size: {info.videoWidth}x{info.videoHeight}</div>
            )}
            <div className="text-gray-400 break-all">
              URL: {info.url.substring(0, 50)}...
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoDebugger;
