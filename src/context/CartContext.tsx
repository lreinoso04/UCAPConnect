import React, { createContext, useContext, useState, useMemo } from 'react';
import type { CursoResponse } from '../types/api';

export type CartItem = {
  course: CursoResponse;
  selected: boolean;
};

type CartState = {
  items: CartItem[];
  cartCount: number;
  totalSelected: number;
  addToCart: (course: CursoResponse) => void;
  removeFromCart: (courseId: number) => void;
  toggleSelection: (courseId: number) => void;
  toggleAll: (selected: boolean) => void;
  clearCart: () => void;
  clearPurchased: () => void;
};

const CartContext = createContext<CartState | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (course: CursoResponse) => {
    setItems((prev) => {
      if (prev.some((item) => item.course.id === course.id)) return prev;
      return [...prev, { course, selected: true }];
    });
  };

  const removeFromCart = (courseId: number) => {
    setItems((prev) => prev.filter((item) => item.course.id !== courseId));
  };

  const toggleSelection = (courseId: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.course.id === courseId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleAll = (selected: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected })));
  };

  const clearCart = () => setItems([]);

  const clearPurchased = () => {
    setItems((prev) => prev.filter((item) => !item.selected));
  };

  const cartCount = items.length;
  const totalSelected = items.filter(i => i.selected).reduce((acc, curr) => acc + (parseFloat((curr.course as any).price || curr.course.acf?.precio_regular || '0') || 0), 0);

  const value = useMemo(
    () => ({
      items,
      cartCount,
      totalSelected,
      addToCart,
      removeFromCart,
      toggleSelection,
      toggleAll,
      clearCart,
      clearPurchased,
    }),
    [items, cartCount, totalSelected]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return ctx;
}
