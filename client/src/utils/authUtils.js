// Authentication utility functions for cart and wishlist actions

export const checkAuthAndExecute = (user, action, redirectToLogin, actionName = "perform this action") => {
  if (!user) {
    const shouldRedirect = window.confirm(
      `Please sign in to ${actionName}. Would you like to go to the login page?`
    );
    if (shouldRedirect) {
      redirectToLogin();
    }
    return false;
  }
  action();
  return true;
};

export const showAuthRequiredMessage = (actionName = "perform this action") => {
  return `Please sign in to ${actionName}`;
};

export const createAuthenticatedHandler = (user, navigate, action, actionName) => {
  return () => {
    if (!user) {
      const shouldRedirect = window.confirm(
        `Please sign in to ${actionName}. Would you like to go to the login page?`
      );
      if (shouldRedirect) {
        navigate('/login');
      }
      return false;
    }
    return action();
  };
};
