import React from 'react';
import { Link } from 'react-router-dom';
// import { HeartIcon, LocationMarkerIcon } from '../../icons'; // Ajusta esto

// --- DEFINICIÓN DE TIPO CORREGIDA ---
type Event = {
  id: number | string;
  event_name: string; // Corregido
  start_datetime: string; // Corregido
  city: string; // Corregido
  department: string; // Añadido
  types_of_tickets_available: { price: string }[]; // Corregido
  image?: string; // Corregido
  status: 'programado' | 'activo' | 'cancelado' | 'finalizado'; // Corregido
};

// --- MAPEO DE ESTADO CORREGIDO ---
// Mapeo de estados del backend a texto visible
const statusDisplay: { [key: string]: string } = {
  programado: 'Programado',
  activo: 'En Venta',
  cancelado: 'Cancelado',
  finalizado: 'Finalizado',
};

// Mapeo de estados del backend a colores
const statusColors: { [key: string]: string } = {
  programado: 'bg-blue-500 text-white',
  activo: 'bg-green-500 text-white', // 'En Venta'
  cancelado: 'bg-gray-500 text-white',
  finalizado: 'bg-red-600 text-white', // 'Finalizado'
};

// --- FUNCIONES DE FORMATO (ACTUALIZADAS) ---

// Helper para limpiar el precio
const getCleanPrice = (priceStr: string | number): number => {
  if (!priceStr) return NaN;
  const cleaned = priceStr.toString().replace(/[\.,\s]/g, ''); 
  return parseFloat(cleaned);
};

// Helper para encontrar el precio más bajo
const getLowestPrice = (event: Event): number | null => {
  if (!event.types_of_tickets_available || event.types_of_tickets_available.length === 0) {
    return null;
  }
  const prices = event.types_of_tickets_available.map(ticket_type => 
    getCleanPrice(ticket_type.price)
  );
  const validPrices = prices.filter(p => !isNaN(p));
  return validPrices.length > 0 ? Math.min(...validPrices) : null;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().replace('.','');
  const dayOfMonth = date.getDate();
  const month = date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().replace('.','');
  return `${day}, ${dayOfMonth} ${month}`;
};

const formatPrice = (price: number | null) => {
  if (price === null) return 'No disponible'; // Caso si no hay precios
  if (price === 0) return 'Gratis';
  return `Desde $${price.toLocaleString('es-CO')}`;
};

// --- COMPONENTE (ACTUALIZADO) ---

const DetailedEventCard = ({ event }: { event: Event }) => {
  // Usamos el 'status' del backend para encontrar el texto y color
  const displayStatus = statusDisplay[event.status] || 'Desconocido';
  const statusColor = statusColors[event.status] || 'bg-gray-400 text-white';

  // Calculamos el precio más bajo
  const lowestPrice = getLowestPrice(event);

  return (
    <Link to={`/events/${event.id}`} className="block border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800 h-full">
      <div className="relative">
        <img 
          // CAMBIO: 'imagen' -> 'image'. Mantenemos el fallback
          src={event.image} 
          alt={`Imagen de ${event.event_name}`} // CAMBIO: 'nombre' -> 'event_name'
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded ${statusColor}`}>
          {displayStatus} {/* Usamos el estado del backend mapeado */}
        </div>
        <button className="absolute top-2 right-2 bg-white/70 p-1.5 rounded-full text-gray-700 hover:text-red-500 transition-colors">
          {/* Icono de Corazón */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
        </button>
      </div>
      <div className="p-4">
        {/* CAMBIO: 'fecha' -> 'start_datetime' */}
        <p className="font-bold text-brand-500 dark:text-brand-400">{formatDate(event.start_datetime)}</p>
        <h3 className="text-lg font-extrabold text-gray-800 dark:text-white mt-1 truncate" title={event.event_name}>
          {/* CAMBIO: 'nombre' -> 'event_name' */}
          {event.event_name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
          {/* Icono de Ubicación */}
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-5.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
          {/* CAMBIO: 'ubicacion' -> 'city' y 'department' */}
          {event.city}, {event.department}
        </p>
        <p className="text-md font-semibold text-gray-700 dark:text-gray-200 mt-2">
          {/* CAMBIO: 'precio' -> 'lowestPrice' */}
          {formatPrice(lowestPrice)}
        </p>
      </div>
    </Link>
  );
};

export default DetailedEventCard;