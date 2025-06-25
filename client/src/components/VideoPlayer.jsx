import React, { useState, useRef, useEffect } from 'react';
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaShare,
  FaChevronUp,
  FaChevronDown
} from 'react-icons/fa';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCartSidebar } from '../context/CartSidebarContext';
import { useWishlistSidebar } from '../context/WishlistSidebarContext';
import { useToast } from '../context/ToastContext';
import '../styles/Shorts.css';

const VideoPlayer = ({ 
  videos, 
  currentIndex, 
  onVideoChange, 
  onLike, 
  onShare 
}) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { openCartSidebar } = useCartSidebar();
  const { openWishlistSidebar } = useWishlistSidebar();
  const { showSuccess, showError } = useToast();

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const currentVideo = videos[currentIndex];

  // Enhanced swipe handlers with better sensitivity
  const swipeHandlers = useSwipeable({
    onSwipedUp: (eventData) => {
      console.log('Swipe up detected', eventData);
      // Only trigger if swipe is significant enough
      if (Math.abs(eventData.deltaY) > 50 && currentIndex < videos.length - 1) {
        console.log('Advancing to next video');
        setSwipeFeedback('up');
        setTimeout(() => setSwipeFeedback(null), 300);
        onVideoChange(currentIndex + 1);
      }
    },
    onSwipedDown: (eventData) => {
      console.log('Swipe down detected', eventData);
      // Only trigger if swipe is significant enough
      if (Math.abs(eventData.deltaY) > 50 && currentIndex > 0) {
        console.log('Going to previous video');
        setSwipeFeedback('down');
        setTimeout(() => setSwipeFeedback(null), 300);
        onVideoChange(currentIndex - 1);
      }
    },
    onSwiping: (eventData) => {
      // Provide visual feedback during swipe
      const swipeProgress = Math.min(Math.abs(eventData.deltaY) / 100, 1);
      // You can add visual feedback here if needed
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    trackTouch: true,
    delta: 10, // Minimum distance before swipe is detected
    swipeDuration: 500, // Maximum time for swipe
    touchEventOptions: { passive: false }
  });

  // Video event handlers with improved error handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      console.log('Video loading started:', currentVideo?.title);
      setIsLoading(true);
      setVideoError(false);
    };

    const handleCanPlay = () => {
      console.log('Video can play:', currentVideo?.title);
      setIsLoading(false);
      setVideoError(false);
      setRetryCount(0);

      // Auto-play the video when it's ready
      if (video.paused) {
        video.play().then(() => {
          setIsPlaying(true);
          console.log('Video started playing');
        }).catch(error => {
          console.error('Auto-play failed:', error);
          setIsPlaying(false);
        });
      }
    };

    const handleTimeUpdate = () => {
      if (video.duration && !isNaN(video.duration)) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleError = (e) => {
      console.error('Video error:', e.target.error);
      console.error('Failed video URL:', currentVideo?.videoUrl);
      console.error('Error details:', {
        code: e.target.error?.code,
        message: e.target.error?.message,
        networkState: video.networkState,
        readyState: video.readyState
      });
      setIsLoading(false);
      setVideoError(true);

      // Auto-retry up to 2 times
      if (retryCount < 2) {
        console.log(`Retrying video load (${retryCount + 1}/2)`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          video.load();
        }, 2000);
      } else {
        console.error('Max retries reached for video:', currentVideo?.title);
      }
    };

    const handleEnded = () => {
      console.log('Video ended, advancing to next');
      setIsPlaying(false);
      // Auto-advance to next video
      if (currentIndex < videos.length - 1) {
        onVideoChange(currentIndex + 1);
      } else {
        // Loop back to first video
        onVideoChange(0);
      }
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, videos.length, onVideoChange, retryCount, currentVideo]);

  // Initialize video when it changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentVideo) return;

    console.log('Initializing video:', currentVideo?.title);
    console.log('Video URL:', currentVideo?.videoUrl);

    // Reset states
    setIsLoading(true);
    setVideoError(false);
    setProgress(0);
    setIsPlaying(false);
    setRetryCount(0);

    // Pause any currently playing video
    video.pause();
    video.currentTime = 0;

    // Set the new source and load
    video.src = currentVideo.videoUrl;
    video.load();

    // Add a timeout to detect if video is taking too long to load
    const loadTimeout = setTimeout(() => {
      if (video.readyState < 2) { // HAVE_CURRENT_DATA
        console.warn('Video taking too long to load:', currentVideo.title);
        setIsLoading(false);
        setVideoError(true);
      }
    }, 10000); // 10 second timeout

    return () => {
      clearTimeout(loadTimeout);
    };

  }, [currentIndex, currentVideo]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video || videoError) return;

    console.log('Toggle play/pause, current state:', isPlaying);

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      console.log('Video paused');
    } else {
      video.play().then(() => {
        setIsPlaying(true);
        console.log('Video playing');
      }).catch(error => {
        console.error('Play failed:', error);
        setIsPlaying(false);
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoClick = (e) => {
    e.stopPropagation();
    console.log('Video clicked');

    // Toggle play/pause on video click
    togglePlayPause();

    // Show controls briefly
    setShowControls(true);
    setTimeout(() => setShowControls(false), 3000);
  };

  const handleAddToCart = () => {
    if (!user) {
      showError("Please sign in to add items to cart");
      return;
    }

    const product = {
      name: currentVideo.productName,
      price: currentVideo.productPrice,
      image: currentVideo.productImage,
      category: currentVideo.productCategory,
      rating: currentVideo.productRating,
      reviews: currentVideo.productReviews
    };

    addToCart(product);
    openCartSidebar();
    showSuccess(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = () => {
    if (!user) {
      showError("Please sign in to add items to wishlist");
      return;
    }

    const product = {
      name: currentVideo.productName,
      price: currentVideo.productPrice,
      image: currentVideo.productImage,
      category: currentVideo.productCategory,
      rating: currentVideo.productRating,
      reviews: currentVideo.productReviews
    };

    if (isInWishlist(product)) {
      removeFromWishlist(product);
      showSuccess(`${product.name} removed from wishlist`);
    } else {
      addToWishlist(product);
      openWishlistSidebar();
      showSuccess(`${product.name} added to wishlist!`);
    }
  };

  const handleLike = () => {
    if (!user) {
      showError("Please sign in to like videos");
      return;
    }
    onLike(currentVideo._id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentVideo.title,
        text: `Check out this product: ${currentVideo.productName}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      showSuccess("Link copied to clipboard!");
    }
    onShare(currentVideo._id);
  };

  // Touch and scroll event handlers
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [swipeFeedback, setSwipeFeedback] = useState(null);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe && currentIndex < videos.length - 1) {
      setSwipeFeedback('up');
      setTimeout(() => setSwipeFeedback(null), 300);
      onVideoChange(currentIndex + 1);
    }
    if (isDownSwipe && currentIndex > 0) {
      setSwipeFeedback('down');
      setTimeout(() => setSwipeFeedback(null), 300);
      onVideoChange(currentIndex - 1);
    }
  };

  // Wheel event for desktop scrolling
  const handleWheel = (e) => {
    e.preventDefault();

    if (isScrolling) return;
    setIsScrolling(true);

    setTimeout(() => setIsScrolling(false), 500);

    if (e.deltaY > 0 && currentIndex < videos.length - 1) {
      // Scroll down - next video
      setSwipeFeedback('up');
      setTimeout(() => setSwipeFeedback(null), 300);
      onVideoChange(currentIndex + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      // Scroll up - previous video
      setSwipeFeedback('down');
      setTimeout(() => setSwipeFeedback(null), 300);
      onVideoChange(currentIndex - 1);
    }
  };

  if (!currentVideo) {
    console.log('No current video available');
    return (
      <div className="shorts-container video-player flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">📹</div>
          <p>No videos available</p>
        </div>
      </div>
    );
  }

  console.log('Rendering video:', currentVideo.title);
  console.log('Video URL:', currentVideo.videoUrl);

  return (
    <div
      {...swipeHandlers}
      className="shorts-container video-player"
      onClick={handleVideoClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={currentVideo.videoUrl}
        className="video-element"
        muted={isMuted}
        loop={false}
        playsInline
        preload="auto"
        webkit-playsinline="true"
        controls={false}
        onClick={handleVideoClick}
        style={{ cursor: 'pointer' }}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-sm">Loading video...</p>
            <p className="text-xs opacity-75 mt-1">{currentVideo?.title}</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center text-white p-6">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-bold mb-2">Video Failed to Load</h3>
            <p className="text-sm opacity-90 mb-4">{currentVideo?.title}</p>
            <p className="text-xs opacity-75 mb-4">
              {retryCount >= 2 ? 'Max retries reached' : 'Retrying...'}
            </p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => {
                  setRetryCount(0);
                  setVideoError(false);
                  videoRef.current?.load();
                }}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors"
              >
                Retry
              </button>
              {currentIndex < videos.length - 1 && (
                <button
                  onClick={() => onVideoChange(currentIndex + 1)}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm transition-colors"
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Swipe Feedback */}
      {swipeFeedback && (
        <div className="swipe-feedback">
          <div className={`text-white text-4xl ${swipeFeedback === 'up' ? 'swipe-up-indicator' : 'swipe-down-indicator'}`}>
            {swipeFeedback === 'up' ? '↑' : '↓'}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-600">
        <div 
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Video Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <button
              onClick={togglePlayPause}
              className="bg-black bg-opacity-50 rounded-full p-4 text-white text-2xl"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll Indicators */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-2">
        {/* Up indicator */}
        {currentIndex > 0 && (
          <div className="flex flex-col items-center text-white opacity-60 scroll-hint">
            <FaChevronUp className="text-sm" />
            <div className="text-xs mt-1">Swipe</div>
          </div>
        )}

        {/* Video position indicator */}
        <div className="flex flex-col space-y-1 my-4">
          {videos.map((_, index) => (
            <div
              key={index}
              className={`video-position-indicator w-1 h-6 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white active'
                  : index < currentIndex
                    ? 'bg-gray-400'
                    : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Down indicator */}
        {currentIndex < videos.length - 1 && (
          <div className="flex flex-col items-center text-white opacity-60 scroll-hint">
            <div className="text-xs mb-1">Swipe</div>
            <FaChevronDown className="text-sm" />
          </div>
        )}
      </div>

      {/* Video Info and Actions */}
      <div className="absolute bottom-20 left-4 right-20 text-white">
        <h3 className="text-lg font-bold mb-2">{currentVideo.title}</h3>
        {currentVideo.description && (
          <p className="text-sm opacity-90 mb-3">{currentVideo.description}</p>
        )}
        
        {/* Product Info */}
        <div className="bg-black bg-opacity-50 rounded-lg p-3 mb-4">
          <h4 className="font-semibold">{currentVideo.productName}</h4>
          <p className="text-xl font-bold text-green-400">{currentVideo.productPrice}</p>
          <div className="flex items-center mt-1">
            <div className="flex text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <span key={i}>
                  {i < Math.floor(currentVideo.productRating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-sm opacity-75">({currentVideo.productReviews} reviews)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleAddToCart}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full flex items-center space-x-2 transition-colors"
          >
            <FaShoppingCart />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Side Actions */}
      <div className="absolute bottom-32 right-4 flex flex-col space-y-4">
        <button
          onClick={toggleMute}
          className="bg-black bg-opacity-50 rounded-full p-3 text-white"
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        
        <button
          onClick={handleToggleWishlist}
          className="bg-black bg-opacity-50 rounded-full p-3 text-white"
        >
          {isInWishlist({
            name: currentVideo.productName,
            price: currentVideo.productPrice,
            image: currentVideo.productImage
          }) ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
        </button>

        <button
          onClick={handleLike}
          className="bg-black bg-opacity-50 rounded-full p-3 text-white flex flex-col items-center"
        >
          <FaHeart className={currentVideo.isLikedBy ? "text-red-500" : ""} />
          <span className="text-xs mt-1">{currentVideo.likeCount || 0}</span>
        </button>

        <button
          onClick={handleShare}
          className="bg-black bg-opacity-50 rounded-full p-3 text-white"
        >
          <FaShare />
        </button>
      </div>

      {/* Video Counter */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full px-3 py-1 text-white text-sm">
        {currentIndex + 1} / {videos.length}
      </div>
    </div>
  );
};

export default VideoPlayer;
