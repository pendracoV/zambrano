import React from 'react';

const EventCard = ({ event }: any) => {
  // Find the lowest price from the tickets array
const prices = event.types_of_tickets_available 
  ? event.types_of_tickets_available.map((ticket_type: any) => parseFloat(ticket_type.price)) 
  : [];
    const lowestPrice = prices.length > 0 ? Math.min(...prices.filter(p => !isNaN(p))) : null;
console.log("Datos del evento:", event.event_name, "URL Imagen:", event.image);
  return (
    <div className="border rounded-lg p-4 shadow-lg flex flex-col h-full">
      {/* Usamos 'event.image' y un fallback por si no viene la imagen */}
      <img src={event.image || '/images/carousel/carousel-01.png'} alt={event.event_name} className="w-full h-48 object-cover rounded-t-lg" />
      <div className="p-4 flex flex-col flex-grow">
        {/* Usamos 'event.date' para la fecha */}
        <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
        {/* Usamos 'event.event_name' para el nombre */}
        <h3 className="text-xl font-bold mt-2 flex-grow">{event.event_name}</h3>
        {/* Combinamos ciudad y departamento para la ubicación */}
        <p className="text-gray-600 mt-1">{`${event.city}, ${event.department}`}</p>
        
        {/* Muestra el precio más bajo si está disponible */}
        {lowestPrice !== null && (
          <p className="text-lg font-semibold text-blue-600 mt-2">{`Desde $${lowestPrice}`}</p>
        )}
        
        <button className="mt-auto w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Ver Detalles
        </button>
      </div>
    </div>
  );
};

export default EventCard;
