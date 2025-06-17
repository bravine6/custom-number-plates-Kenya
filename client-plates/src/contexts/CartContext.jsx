import { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [shippingMethod, setShippingMethod] = useState('free');
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    
    const savedShipping = localStorage.getItem('shippingMethod');
    if (savedShipping) {
      setShippingMethod(savedShipping);
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Save shipping method to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shippingMethod', shippingMethod);
  }, [shippingMethod]);
  
  // Add plate to cart
  const addToCart = (plate) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.plateId === plate.id
      );
      
      if (existingItemIndex !== -1) {
        // If the plate is already in the cart, increase the quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        // Otherwise, add a new item
        return [...prevItems, {
          plateId: plate.id,
          plateText: plate.text,
          plateType: plate.plateType,
          price: plate.price,
          previewUrl: plate.previewUrl,
          quantity: 1,
        }];
      }
    });
  };
  
  // Remove plate from cart
  const removeFromCart = (plateId) => {
    setCartItems((prevItems) => 
      prevItems.filter((item) => item.plateId !== plateId)
    );
  };
  
  // Update quantity of a cart item
  const updateQuantity = (plateId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(plateId);
      return;
    }
    
    setCartItems((prevItems) => 
      prevItems.map((item) => 
        item.plateId === plateId ? { ...item, quantity } : item
      )
    );
  };
  
  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };
  
  // Calculate cart totals
  const getCartTotals = () => {
    const subtotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity, 
      0
    );
    
    let shippingCost = 0;
    if (shippingMethod === 'express') {
      shippingCost = 500; // KES 500 for express shipping
    }
    
    const total = subtotal + shippingCost;
    
    return {
      subtotal,
      shippingCost,
      total,
    };
  };
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        shippingMethod,
        setShippingMethod,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotals,
        totalItems: cartItems.reduce((total, item) => total + item.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;