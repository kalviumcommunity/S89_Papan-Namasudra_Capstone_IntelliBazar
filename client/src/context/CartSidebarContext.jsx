import React, { createContext, useContext, useState } from "react";

const CartSidebarContext = createContext();

export const useCartSidebar = () => {
  const context = useContext(CartSidebarContext);
  if (!context) {
    throw new Error("useCartSidebar must be used within a CartSidebarProvider");
  }
  return context;
};

export const CartSidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openCartSidebar = () => {
    setIsOpen(true);
  };

  const closeCartSidebar = () => {
    setIsOpen(false);
  };

  const toggleCartSidebar = () => {
    setIsOpen(!isOpen);
  };

  const value = {
    isOpen,
    openCartSidebar,
    closeCartSidebar,
    toggleCartSidebar,
  };

  return (
    <CartSidebarContext.Provider value={value}>
      {children}
    </CartSidebarContext.Provider>
  );
};
