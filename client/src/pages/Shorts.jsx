import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaFilter, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer';
import VideoUploadModal from '../components/VideoUploadModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import '../styles/Shorts.css';

const Shorts = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('Shorts component mounted');
    console.log('User authenticated:', !!user);
    console.log('User data:', user);
  }, [user]);

  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'all', 'Electronics', 'Fashion', 'Watches', 'Footwear', 
    'Home Decor', 'Books', 'Kitchen', 'Sports'
  ];

  // Fetch videos from API
  const fetchVideos = async (category = 'all') => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/videos`, {
        params: { category, limit: 50 }
      });

      if (response.data.success) {
        setVideos(response.data.data);
        setCurrentVideoIndex(0);
      } else {
        setError('Failed to load videos');
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos');
      // Add some sample videos for demo purposes
      setSampleVideos();
    } finally {
      setLoading(false);
    }
  };

  // Sample videos for demo (when API is not available)
  const setSampleVideos = () => {
    const sampleVideos = [
      {
        _id: '1',
        title: 'Amazing Smartphone Deal!',
        description: 'Check out this incredible smartphone with amazing features',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
        productName: 'Premium Smartphone',
        productPrice: '₹25,999',
        productImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
        productCategory: 'Electronics',
        productRating: 4.5,
        productReviews: 1250,
        views: 15420,
        likeCount: 892,
        isLikedBy: false,
        uploadedBy: { username: 'TechReviewer' }
      },
      {
        _id: '2',
        title: 'Stylish Fashion Collection',
        description: 'Discover the latest fashion trends',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
        productName: 'Designer Dress',
        productPrice: '₹3,999',
        productImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
        productCategory: 'Fashion',
        productRating: 4.2,
        productReviews: 567,
        views: 8930,
        likeCount: 445,
        isLikedBy: false,
        uploadedBy: { username: 'FashionGuru' }
      },
      {
        _id: '3',
        title: 'Premium Watch Collection',
        description: 'Luxury watches for every occasion',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314',
        productName: 'Luxury Watch',
        productPrice: '₹15,999',
        productImage: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314',
        productCategory: 'Watches',
        productRating: 4.8,
        productReviews: 234,
        views: 12340,
        likeCount: 678,
        isLikedBy: false,
        uploadedBy: { username: 'WatchExpert' }
      },
      {
        _id: '4',
        title: 'Trendy Sneakers Collection',
        description: 'Step up your style with these amazing sneakers',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772',
        productName: 'Sport Sneakers',
        productPrice: '₹4,999',
        productImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772',
        productCategory: 'Footwear',
        productRating: 4.3,
        productReviews: 789,
        views: 9876,
        likeCount: 523,
        isLikedBy: false,
        uploadedBy: { username: 'SneakerHead' }
      },
      {
        _id: '5',
        title: 'Modern Home Decor Ideas',
        description: 'Transform your living space with these beautiful decor pieces',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
        productName: 'Decorative Vase Set',
        productPrice: '₹2,499',
        productImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
        productCategory: 'Home Decor',
        productRating: 4.6,
        productReviews: 345,
        views: 7654,
        likeCount: 412,
        isLikedBy: false,
        uploadedBy: { username: 'HomeDesigner' }
      },
      {
        _id: '6',
        title: 'Professional Kitchen Essentials',
        description: 'Upgrade your cooking experience with premium kitchen tools',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
        productName: 'Chef Knife Set',
        productPrice: '₹8,999',
        productImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
        productCategory: 'Kitchen',
        productRating: 4.7,
        productReviews: 456,
        views: 11234,
        likeCount: 634,
        isLikedBy: false,
        uploadedBy: { username: 'ChefMaster' }
      }
    ];
    setVideos(sampleVideos);
  };

  useEffect(() => {
    fetchVideos(selectedCategory);
  }, [selectedCategory]);

  // Add keyboard navigation for testing
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp' && currentVideoIndex > 0) {
        handleVideoChange(currentVideoIndex - 1);
      } else if (e.key === 'ArrowDown' && currentVideoIndex < videos.length - 1) {
        handleVideoChange(currentVideoIndex + 1);
      } else if (e.key === ' ') {
        e.preventDefault(); // Prevent page scroll
        // Space bar to play/pause (handled by VideoPlayer)
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentVideoIndex, videos.length]);

  const handleVideoChange = (newIndex) => {
    if (newIndex >= 0 && newIndex < videos.length) {
      setCurrentVideoIndex(newIndex);
      // Increment view count
      incrementViewCount(videos[newIndex]._id);
    }
  };

  const incrementViewCount = async (videoId) => {
    try {
      await axios.post(`http://localhost:8080/api/videos/${videoId}/view`);
    } catch (err) {
      console.error('Error incrementing view count:', err);
    }
  };

  const handleLike = async (videoId) => {
    if (!user) {
      showError("Please sign in to like videos");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/videos/${videoId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        // Update the video in state
        setVideos(prevVideos =>
          prevVideos.map(video =>
            video._id === videoId
              ? {
                  ...video,
                  likeCount: response.data.data.likeCount,
                  isLikedBy: response.data.data.isLiked
                }
              : video
          )
        );
        showSuccess(response.data.message);
      }
    } catch (err) {
      console.error('Error liking video:', err);
      showError('Failed to like video');
    }
  };

  const handleShare = async (videoId) => {
    try {
      // Increment share count (if you want to track it)
      // await axios.post(`http://localhost:8080/api/videos/${videoId}/share`);
      showSuccess('Video shared successfully!');
    } catch (err) {
      console.error('Error sharing video:', err);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleUploadSuccess = (newVideo) => {
    // Refresh videos after successful upload
    fetchVideos(selectedCategory);
    showSuccess('Your video has been submitted for review!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Shorts...</p>
        </div>
      </div>
    );
  }

  if (error && videos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => fetchVideos(selectedCategory)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No Videos Available</h2>
          <p className="mb-6">Be the first to upload a video advertisement!</p>
          {user && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
            >
              <FaPlus />
              <span>Upload Video</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">


      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button and Categories */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                console.log('Back button clicked');
                // Check if there's a previous page in history
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  // If no history, go to home page as fallback
                  navigate('/');
                }
              }}
              className="text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all flex-shrink-0"
            >
              <FaArrowLeft />
            </button>

            {/* Category Filter - Same line as back button */}
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    selectedCategory === category
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'
                  }`}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Upload button */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {user ? (
              <button
                onClick={() => {
                  console.log('Upload button clicked');
                  setShowUploadModal(true);
                }}
                className="text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
              >
                <FaPlus />
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="text-white text-xs opacity-75">
                  Sign in to upload
                </div>
                <button
                  onClick={() => {
                    console.log('Test upload button clicked (no auth)');
                    setShowUploadModal(true);
                  }}
                  className="text-white p-1 rounded bg-red-600 text-xs"
                >
                  Test
                </button>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Video Player */}
      <VideoPlayer
        videos={videos}
        currentIndex={currentVideoIndex}
        onVideoChange={handleVideoChange}
        onLike={handleLike}
        onShare={handleShare}
      />

      {/* Video Upload Modal */}
      <VideoUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={handleUploadSuccess}
      />


    </div>
  );
};

export default Shorts;
