import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/Authcontext';
import { QRCodeSVG } from 'qrcode.react'; // Correcto, usamos SVG

const TicketDetailPage = () => {
  // El 'id' que viene de la URL es el ID de la BOLETA (Ticket)
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  // --- CAMBIO: Estados para la boleta Y el evento ---
  const [ticket, setTicket] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!token || !id) {
        setIsLoading(false);
        setError("No estás autenticado.");
        return;
      }
      setIsLoading(true);
      try {
        // --- CAMBIO 1: Llamar al endpoint de BOLETAS ---
        const ticketApiUrl = `${import.meta.env.VITE_API_URL}/tickets/${id}/`;
        const ticketRes = await axios.get(ticketApiUrl, {
          headers: { Authorization: `Token ${token}` },
        });
        const ticketData = ticketRes.data;
        setTicket(ticketData);

        // --- CAMBIO 2: Usar el ID del evento de la boleta para buscar sus detalles ---
        // (El serializador de Ticket SÍ incluye 'event' como un ID)
        const eventApiUrl = `${import.meta.env.VITE_API_URL}/events/${ticketData.event_id}/`;
        const eventRes = await axios.get(eventApiUrl, {
          headers: { Authorization: `Token ${token}` },
        });
        setEvent(eventRes.data);

      } catch (err) {
        console.error("Error fetching ticket details:", err);
        setError("No se pudo cargar el detalle de la entrada.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketDetails();
  }, [id, token]);

  // --- CAMBIO: Nueva función para reenviar el email ---
  const handleResendEmail = async () => {
    if (isResending) return; // Evitar doble click
    setIsResending(true);
    setError(null);
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/tickets/${id}/resend/`;
      await axios.post(apiUrl, {}, {
        headers: { Authorization: `Token ${token}` },
      });
      alert('¡Correo de la entrada reenviado exitosamente!');
    } catch (err) {
      console.error("Error resending email:", err);
      setError('No se pudo reenviar el correo. Intenta de nuevo.');
    } finally {
      setIsResending(false);
    }
  };


  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando detalle de la entrada...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  // --- CAMBIO: Esperar a que AMBOS (ticket y event) estén cargados ---
  if (!ticket || !event) {
    return <div className="flex items-center justify-center min-h-screen">No se encontró la entrada.</div>;
  }

  // --- CAMBIO: Formateo de datos usando los objetos correctos ---
  const eventDate = new Date(event.start_datetime.replace(' ', 'T')).toLocaleDateString('es-ES', { dateStyle: 'full' });
  const locationName = event.country === 'Colombia' && event.location_details
    ? event.location_details.name
    : (event.city_text || 'Ubicación por confirmar');

  const ticketInfo = `${ticket.amount} ${ticket.amount > 1 ? 'Entradas' : 'Entrada'} - ${ticket.config_type.ticket_type.ticket_name}`;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 flex flex-col justify-center items-center">
      <main className="w-full flex flex-col items-center">
        <div className="text-center mb-6">
          {/* --- CAMBIO: Usar datos del objeto 'event' --- */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{event.event_name}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {eventDate} - {locationName}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
          <div className="mb-4 flex justify-center">
            {ticket.unique_code ? (
              // --- CAMBIO: El valor del QR es el 'unique_code' de la boleta ---
              <QRCodeSVG value={ticket.unique_code} size={256} level={"H"} includeMargin={true} />
            ) : (
              <div className="w-64 h-64 bg-gray-200 animate-pulse flex items-center justify-center text-gray-500">
                {ticket.status === 'pendiente' ? 'QR no disponible (Pago Pendiente)' : 'Generando QR...'}
              </div>
            )}
          </div>

          {/* --- CAMBIO: Eliminado el contador de 15 segundos --- */}
          <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded-md mb-6">
            ℹ️ Muestra este código QR al personal del evento para validar tu entrada.
          </p>

          <div className="text-left space-y-3">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">A nombre de:</p>
              {/* --- CAMBIO: Usar datos del objeto 'ticket.user' --- */}
              <p className="font-semibold text-gray-900 dark:text-white">{`${ticket.user.first_name} ${ticket.user.last_name}`}</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Entradas:</p>
              {/* --- CAMBIO: Usar datos dinámicos de la boleta --- */}
              <p className="font-semibold text-gray-900 dark:text-white">{ticketInfo}</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Estado:</p>
              <p className="font-semibold text-gray-900 dark:text-white">{ticket.status}</p>
            </div>
          </div>

          {/* --- CAMBIO: Nuevo botón para reenviar email --- */}
          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className="mt-6 w-full bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            {isResending ? 'Enviando...' : 'Reenviar a mi Email'}
          </button>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>¿Problemas con tu entrada? <a href="#" className="underline">Contacta a soporte</a>.</p>
        </footer>
      </main>
    </div>
  );
};

export default TicketDetailPage;