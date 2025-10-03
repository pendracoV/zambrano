import React from 'react';
import { Link } from 'react-router-dom';

// Asumimos que tienes un ícono de corazón y de ubicación
import { HeartIcon, LocationMarkerIcon } from '../../icons'; // Placeholder, ajusta la ruta

// Tipos para el evento, para mayor claridad
type Event = {
  id: number | string;
  nombre: string;
  fecha: string;
  ubicacion: string;
  precio: number;
  imagen?: string;
  estado: 'En Venta' | 'Agotado' | 'Cancelado' | 'Pocas Boletas';
};

// Mapeo de estados a colores de Tailwind CSS
const statusColors: { [key: string]: string } = {
  'En Venta': 'bg-blue-500 text-white',
  'Agotado': 'bg-red-500 text-white',
  'Cancelado': 'bg-gray-500 text-white',
  'Pocas Boletas': 'bg-yellow-500 text-white',
};

// Función para formatear la fecha
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().replace('.','');
  const dayOfMonth = date.getDate();
  const month = date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().replace('.','');
  return `${day}, ${dayOfMonth} ${month}`;
};

// Función para formatear el precio
const formatPrice = (price: number) => {
  if (price === 0) return 'Gratis';
  return `Desde $${price.toLocaleString('es-CO')}`;
};

const DetailedEventCard = ({ event }: { event: Event }) => {
  const statusColor = statusColors[event.estado] || 'bg-gray-400 text-white';

  return (
    <Link to={`/events/${event.id}`} className="block border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800 h-full">
      <div className="relative">
        <img 
          src={event.imagen || '/images/carousel/carousel-02.png'} 
          alt={`Imagen de ${event.nombre}`}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded ${statusColor}`}>
          {event.estado}
        </div>
        <button className="absolute top-2 right-2 bg-white/70 p-1.5 rounded-full text-gray-700 hover:text-red-500 transition-colors">
          {/* Placeholder para el ícono de corazón */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
        </button>
      </div>
      <div className="p-4">
        <p className="font-bold text-brand-500 dark:text-brand-400">{formatDate(event.fecha)}</p>
        <h3 className="text-lg font-extrabold text-gray-800 dark:text-white mt-1 truncate" title={event.nombre}>
          {event.nombre}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center">
          {/* Placeholder para ícono de ubicación */}
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-5.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
          {event.ubicacion}
        </p>
        <p className="text-md font-semibold text-gray-700 dark:text-gray-200 mt-2">
          {formatPrice(event.precio)}
        </p>
      </div>
    </Link>
  );
};

export default DetailedEventCard;
