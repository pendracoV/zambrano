import React from 'react';

const EventCard = ({ event }: any) => (
  <div className="border rounded-lg p-4 shadow-lg flex flex-col h-full">
    {/* Usamos 'event.imagen' y un fallback por si no viene la imagen */}
    <img src={event.imagen || '/images/carousel/carousel-01.png'} alt={event.nombre} className="w-full h-48 object-cover rounded-t-lg" />
    <div className="p-4 flex flex-col flex-grow">
      {/* Usamos 'event.fecha' para la fecha */}
      <p className="text-sm text-gray-500">{new Date(event.fecha).toLocaleDateString()}</p>
      {/* Usamos 'event.nombre' para el nombre */}
      <h3 className="text-xl font-bold mt-2 flex-grow">{event.nombre}</h3>
      {/* Asumimos 'event.ubicacion' para la ubicación */}
      <p className="text-gray-600 mt-1">{event.ubicacion}</p>
      {/* Asumimos 'event.precio' para el precio */}
      <p className="text-lg font-semibold mt-2">{event.precio == 0 ? 'Gratis' : `$${event.precio}`}</p>
      <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Ver Detalles
      </button>
    </div>
  </div>
);

export default EventCard;
