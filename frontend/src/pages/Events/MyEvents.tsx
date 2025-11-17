import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/Authcontext';
import Alert from '../../components/ui/alert/Alert';

// --- (El componente StatusBadge no cambia) ---
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: { [key: string]: string } = {
    programado: 'bg-gray-200 text-gray-800',
    activo: 'bg-green-200 text-green-800',
    cancelado: 'bg-red-200 text-red-800',
    finalizado: 'bg-blue-200 text-blue-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status.toLowerCase()] || 'bg-gray-200 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// --- (El componente EventRow no cambia) ---
const EventRow = ({ event, token }: { event: any, token: string | null }) => {
  const [sold, setSold] = useState<number | null>(null);
  const [loadingSold, setLoadingSold] = useState(true);

  useEffect(() => {
    if (!token || !event.id) return;
    const fetchAvailability = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${event.id}/availability/`, {
          headers: { 'Authorization': `Token ${token}` },
        });
        if (!response.ok) {
          throw new Error('Could not fetch availability');
        }
        const availabilityData = await response.json();
        const totalSold = availabilityData.reduce((sum: number, ticketType: any) => sum + ticketType.capacity_sold, 0);
        setSold(totalSold);
      } catch (error) {
        console.error(`Error fetching availability for event ${event.id}:`, error);
        setSold(0);
      } finally {
        setLoadingSold(false);
      }
    };
    fetchAvailability();
  }, [event.id, token]);

  const totalCapacity = event.max_capacity || 0;
  const progress = totalCapacity > 0 && sold !== null ? (sold / totalCapacity) * 100 : 0;

  return (
    <tr className="bg-white border-b hover:bg-gray-50">
      <td className="px-6 py-4 font-medium text-gray-900">{event.event_name}</td>
      <td className="px-6 py-4">
        <StatusBadge status={event.status} />
      </td>
      <td className="px-6 py-4">{new Date(event.start_datetime).toLocaleDateString('es-CO')}</td>
      <td className="px-6 py-4">
        {loadingSold ? (
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        ) : (
          <div>
            <span>{sold?.toLocaleString('es-CO') ?? 'N/A'} / {totalCapacity.toLocaleString('es-CO')}</span>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-right space-x-2">
        <Link to={`/organizer/events/${event.id}/manage`} className="font-medium text-indigo-600 hover:text-indigo-800">Gestionar</Link>
        <Link to={`/organizer/events/${event.id}/edit`} className="font-medium text-gray-600 hover:text-gray-800">Editar</Link>
        <Link to={`/events/${event.id}`} target="_blank" className="inline-block text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        </Link>
      </td>
    </tr>
  );
};

// --- (El componente TableSkeleton no cambia) ---
const TableSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);


// --- CAMBIOS EN EL COMPONENTE PRINCIPAL ---
const MyEvents = () => {
  // --- CAMBIO: Obtener 'user' del hook de autenticación ---
  // (Asegúrate de que tu AuthContext provea el objeto 'user')
  const { token, user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log("Datos del usuario en AuthContext:", user);

  // --- CAMBIO: Determinar si es Admin ---
  // Asumo que tu objeto 'user' tiene 'is_staff' (común en Django)
  // o 'is_admin'. Ajusta esto según la estructura de tu objeto 'user'.
  const isAdmin = user?.is_superuser;

  // --- CAMBIO: Título dinámico de la página ---
  const pageTitle = isAdmin ? 'Gestión de Eventos' : 'Mis Eventos';

  useEffect(() => {
    // --- CAMBIO: Esperar a que 'user' también cargue ---
    if (!token || !user) {
      setLoading(false);
      setError("Autenticación requerida.");
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);

      
      let apiUrl = '';
      if (isAdmin) {
        
        apiUrl = `${import.meta.env.VITE_API_URL}/events/`;
      } else {
       
        apiUrl = `${import.meta.env.VITE_API_URL}/organizer/my-events/`;
      }

      try {
        const response = await fetch(apiUrl, {
          headers: { 'Authorization': `Token ${token}` },
        });
        if (!response.ok) {
          throw new Error('No se pudieron cargar los eventos.');
        }
        const data = await response.json();
        setEvents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [token, user, isAdmin]); 

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          {/* --- CAMBIO: Título dinámico --- */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{pageTitle}</h1>
          <div className="h-10 bg-gray-300 rounded w-48"></div>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert variant="error" title="Error" message={error} />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-6 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {/* --- CAMBIO: Mensaje dinámico --- */}
            {isAdmin ? 'No hay eventos en la plataforma' : 'Aún no has creado ningún evento.'}
          </h2>
          <p className="text-gray-500 mb-6">
            {isAdmin ? 'Crea el primer evento para empezar.' : '¡Es hora de empezar! Crea tu primer evento y empieza a vender boletas.'}
          </p>
          <Link
            to="/create-event"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            {isAdmin ? 'Crear Evento' : '¡Crea tu primer evento ahora!'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        {/* --- CAMBIO: Título dinámico --- */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{pageTitle}</h1>
        <Link
          to="/create-event"
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <span className="mr-2">+</span> Crear Nuevo Evento
        </Link>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Nombre del Evento</th>
              <th scope="col" className="px-6 py-3">Estado</th>
              <th scope="col" className="px-6 py-3">Fecha</th>
              <th scope="col" className="px-6 py-3">Vendidos/Aforo</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <EventRow key={event.id} event={event} token={token} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyEvents;