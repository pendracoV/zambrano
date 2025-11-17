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
        setFilteredEvents(response.data);
      } catch (err) {
        setError('No se pudieron cargar los eventos. Intente de nuevo más tarde.');
        console.error("Error fetching events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getCleanPrice = (priceStr: string | number): number => {
    if (!priceStr) return NaN;
    const cleaned = priceStr.toString().replace(/[\.,\s]/g, '');
    return parseFloat(cleaned);
  };

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

    if (filters.search) {
      events = events.filter(event =>
        event.event_name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.city && filters.city !== 'Todas') {
      events = events.filter(event => {
        return event.location == filters.city;
      });
    }

    if (filters.genre && filters.genre !== 'Todos') {
      events = events.filter(event => event.category === filters.genre);
    }

    if (filters.dateFrom) {
      events = events.filter(event => new Date(event.start_datetime) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      events = events.filter(event => new Date(event.start_datetime) <= new Date(filters.dateTo));
    }

    events = events.filter(event => {
      const lowestPrice = getLowestPrice(event);
      if (lowestPrice === null) return false;

      if (!isNaN(minPrice) && lowestPrice < minPrice) {
        return false;
      }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 2xl:p-10">
        
        {/* Header Section Mejorado */}
        <div className="mb-8 lg:mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-10 bg-brand-500 rounded-full"></div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                Todos los Eventos
              </h1>
              <p className="mt-1 text-base sm:text-lg text-gray-600 dark:text-gray-400">
                Explora, filtra y descubre tu próxima experiencia
              </p>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <svg className="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {(filters.search || filters.city !== 'Todas' || filters.genre !== 'Todos' || filters.dateFrom || filters.dateTo || filters.minPrice || filters.maxPrice) && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800">
                <svg className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-brand-700 dark:text-brand-300">
                  Filtros activos
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <AdvancedFilters 
            filters={filters} 
            setFilters={setFilters} 
            onApply={handleApplyFilters} 
            onClear={handleClearFilters} 
          />
        </div>

        {/* Content Section */}
        <div className="mt-6">
          {isLoading ? (
            // Loading State Mejorado
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="mt-6 text-lg font-medium text-gray-600 dark:text-gray-400">
                Cargando eventos...
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                Esto solo tomará un momento
              </p>
            </div>
          ) : error ? (
            // Error State Mejorado
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400 text-center mb-2">
                {error}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            // Empty State Mejorado
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                No se encontraron eventos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
                Intenta ajustar los filtros o borrar algunos criterios de búsqueda para ver más resultados
              </p>
              <button 
                onClick={handleClearFilters}
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Limpiar filtros
              </button>
            </div>
          ) : (
            // Events Grid Mejorado
            <>
              {/* Sorting/View Options (Opcional - puedes comentar si no lo necesitas) */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando <span className="font-semibold text-gray-900 dark:text-white">{filteredEvents.length}</span> resultado{filteredEvents.length !== 1 ? 's' : ''}
                </p>
                
                {/* Sorting Dropdown (placeholder - puedes implementar la lógica) */}
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ordenar:
                  </label>
                  <select 
                    id="sort"
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  >
                    <option value="date">Fecha</option>
                    <option value="price-asc">Precio: Menor a Mayor</option>
                    <option value="price-desc">Precio: Mayor a Menor</option>
                    <option value="name">Nombre</option>
                  </select>
                </div>
              </div>

              {/* Grid de Eventos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                {filteredEvents.map(event => (
                  <DetailedEventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Pagination Placeholder (opcional) */}
              {filteredEvents.length > 12 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Anterior
                  </button>
                  <div className="flex items-center gap-1">
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-brand-500 text-white font-medium text-sm">
                      1
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-sm transition-colors">
                      2
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-sm transition-colors">
                      3
                    </button>
                  </div>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllEventsPage;