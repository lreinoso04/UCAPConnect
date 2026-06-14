import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ChatMessage, ChatState } from '@/types/chat';
import { chatbotService } from '@/services/chatbotService';

interface ChatContextValue extends ChatState {
  sendMessage: (message: string) => Promise<void>;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const sendMessage = useCallback(async (content: string) => {
    
    if (!content.trim() || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: generateId(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatbotService.sendMessage(content.trim());

      const assistantMessage: ChatMessage = {
        id: generateId(),
        content: response,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'No se pudo obtener respuesta. Intenta nuevamente.';

      setError(errorMessage);

      const errorMessageObj: ChatMessage = {
        id: generateId(),
        content: errorMessage,
        sender: 'assistant',
        timestamp: new Date(),
        error: true,
      };

      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: ChatContextValue = {
    messages,
    isLoading,
    isOpen,
    error,
    sendMessage,
    openChat,
    closeChat,
    toggleChat,
    clearError,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
