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

// --- COMPONENTE TicketCard CON LA LÓGICA CORREGIDA ---
const TicketCard = ({ event, ticket }: { event: any, ticket: any }) => {
  //console.log("DATOS RECIBIDOS EN TICKETCARD:", { 
   // id: event.event_id, 
   // image: event.image, 
    //category: event.category 
  //});
  // --- LÓGICA DE IMAGEN CORREGIDA ---
  // Aplicamos la misma lógica robusta de EventDetailPage.tsx
  let imageUrl: string | null = null;

  if (event.image && event.image.trim() !== '') {
    imageUrl = event.image;
  } else {
    // Usamos optional chaining (?.) y toLowerCase() para evitar errores
    const category = event.category?.toLowerCase(); 
    
    // Verificamos que la categoría exista en nuestro mapa de imágenes
    if (category && defaultImages[category]) {
      imageUrl = defaultImages[category];
    }
  }
  // --- FIN DE LA CORRECCIÓN ---

  // Lógica de datos de boleta
  const ticketInfo = `${ticket.amount} ${ticket.amount > 1 ? 'Entradas' : 'Entrada'} - ${ticket.type}`;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-6">
      <div className="flex flex-col sm:flex-row">

        {/* Imagen del Evento (ya corregida) */}
        <div className="w-full sm:w-1/3 h-48 sm:h-auto">
          {imageUrl ? (
            <img
              className="h-full w-full object-cover"
              src={imageUrl}
              alt={event.event} 
            />
          ) : (
            <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <p className="text-gray-500">Sin Imagen</p>
            </div>
          )}
        </div>

        {/* Información del Evento y Ticket */}
        <div className="w-full sm:w-2/3 p-4 flex flex-col">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(event.date.replace(/-/g, '/')).toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{event.event}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              📍 {event.location || event.city_text || 'Ubicación por confirmar'}
            </p>

            <p className="text-lg text-gray-800 dark:text-white mt-2 font-semibold">{ticketInfo}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {/* Los estados coinciden con el backend (models.py) */}
              Estado: <span className="font-medium">{ticket.status}</span>
            </p>
          </div>
          <div className="mt-auto pt-4">
            <Link
              to={`/my-tickets/${ticket.ticket_id}`} // <-- Usar ticket_id
              className="w-full block text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Gestionar Entrada
            </Link>
          </div>
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
  const [filter, setFilter] = useState(''); // Filtro de estado de boleta

  useEffect(() => {
    const fetchMyTickets = async () => {
      if (!token) {
        setIsLoading(false);
        setError("No estás autenticado.");
        return;
      }

      try {
        // Endpoint correcto que agrupa por evento
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

  // Lógica de filtrado (anidada)
  const filteredEventGroups = useMemo(() => {
    let groups = [...allEventGroups];

    // 1. Filtrar por nombre de Evento (búsqueda)
    if (searchTerm) {
      groups = groups.filter(group =>
        group.event.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Filtrar boletas *dentro* de cada evento por estado
    if (filter) {
      groups = groups
        .map(group => {
          const filteredTickets = group.tickets.filter((ticket: any) => ticket.status === filter);
          return { ...group, tickets: filteredTickets };
        })
        .filter(group => group.tickets.length > 0); // Eliminar eventos que quedaron vacíos
    }

    return groups;
  }, [filter, searchTerm, allEventGroups]);


  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Mis Entradas</h1>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-gray-900 dark:text-white"
          >
            {/* Valores correctos del backend */}
            <option value="">Todos los Estados</option>
            <option value="comprada">Comprada</option>
            <option value="pendiente">Pendiente de Pago</option>
            <option value="usada">Usada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Buscar evento por nombre..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Renderizado anidado */}
      <div>
        {isLoading ? (
          <div className="text-center py-12"><p className="text-gray-600 dark:text-gray-400">Cargando tus entradas...</p></div>
        ) : error ? (
          <div className="text-center py-12"><Alert variant="error" title="Error" message={error} /></div>
        ) : filteredEventGroups.length > 0 ? (
          filteredEventGroups.map(eventGroup => (
            <div key={eventGroup.event_id} className="mb-8">
              {/* Título del Evento */}
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                {eventGroup.event}
              </h2>
              {/* Mapeo de las boletas dentro del evento */}
              {eventGroup.tickets.map((ticket: any) => (
                <TicketCard key={ticket.ticket_id} event={eventGroup} ticket={ticket} />
              ))}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {allEventGroups.length === 0 ? "Aún no has comprado ninguna entrada." : "No hay entradas que coincidan con tu búsqueda."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;