import { useState, useEffect } from 'react';

const useUrlParams = () => {
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handleLocationChange = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleLocationChange);
    
    // Listen for pushstate/replacestate events (programmatic navigation)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      handleLocationChange();
    };

    // Initial check
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  return {
    searchParams,
    getParam: (key) => searchParams.get(key),
    hasParam: (key) => searchParams.has(key),
    getAllParams: () => Object.fromEntries(searchParams.entries())
  };
};

export default useUrlParams;
