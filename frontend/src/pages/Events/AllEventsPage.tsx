import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DetailedEventCard from '../../components/ecommerce/DetailedEventCard';
import AdvancedFilters from '../../components/events/AdvancedFilters';

const AllEventsPage = () => {
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para los filtros
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    city: 'Todas',
    genre: 'Todos',
    minPrice: '',
    maxPrice: '',
  });

  const initialFilters = {
    search: '',
    dateFrom: '',
    dateTo: '',
    city: 'Todas',
    genre: 'Todos',
    minPrice: '',
    maxPrice: '',
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/events/`);
        setAllEvents(response.data);
        setFilteredEvents(response.data); // Inicialmente, mostrar todos los eventos
      } catch (err) {
        setError('No se pudieron cargar los eventos. Intente de nuevo más tarde.');
        console.error("Error fetching events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleApplyFilters = useCallback(() => {
    let events = [...allEvents];

    // Filtro por nombre
    if (filters.search) {
      events = events.filter(event => 
        event.nombre.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro por ciudad
    if (filters.city && filters.city !== 'Todas') {
      events = events.filter(event => event.ubicacion === filters.city);
    }

    // Filtro por fecha
    if (filters.dateFrom) {
      events = events.filter(event => new Date(event.fecha) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      events = events.filter(event => new Date(event.fecha) <= new Date(filters.dateTo));
    }

    // Filtro por precio
    if (filters.minPrice) {
      events = events.filter(event => event.precio >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      events = events.filter(event => event.precio <= parseFloat(filters.maxPrice));
    }

    setFilteredEvents(events);
  }, [filters, allEvents]);

  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
    setFilteredEvents(allEvents);
  }, [allEvents]);

  return (
    <div className="p-4 md:p-6 2xl:p-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Todos los Eventos</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Explora, filtra y descubre tu próxima experiencia.</p>
      </div>

      <AdvancedFilters filters={filters} setFilters={setFilters} onApply={handleApplyFilters} onClear={handleClearFilters} />

      <div className="mt-6">
        {isLoading ? (
          <p className="text-center text-lg">Cargando eventos...</p>
        ) : error ? (
          <p className="text-center text-lg text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map(event => (
              <DetailedEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllEventsPage;
