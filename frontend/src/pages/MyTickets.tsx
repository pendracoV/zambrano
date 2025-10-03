
// src/pages/MyTickets.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/Authcontext';

const TicketCard = ({ ticket }: { ticket: any }) => (
  <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-6">
    <div className="flex">
      <div className="w-1/3">
        <img className="h-full w-full object-cover" src={ticket.imagen_url || '/images/cards/card-01.jpg'} alt={ticket.nombre} />
      </div>
      <div className="w-2/3 p-4 flex flex-col">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(ticket.fecha).toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{ticket.nombre}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">📍 {ticket.ubicacion}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">1 Entrada - General</p>
        </div>
        <div className="mt-auto">
          <Link 
            to={`/my-tickets/${ticket.id}`}
            className="mt-4 w-full block text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Gestionar Entrada
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const MyTickets = () => {
  const { token } = useAuth();
  
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(''); // Default to all

  useEffect(() => {
    const fetchMyTickets = async () => {
      if (!token) {
        setIsLoading(false);
        setError("No estás autenticado.");
        return;
      }

      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/events/mis-eventos/`;
        
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        
        setAllTickets(response.data);
        setFilteredTickets(response.data); 
      } catch (err) {
        setError('No se pudieron cargar tus entradas. Intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTickets();
  }, [token]);

  useEffect(() => {
    let tickets = [...allTickets];

    // Apply status filter only if a filter is selected
    if (filter) {
      tickets = tickets.filter(ticket => ticket.estado === filter);
    }

    // Apply search term filter
    if (searchTerm) {
      tickets = tickets.filter(ticket =>
        ticket.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTickets(tickets);
  }, [filter, searchTerm, allTickets]);

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
            <option value="">Todos</option>
            {/* CORRECCIÓN: Usar valores con mayúscula inicial para que coincidan con la BD */}
            <option value="Confirmado">Confirmado</option>
            <option value="Planeado">Planeado</option>
            <option value="Cancelado">Cancelado</option>
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

      {/* Ticket List */}
      <div>
        {isLoading ? (
          <div className="text-center py-12"><p className="text-gray-600 dark:text-gray-400">Cargando tus entradas...</p></div>
        ) : error ? (
          <div className="text-center py-12"><p className="text-red-500">{error}</p></div>
        ) : filteredTickets.length > 0 ? (
          filteredTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No tienes entradas que coincidan con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
