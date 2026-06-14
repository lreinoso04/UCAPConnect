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
 const [items, setItems] = useState<CartItem[]>([
  {
    course: {
      id: '1',
      name: 'Curso de React Native',
      description: 'Curso completo de React Native desde cero',
      price: 49.99,
      image_url: 'https://ucapconnect.ing.software/api/v1/images?url=https%3A%2F%2Fcap.uapa.edu.do%2Fwp-content%2Fuploads%2F2026%2F06%2FCurso-cap.jpg',
      category: 'Mobile',
      rating: 4.8,
      reviews_count: 30,
      instructor: 'Eliecer Bautista',
      duration: '10h',
      level: 'Intermedio',
      students_count: 120,
      badge_color: '#3b82f6',
      created_at: '2026-01-01',
    },
    
  },
  {
    course: {
      id: '2',
      name: 'Curso de programacion en Python',
      description: 'Curso completo de programacion en Python desde cero',
      price: 49.99,
      image_url: 'https://ucapconnect.ing.software/api/v1/images?url=https%3A%2F%2Fcap.uapa.edu.do%2Fwp-content%2Fuploads%2F2026%2F06%2FCurso-cap.jpg',
      category: 'Mobile',
      rating: 4.8,
      reviews_count: 30,
      instructor: 'Eliecer Bautista',
      duration: '10h',
      level: 'Intermedio',
      students_count: 120,
      badge_color: '#3b82f6',
      created_at: '2026-01-01',
    },
    
  }
]);

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
