import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

/**
 * Renders star rating component with proper validation
 * @param {number|string} rating - Rating value (0-5)
 * @param {string} className - Additional CSS classes for stars
 * @param {string} size - Size variant ('xs', 'sm', 'md', 'lg')
 * @returns {JSX.Element} Star rating component
 */
export const renderStars = (rating, className = '', size = 'md') => {
  // Ensure rating is a valid number between 0 and 5
  const validRating = Math.max(0, Math.min(5, Number(rating) || 0));
  
  const fullStars = Math.floor(validRating);
  const hasHalfStar = validRating % 1 !== 0;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  // Size classes
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const starSize = sizeClasses[size] || sizeClasses.md;
  const starClass = `${starSize} ${className}`;

  return (
    <div className="flex items-center">
      {/* Full stars */}
      {fullStars > 0 && [...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} className={`text-yellow-500 ${starClass}`} />
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <FaStar key="half" className={`text-yellow-300 ${starClass}`} />
      )}
      
      {/* Empty stars */}
      {emptyStars > 0 && [...Array(emptyStars)].map((_, i) => (
        <FaRegStar key={`empty-${i}`} className={`text-gray-300 ${starClass}`} />
      ))}
    </div>
  );
};

/**
 * Star rating component with rating display
 * @param {Object} props - Component props
 * @param {number|string} props.rating - Rating value (0-5)
 * @param {number|string} props.reviewCount - Number of reviews
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size variant
 * @param {boolean} props.showReviewCount - Whether to show review count
 * @returns {JSX.Element} Star rating with review count
 */
export const StarRating = ({ 
  rating, 
  reviewCount = 0, 
  className = '', 
  size = 'md',
  showReviewCount = true 
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      {renderStars(rating, '', size)}
      {showReviewCount && (
        <span className="text-gray-500 ml-2 text-xs">
          ({Number(reviewCount) || 0})
        </span>
      )}
    </div>
  );
};

export default StarRating;
