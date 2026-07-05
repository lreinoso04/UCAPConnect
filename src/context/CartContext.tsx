// Archivo: src/context/CartContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';

import { API_BASE_URL } from '../config';
import { loadAuth } from '../storage/authStorage';
import { authEvents } from '../api/authEvents'; // 👈 1. IMPORTAMOS EL MENSAJERO GLOBAL

export interface CartApiItem {
  id: number;
  cursoId: number;
  precio: number;
  titulo: string;
  imagenUrl: string;
  facilitador: string;
  tiempo: string;
  modalidad: string;
  recinto: string;
}

export interface CartResponse {
  items: CartApiItem[];
  subtotal: number;
  total: number;
  totalItems: number;
}

interface CartContextType {
  items: CartApiItem[];
  subtotal: number;
  totalPrice: number;
  totalItems: number;
  loading: boolean;
  loadCart: () => Promise<void>;
  addItem: (courseId: number) => Promise<void>;
  removeItem: (courseId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (courseId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartResponse>({
    items: [],
    subtotal: 0,
    total: 0,
    totalItems: 0,
  });
  const addingRef = useRef(false);


  const [loading, setLoading] = useState(false);

  // 🔥 Caso 3: Verificar token y expiración local antes de generar las cabeceras
  const getAuthHeaders = async () => {
    const auth = await loadAuth();

    if (auth) {
      const expired = new Date(auth.expireAt).getTime() <= Date.now();
      if (expired) {
        authEvents.emitLogout(); // 🚨 ¡Botón de pánico! Token expirado localmente
        throw new Error('Token expirado localmente');
      }
    }

    if (!auth?.token) {
      authEvents.emitLogout(); // 🚨 ¡Botón de pánico! Sin token activo
      throw new Error('No existe una sesión activa');
    }

    return {
      Authorization: `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    };
  };

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);

      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/api/v1/courses/carrito`,
        {
          method: 'GET',
          headers,
        }
      );

      // 🔥 Caso 2: Si el servidor devuelve 401 al cargar el carrito
      if (response.status === 401) {
        authEvents.emitLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Error cargando carrito (${response.status})`
        );
      }

      const data: CartResponse = await response.json();
      setCart(data);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addItem = useCallback(async (courseId: number) => {
    if (addingRef.current) {
      return;
    }

    addingRef.current = true;

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/api/v1/courses/carrito/${courseId}`,
        {
          method: 'PUT',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error('Error agregando curso');
      }

      const data: CartResponse = await response.json();
      setCart(data);
    } finally {
      addingRef.current = false;
    }
  }, []);

  const removeItem = useCallback(async (courseId: number) => {
    try {
      setLoading(true);

      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/api/v1/courses/carrito/${courseId}`,
        {
          method: 'DELETE',
          headers,
        }
      );

      // 🔥 Caso 2: Si el servidor devuelve 401 al eliminar
      if (response.status === 401) {
        authEvents.emitLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Error eliminando curso (${response.status})`
        );
      }

      const data: CartResponse = await response.json();
      setCart(data);
    } catch (error) {
      console.error('removeItem:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);

      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/api/v1/courses/carrito`,
        {
          method: 'DELETE',
          headers,
        }
      );

      // 🔥 Caso 2: Si el servidor devuelve 401 al limpiar
      if (response.status === 401) {
        authEvents.emitLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Error vaciando carrito (${response.status})`
        );
      }

      const data: CartResponse = await response.json();
      setCart(data);
    } catch (error) {
      console.error('clearCart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const isInCart = useCallback(
    (courseId: number) => {
      return cart.items.some(
        item => item.cursoId === courseId
      );
    },
    [cart.items]
  );

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        subtotal: cart.subtotal,
        totalPrice: cart.total,
        totalItems: cart.totalItems,
        loading,
        loadCart,
        addItem,
        removeItem,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used within CartProvider'
    );
  }

  return context;
}