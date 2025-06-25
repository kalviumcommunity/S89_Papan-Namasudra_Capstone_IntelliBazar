import React, { createContext, useContext, useState } from "react";

const WishlistSidebarContext = createContext();

export const useWishlistSidebar = () => {
  const context = useContext(WishlistSidebarContext);
  if (!context) {
    throw new Error("useWishlistSidebar must be used within a WishlistSidebarProvider");
  }
  return context;
};

export const WishlistSidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openWishlistSidebar = () => {
    setIsOpen(true);
  };

  const closeWishlistSidebar = () => {
    setIsOpen(false);
  };

  const toggleWishlistSidebar = () => {
    setIsOpen(!isOpen);
  };

  const value = {
    isOpen,
    openWishlistSidebar,
    closeWishlistSidebar,
    toggleWishlistSidebar,
  };

  return (
    <WishlistSidebarContext.Provider value={value}>
      {children}
    </WishlistSidebarContext.Provider>
  );
};
