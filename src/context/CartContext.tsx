import React, { createContext, useContext, useState, useCallback } from 'react';
import { CartItem, Course } from '../types/product';

interface CartContextType {
  items: CartItem[];
  addItem: (course: Course) => void;
  removeItem: (courseId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isInCart: (courseId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((course: Course) => {
    setItems(prev => {
      if (prev.some(item => item.course.id === course.id)) return prev;
      return [...prev, { course }];
    });
  }, []);

  const removeItem = useCallback((courseId: string) => {
    setItems(prev => prev.filter(item => item.course.id !== courseId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.length;
  const totalPrice = items.reduce((sum, item) => sum + item.course.price, 0);
  const isInCart = useCallback((courseId: string) => items.some(item => item.course.id === courseId), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems, totalPrice, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
