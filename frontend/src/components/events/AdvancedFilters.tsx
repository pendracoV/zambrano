import React, { useState, useEffect } from 'react';
import Input from '../form/input/InputField';
import Button from '../ui/button/Button';

// El componente ahora recibe props para ser controlado
const AdvancedFilters = ({ filters, setFilters, onApply, onClear }: any) => {
  // --- AÑADIR ESTE ESTADO ---
  const [cities, setCities] = useState<any[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  // --- AÑADIR ESTE USEEFFECT ---
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/cities/`);
        if (!response.ok) throw new Error('No se pudieron cargar las ciudades');
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, []); // Se ejecuta solo una vez al montar el componente

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFilters((prevFilters: any) => ({ ...prevFilters, [id]: value }));
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">

        <div className="col-span-1 sm:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar por nombre</label>
          <Input id="search" type="text" placeholder="Nombre del evento o artista..." value={filters.search} onChange={handleInputChange} />
        </div>

        <div>
          <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desde</label>
          <Input id="dateFrom" type="date" value={filters.dateFrom} onChange={handleInputChange} />
        </div>
        <div>
          <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hasta</label>
          <Input id="dateTo" type="date" value={filters.dateTo} onChange={handleInputChange} />
        </div>

        {/* --- MODIFICAR ESTE DIV --- */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ciudad</label>
          <select
            id="city"
            value={filters.city}
            onChange={handleInputChange}
            disabled={loadingCities} // Deshabilitado mientras carga
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="Todas">Todas</option>
            {/* Opciones dinámicas cargadas desde la API */}
            {cities.map((city: any) => (
              <option key={city.id} value={city.id.toString()}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        {/* --- FIN DE LA MODIFICACIÓN --- */}

        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Género</label>
          <select id="genre" value={filters.genre} onChange={handleInputChange} className="...">
            <option value="Todos">Todos</option>
            <option value="musica">Música</option>
            <option value="deporte">Deporte</option>
            <option value="educacion">Educación</option>
            <option value="tecnologia">Tecnología</option>
            <option value="arte">Arte</option>
            <option value="otros">Otros</option>
          </select>
        </div>

        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio Mín.</label>
          <Input id="minPrice" type="number" placeholder="0" value={filters.minPrice} onChange={handleInputChange} />
        </div>
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio Máx.</label>
          <Input id="maxPrice" type="number" placeholder="500000" value={filters.maxPrice} onChange={handleInputChange} />
        </div>

        <div className="col-span-1 sm:col-span-full xl:col-span-2 flex items-end gap-2">
          <Button type="button" onClick={onApply} className="w-full">
            Aplicar Filtros
          </Button>
          <Button type="button" onClick={onClear} className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
            Limpiar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
