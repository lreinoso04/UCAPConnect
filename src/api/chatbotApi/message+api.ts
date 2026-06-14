import { ChatbotRequest, ChatbotResponse } from '@/types/chat';

const RESPONSES: Record<string, string> = {
  inscripcion: 'Para inscribirte en un curso, sigue estos pasos:\n\n1. Accede a la seccion "Cursos" en el menu principal\n2. Busca el curso de tu interes\n3. Haz clic en "Inscribirme"\n4. Completa el formulario de registro\n5. Confirma tu inscripcion\n\nRecibiras un correo de confirmacion con los detalles del curso.',
  curso: 'Ofrecemos una variedad de cursos en diferentes areas:\n\n- Desarrollo Web\n- Desarrollo Movil\n- Ciencia de Datos\n- Inteligencia Artificial\n- Diseno UX/UI\n\nPuedes explorar todos nuestros cursos en la seccion "Catalogo de Cursos".',
  precio: 'Nuestros cursos tienen precios accesibles:\n\n- Cursos basicos: desde $29.99\n- Cursos intermedios: desde $49.99\n- Cursos avanzados: desde $79.99\n- Certificaciones: desde $99.99\n\nTambien ofrecemos becas y descuentos para estudiantes.',
  horario: 'Nuestros cursos son 100% flexibles y en linea.\n\n- Acceso 24/7 al contenido\n- Aprende a tu propio ritmo\n- Sin horarios fijos\n- Soporte disponible de lunes a viernes, 9am - 6pm',
  certificado: 'Si, emitimos certificados de finalizacion para todos los cursos completados.\n\nLos certificados incluyen:\n- Nombre del curso\n- Fecha de finalizacion\n- Validacion digital\n- Credenciales verificables',
  soporte: 'Para contactar a soporte:\n\n- Correo: soporte@plataforma.edu\n- Chat en vivo: Lun-Vie, 9am-6pm\n- Telefono: +1-800-CURSOS\n\nResponderemos en menos de 24 horas.',
  default: 'Gracias por tu mensaje. Soy el asistente virtual y estoy aqui para ayudarte con:\n\n- Inscripcion a cursos\n- Informacion de cursos\n- Precios y pagos\n- Horarios y modalidad\n- Certificados\n- Soporte tecnico\n\nEn que puedo ayudarte hoy?',
};

function findBestResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('inscrib') || lowerMessage.includes('registr') || lowerMessage.includes('inscripci')) {
    return RESPONSES.inscripcion;
  }
  if (lowerMessage.includes('curso') || lowerMessage.includes('clase') || lowerMessage.includes('taller')) {
    return RESPONSES.curso;
  }
  if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('cuanto') || lowerMessage.includes('tarifa')) {
    return RESPONSES.precio;
  }
  if (lowerMessage.includes('horario') || lowerMessage.includes('hora') || lowerMessage.includes('tiempo') || lowerMessage.includes('flexib')) {
    return RESPONSES.horario;
  }
  if (lowerMessage.includes('certificad') || lowerMessage.includes('diploma') || lowerMessage.includes('constancia')) {
    return RESPONSES.certificado;
  }
  if (lowerMessage.includes('soporte') || lowerMessage.includes('ayuda') || lowerMessage.includes('problema') || lowerMessage.includes('contacto') || lowerMessage.includes('contactar')) {
    return RESPONSES.soporte;
  }

  return RESPONSES.default;
}

export async function POST(request: Request) {
  try {
    const body: ChatbotRequest = await request.json();

    if (!body.message || typeof body.message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'El mensaje es requerido' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const response: ChatbotResponse = {
      response: findBestResponse(body.message),
      success: false
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
