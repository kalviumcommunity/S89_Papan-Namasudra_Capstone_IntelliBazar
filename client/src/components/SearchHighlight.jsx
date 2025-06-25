import React from 'react';

const SearchHighlight = ({ text, searchTerm, className = '' }) => {
  if (!searchTerm || !text) {
    return <span className={className}>{text}</span>;
  }

  // Create a case-insensitive regex to find all matches
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part matches the search term (case-insensitive)
        const isMatch = regex.test(part);
        regex.lastIndex = 0; // Reset regex for next test
        
        return isMatch ? (
          <mark 
            key={index} 
            className="bg-yellow-200 text-yellow-900 px-1 rounded font-medium"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};

export default SearchHighlight;
