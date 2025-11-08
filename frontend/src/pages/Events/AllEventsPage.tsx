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

// Helper para limpiar y obtener el precio (deberías moverlo a un archivo de utils)
  const getCleanPrice = (priceStr: string | number): number => {
    if (!priceStr) return NaN;
    const cleaned = priceStr.toString().replace(/[\.,\s]/g, ''); 
    return parseFloat(cleaned);
  };

  // Helper para encontrar el precio más bajo de un evento
  const getLowestPrice = (event: any): number | null => {
    if (!event.types_of_tickets_available || event.types_of_tickets_available.length === 0) {
      return null;
    }
    const prices = event.types_of_tickets_available.map((ticket_type: any) => 
      getCleanPrice(ticket_type.price)
    );
    const validPrices = prices.filter((p: number) => !isNaN(p));
    return validPrices.length > 0 ? Math.min(...validPrices) : null;
  };

const handleApplyFilters = useCallback(() => {
    let events = [...allEvents];
    const minPrice = parseFloat(filters.minPrice);
    const maxPrice = parseFloat(filters.maxPrice);

    // Filtro por nombre
    if (filters.search) {
      events = events.filter(event => 
        event.event_name.toLowerCase().includes(filters.search.toLowerCase()) // CAMBIO: 'nombre' -> 'event_name'
      );
    }

    // Filtro por ciudad
    if (filters.city && filters.city !== 'Todas') {
      events = events.filter(event => event.city === filters.city); // CAMBIO: 'ubicacion' -> 'city'
    }

    // Filtro por Género (Categoría)
    if (filters.genre && filters.genre !== 'Todos') {
      events = events.filter(event => event.category === filters.genre); // CAMBIO: Nuevo filtro para 'category'
    }

    // Filtro por fecha
    if (filters.dateFrom) {
      // Comparamos la fecha de inicio del evento
      events = events.filter(event => new Date(event.start_datetime) >= new Date(filters.dateFrom)); // CAMBIO: 'fecha' -> 'start_datetime'
    }
    if (filters.dateTo) {
      // Comparamos la fecha de inicio del evento
      events = events.filter(event => new Date(event.start_datetime) <= new Date(filters.dateTo)); // CAMBIO: 'fecha' -> 'start_datetime'
    }

    // Filtro por precio
    events = events.filter(event => {
      const lowestPrice = getLowestPrice(event);
      if (lowestPrice === null) return false; // O true, si quieres mostrar eventos sin precio

      // Chequeo de Precio Mínimo
      if (!isNaN(minPrice) && lowestPrice < minPrice) {
        return false;
      }
      // Chequeo de Precio Máximo
      if (!isNaN(maxPrice) && lowestPrice > maxPrice) {
        return false;
      }
      return true;
    });

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
