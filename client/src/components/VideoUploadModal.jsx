import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaTimes, FaPlay, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const VideoUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    productName: '',
    productPrice: '',
    productImage: '',
    productCategory: 'Electronics',
    productRating: 0,
    productReviews: 0
  });

  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = [
    'Electronics', 'Fashion', 'Watches', 'Footwear', 
    'Home Decor', 'Books', 'Kitchen', 'Sports'
  ];

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        showError('File size must be less than 50MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('video/')) {
        showError('Please select a valid video file');
        return;
      }

      setVideoFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
    }
  }, [showError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    },
    multiple: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!videoFile) {
      showError('Please select a video file');
      return false;
    }

    if (!formData.title.trim()) {
      showError('Please enter a video title');
      return false;
    }

    if (!formData.productName.trim()) {
      showError('Please enter the product name');
      return false;
    }

    if (!formData.productPrice.trim()) {
      showError('Please enter the product price');
      return false;
    }

    if (!formData.productImage.trim()) {
      showError('Please enter the product image URL');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadData = new FormData();
      uploadData.append('video', videoFile);
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        uploadData.append(key, formData[key]);
      });

      const response = await axios.post(
        'http://localhost:8080/api/videos/upload',
        uploadData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        }
      );

      if (response.data.success) {
        showSuccess('Video uploaded successfully! It will be reviewed before going live.');
        onUploadSuccess && onUploadSuccess(response.data.data);
        handleClose();
      } else {
        showError(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showError(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    setFormData({
      title: '',
      description: '',
      productName: '',
      productPrice: '',
      productImage: '',
      productCategory: 'Electronics',
      productRating: 0,
      productReviews: 0
    });
    setUploadProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Upload Video Advertisement</h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Video Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video File *
            </label>
            {!videoFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  {isDragActive ? 'Drop the video here' : 'Drag & drop a video file'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  or click to select (Max 50MB, MP4/MOV/AVI/MKV/WEBM)
                </p>
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">{videoFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreview(null);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                </div>
                {videoPreview && (
                  <video
                    src={videoPreview}
                    controls
                    className="w-full max-h-48 rounded"
                  />
                )}
              </div>
            )}
          </div>

          {/* Video Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter video title"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Category *
              </label>
              <select
                name="productCategory"
                value={formData.productCategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your video advertisement"
              maxLength={500}
            />
          </div>

          {/* Product Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Product Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Price *
                </label>
                <input
                  type="text"
                  name="productPrice"
                  value={formData.productPrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="₹1,999"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image URL *
              </label>
              <input
                type="url"
                name="productImage"
                value={formData.productImage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/product-image.jpg"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Rating (0-5)
                </label>
                <input
                  type="number"
                  name="productRating"
                  value={formData.productRating}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Reviews
                </label>
                <input
                  type="number"
                  name="productReviews"
                  value={formData.productReviews}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !videoFile}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FaUpload />
                  <span>Upload Video</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoUploadModal;
