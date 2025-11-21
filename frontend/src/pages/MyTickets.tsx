import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/Authcontext';
import Alert from '../components/ui/alert/Alert';
import defaultEventImage from '/public/images/1.jpg';

const defaultImages: { [key: string]: string } = {
  musica: defaultEventImage,
  deporte: defaultEventImage,
  arte: defaultEventImage,
  tecnologia: defaultEventImage,
  educacion: defaultEventImage,
  otros: defaultEventImage,
};

// --- HELPER: Status Badge Colors ---
const getStatusStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case 'comprada':
    case 'pagado':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
    case 'usada':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
    case 'cancelada':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
  }
};

// --- COMPONENTE TicketCard REDISEÑADO ---
const TicketCard = ({ event, ticket }: { event: any, ticket: any }) => {
  // --- LÓGICA DE IMAGEN ---
  let imageUrl: string | null = null;
  if (event.image && event.image.trim() !== '') {
    imageUrl = event.image;
  } else {
    const category = event.category?.toLowerCase();
    if (category && defaultImages[category]) {
      imageUrl = defaultImages[category];
    }
  }

  const ticketInfo = `${ticket.amount} ${ticket.amount > 1 ? 'Entradas' : 'Entrada'} • ${ticket.type}`;
  const eventDate = new Date(event.date.replace(/-/g, '/'));
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ease-out overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full">

      {/* Imagen del Evento */}
      <div className="relative h-48 w-full overflow-hidden">
        {imageUrl ? (
          <img
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            src={imageUrl}
            alt={event.event}
          />
        ) : (
          <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-4xl">🎟️</span>
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        {/* Badge de Fecha (Flotante) */}
        <div className="absolute top-3 left-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg p-2 text-center shadow-lg min-w-[50px]">
          <span className="block text-xs font-bold text-red-500 uppercase tracking-wider">{month}</span>
          <span className="block text-xl font-extrabold text-gray-900 dark:text-white leading-none">{day}</span>
        </div>

        {/* Badge de Estado (Pill) */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${getStatusStyles(ticket.status)}`}>
          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
        </div>
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {event.event}
          </h3>
          <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.location || event.city_text || 'Ubicación por confirmar'}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {ticketInfo}
            </span>
          </div>

          <Link
            to={`/my-tickets/${ticket.ticket_id}`}
            className="block w-full text-center bg-gray-900 hover:bg-blue-600 dark:bg-white dark:text-gray-900 dark:hover:bg-blue-400 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors duration-300 shadow-md hover:shadow-lg transform active:scale-95"
          >
            Ver Entrada
          </Link>
        </div>
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL MyTickets ---
const MyTickets = () => {
  const { token } = useAuth();

  const [allEventGroups, setAllEventGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchMyTickets = async () => {
      if (!token) {
        setIsLoading(false);
        setError("No estás autenticado.");
        return;
      }

      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/events/my-events/`;
        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Token ${token}` },
        });
        setAllEventGroups(response.data);
      } catch (err) {
        setError('No se pudieron cargar tus entradas. Intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTickets();
  }, [token]);

  const filteredTickets = useMemo(() => {
    let tickets: any[] = [];

    // Aplanar la estructura: Extraer todos los tickets de todos los grupos y adjuntarles la info del evento
    allEventGroups.forEach(group => {
      group.tickets.forEach((ticket: any) => {
        tickets.push({
          ...ticket,
          eventData: { // Guardamos la info del evento dentro del ticket para usarla en la card
            event: group.event,
            event_id: group.event_id,
            date: group.date,
            location: group.location,
            city_text: group.city_text,
            image: group.image,
            category: group.category
          }
        });
      });
    });

    // 1. Filtrar por nombre de Evento
    if (searchTerm) {
      tickets = tickets.filter(t =>
        t.eventData.event.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Filtrar por estado
    if (filter) {
      tickets = tickets.filter(t => t.status === filter);
    }

    return tickets;
  }, [filter, searchTerm, allEventGroups]);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 space-y-4 md:space-y-0 border-b border-gray-200 dark:border-gray-700 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Mis Entradas
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Gestiona tus próximos eventos y experiencias.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="appearance-none w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm cursor-pointer"
              >
                <option value="">Todos los Estados</option>
                <option value="comprada">Comprada</option>
                <option value="pendiente">Pendiente</option>
                <option value="usada">Usada</option>
                <option value="cancelada">Cancelada</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                type="text"
                placeholder="Buscar evento..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white py-2.5 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <Alert variant="error" title="Error" message={error} />
        ) : filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTickets.map((ticket: any) => (
              <TicketCard
                key={ticket.ticket_id}
                event={ticket.eventData}
                ticket={ticket}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
            <div className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No se encontraron entradas</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {allEventGroups.length === 0
                ? "Aún no has comprado entradas para ningún evento."
                : "Intenta ajustar tus filtros de búsqueda."}
            </p>
            {allEventGroups.length === 0 && (
              <div className="mt-6">
                <Link to="/events" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Explorar Eventos
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;