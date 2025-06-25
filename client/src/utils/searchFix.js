// Simple fix for search functionality
export const setupSearchListener = (setSearchTerm, setSelectedCategories) => {
  const updateFromURL = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const searchQuery = searchParams.get('search');
    const categoryQuery = searchParams.get('category');

    if (searchQuery) {
      setSearchTerm(searchQuery);
    } else {
      setSearchTerm('');
    }

    if (categoryQuery) {
      setSelectedCategories([categoryQuery]);
    }
  };

  // Initial update
  updateFromURL();

  // Listen for URL changes
  const handlePopState = () => {
    updateFromURL();
  };

  window.addEventListener('popstate', handlePopState);

  // Override pushState and replaceState to catch programmatic navigation
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  window.history.pushState = function(...args) {
    originalPushState.apply(window.history, args);
    setTimeout(updateFromURL, 0);
  };

  window.history.replaceState = function(...args) {
    originalReplaceState.apply(window.history, args);
    setTimeout(updateFromURL, 0);
  };

  // Return cleanup function
  return () => {
    window.removeEventListener('popstate', handlePopState);
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
  };
};
