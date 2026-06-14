import { API_BASE_URL } from '@/config';
import { ChatbotRequest, ChatbotResponse } from '@/types/chat';

const API_TIMEOUT = 30000;

class ChatbotService {
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = API_TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async sendMessage(message: string): Promise<string> {
    const endpoint = `${API_BASE_URL}/api/v1/chatbot/message`;
    console.log('[ChatbotService] sendMessage called:', { endpoint, message });

    try {
      console.log('[ChatbotService] Haciendo POST request...');
      const response = await this.fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message } as ChatbotRequest),
      });

      console.log('[ChatbotService] Respuesta recibida:', { status: response.status, ok: response.ok });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('El servicio de chatbot no está disponible en este momento.');
        }
        if (response.status >= 500) {
          throw new Error('El servidor está experimentando problemas. Intenta más tarde.');
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data: ChatbotResponse = await response.json();
      console.log('[ChatbotService] Data parseada:', data);
      
      if (!data.success) {
        throw new Error(data.response || 'Error en la respuesta del chatbot');
      }
      
      console.log('[ChatbotService] Retornando respuesta:', data.response);
      return data.response;
    } catch (error) {
      console.error('[ChatbotService] Error capturado:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('La solicitud tardó demasiado. Verifica tu conexión.');
        }
        if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
          throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        }
        throw error;
      }
      throw new Error('Ocurrió un error inesperado. Intenta nuevamente.');
    }
  }
}

export const chatbotService = new ChatbotService();
