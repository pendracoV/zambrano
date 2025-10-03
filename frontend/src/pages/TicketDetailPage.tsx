// src/pages/TicketDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/Authcontext';
// CORRECCIÓN: Importar QRCodeSVG en lugar de QRCode
import { QRCodeSVG } from 'qrcode.react';

const TicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrValue, setQrValue] = useState('');
  const [countdown, setCountdown] = useState(15);

  const generateQrValue = () => {
    if (!event || !user) return '';
    const timestamp = Date.now();
    return JSON.stringify({ eventId: event.id, userId: user.id, timestamp });
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!token) {
        setIsLoading(false);
        setError("No estás autenticado.");
        return;
      }
      try {
        // CORRECCIÓN: Usar el endpoint correcto para detalles del evento
        const apiUrl = `${import.meta.env.VITE_API_URL}/events/${id}/`;
        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Token ${token}` },
        });
        setEvent(response.data);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("No se pudo cargar el detalle de la entrada.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, token]);

  useEffect(() => {
    if (event) {
      setQrValue(generateQrValue());

      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            setQrValue(generateQrValue());
            return 15;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [event, user]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando detalle de la entrada...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  if (!event) {
    return <div className="flex items-center justify-center min-h-screen">No se encontró la entrada.</div>;
  }

  return (
    // Centrar todo el contenido en la página
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 flex flex-col justify-center items-center">
      <main className="w-full flex flex-col items-center">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{event.nombre}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date(event.fecha).toLocaleDateString('es-ES', { dateStyle: 'full' })} - {event.ubicacion}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
          {/* MEJORA: Contenedor para centrar el QR */}
          <div className="mb-4 flex justify-center">
            {qrValue ? (
              // CORRECCIÓN: Usar el componente QRCodeSVG
              <QRCodeSVG value={qrValue} size={256} level={"H"} includeMargin={true} />
            ) : (
              <div className="w-64 h-64 bg-gray-200 animate-pulse"></div>
            )}
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Se actualiza en {countdown} segundos
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded-md mb-6">
            ℹ️ Tu código QR se actualiza constantemente para mantener tu entrada segura y prevenir el fraude.
          </p>

          <div className="text-left space-y-3">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">A nombre de:</p>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.username || '-'}</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Entradas:</p>
              <p className="font-semibold text-gray-900 dark:text-white">1 Entrada - General</p>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>¿Problemas con tu entrada? <a href="#" className="underline">Contacta a soporte</a>.</p>
        </footer>
      </main>
    </div>
  );
};

export default TicketDetailPage;