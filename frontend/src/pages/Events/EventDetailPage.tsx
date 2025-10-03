import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CalenderIcon } from '../../icons'; // Asumiendo que CalenderIcon existe

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/events/${id}/`);
        setEvent(response.data);
      } catch (err) {
        setError('No se pudo cargar la información del evento.');
        console.error(`Error fetching event ${id}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (isLoading) {
    return <div className="p-10 text-center">Cargando evento...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>;
  }

  if (!event) {
    return <div className="p-10 text-center">Evento no encontrado.</div>;
  }

  // --- Lógica del Panel de Compra ---
  const subtotal = quantity * event.precio;
  const handleCheckout = () => {
    console.log({
      eventId: event.id,
      eventName: event.nombre,
      quantity,
      subtotal,
    });
    // Aquí iría la lógica para navegar al proceso de pago
  };
  // --------------------------------

  // Formateo de datos para la UI
  const eventDate = new Date(event.fecha).toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const eventTime = new Date(event.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        
        {/* Columna Izquierda: Información del Evento */}
        <div className="lg:col-span-2">
          {/* Banner Principal */}
          <div className="mb-6">
            <img 
              src={event.imagen || '/images/carousel/carousel-03.png'} 
              alt={`Banner de ${event.nombre}`}
              className="w-full h-auto max-h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Encabezado del Evento */}
          <div className="mb-6">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">{event.nombre}</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{event.descripcion.substring(0, 100)}...</p>
          </div>

          {/* Información Clave */}
          <div className="flex flex-wrap gap-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 mb-8">
            <div className="flex items-center gap-3">
              <CalenderIcon className="w-6 h-6 text-brand-500" />
              <div>
                <p className="font-semibold">{eventDate}</p>
                <p className="text-sm text-gray-500">{eventTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               {/* Placeholder para ícono de ubicación */}
              <svg className="w-6 h-6 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-5.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
              <div>
                <p className="font-semibold">{event.ubicacion}</p>
                <p className="text-sm text-gray-500">{event.ciudad || 'Ciudad'}</p> {/* Asumiendo que hay un campo ciudad */}
              </div>
            </div>
             {/* Placeholder para restricción de edad */}
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
              <div>
                <p className="font-semibold">{event.restriccion_edad || 'Mayores de 18'}</p>
                <p className="text-sm text-gray-500">Restricción de edad</p>
              </div>
            </div>
          </div>

          {/* Sección Sobre el Evento */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Acerca de este evento</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{event.descripcion}</p>
          </div>

          {/* Sección Ubicación */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Ubicación</h2>
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-2">
              <p>Placeholder para el mapa interactivo</p>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{event.ubicacion}</p>
          </div>
        </div>

        {/* Columna Derecha: Panel de Compra */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Boletas</h2>
              
              {/* Selector de Boletas */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">Entrada General</p>
                  <p className="text-xl font-bold text-brand-500">{`${event.precio.toLocaleString('es-CO')}`}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    -
                  </button>
                  <span className="font-bold text-xl w-8 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)} // Aquí se podría añadir un límite según el aforo
                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <hr className="my-6 border-gray-200 dark:border-gray-700" />

              {/* Resumen del Pedido */}
              <div className="space-y-2">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{`${subtotal.toLocaleString('es-CO')}`}</span>
                </div>
              </div>

              <button onClick={handleCheckout} className="mt-6 w-full bg-brand-500 text-white py-3 rounded-lg font-semibold hover:bg-brand-600 transition-colors text-lg">
                Conseguir Boletas
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

};

export default EventDetailPage;
