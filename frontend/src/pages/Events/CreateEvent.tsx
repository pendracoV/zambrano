// src/pages/CreateEvent.tsx
import React, { useState, useEffect } from 'react';
import Alert from '../../components/ui/alert/Alert';
import { useAuth } from '../../context/Authcontext';

const CreateEvent = () => {
  const { token } = useAuth();

  const [formData, setFormData] = useState<any>({
    event_name: '',
    description: '',
    organizer: '',
    category: '',
    image: null,
    date: '',
    start_datetime: '',
    end_datetime: '',
    country: 'Colombia',
    status: 'programado',
    location: '',
    city_text: '',
    department_text: '',
    min_age: '',
    max_capacity: '',
    sales_open_datetime: '',
  });

  const [departments, setDepartments] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [filteredCities, setFilteredCities] = useState<any[]>([]);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [configuredTickets, setConfiguredTickets] = useState<any[]>([]);
  const [currentTicket, setCurrentTicket] = useState({
    ticket_type_id: '',
    price: '',
    maximun_capacity: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventTotalCapacity = parseInt(formData.max_capacity, 10) || 0;
  const currentConfiguredCapacity = configuredTickets.reduce((total, ticket) => total + ticket.maximun_capacity, 0);
  const remainingCapacity = eventTotalCapacity - currentConfiguredCapacity;

  useEffect(() => {
    if (!token) return;

    const fetchAllData = async () => {
      try {
        const headers = { 'Authorization': `Token ${token}` };
        const apiUrlBase = import.meta.env.VITE_API_URL;

        const [ticketsRes, departmentsRes, citiesRes] = await Promise.all([
          fetch(`${apiUrlBase}/ticket-types/`, { headers }),
          fetch(`${apiUrlBase}/departments/`, { headers }),
          fetch(`${apiUrlBase}/cities/`, { headers }),
        ]);

        if (!ticketsRes.ok) throw new Error('No se pudieron cargar los tipos de boleta');
        if (!departmentsRes.ok) throw new Error('No se pudieron cargar los departamentos');
        if (!citiesRes.ok) throw new Error('No se pudieron cargar las ciudades');

        const ticketsData = await ticketsRes.json();
        const departmentsData = await departmentsRes.json();
        const citiesData = await citiesRes.json();

        setTicketTypes(ticketsData);
        setDepartments(departmentsData);
        setCities(citiesData);

        if (departmentsData.length > 0) {
          const defaultDept = departmentsData.find((d: any) => d.id === 2) || departmentsData[0];
          setFilteredCities(citiesData.filter((c: any) => c.department.id === defaultDept.id));
        }

      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Error al cargar catálogos');
      }
    };

    fetchAllData();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));

    if (name === 'department_filter') {
      const deptId = parseInt(value, 10);
      setFilteredCities(cities.filter((c: any) => c.department.id === deptId));
      setFormData((prev: any) => ({ ...prev, location: '' }));
    }

    if (name === 'country') {
      setFormData((prev: any) => ({
        ...prev,
        location: '',
        city_text: '',
        department_text: '',
        country: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev: any) => ({ ...prev, image: e.target.files[0] }));
    }
  };

  const handleTicketChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentTicket(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTicket = () => {
    if (!currentTicket.ticket_type_id || !currentTicket.price || !currentTicket.maximun_capacity) {
      setError('Por favor complete todos los campos de la boleta.');
      return;
    }

    const exists = configuredTickets.find(
      t => t.ticket_type_id === parseInt(currentTicket.ticket_type_id, 10)
    );
    if (exists) {
      setError('Ese tipo de boleta ya ha sido añadido.');
      return;
    }

    const eventTotalCapacity = parseInt(formData.max_capacity, 10);

    if (eventTotalCapacity > 0) {
      const currentConfiguredCapacity = configuredTickets.reduce(
        (total, ticket) => total + ticket.maximun_capacity,
        0
      );

      const newTicketCapacity = parseInt(currentTicket.maximun_capacity, 10);

      if ((currentConfiguredCapacity + newTicketCapacity) > eventTotalCapacity) {
        setError(
          `Error: El aforo total del evento es ${eventTotalCapacity}. ` +
          `Ya hay ${currentConfiguredCapacity} boletas configuradas. ` +
          `Añadir ${newTicketCapacity} más superaría el límite.`
        );
        return;
      }
    }

    const newTicket = {
      ticket_type_id: parseInt(currentTicket.ticket_type_id, 10),
      price: parseFloat(currentTicket.price),
      maximun_capacity: parseInt(currentTicket.maximun_capacity, 10)
    };

    setConfiguredTickets(prev => [...prev, newTicket]);
    setCurrentTicket({ ticket_type_id: '', price: '', maximun_capacity: '' });
    setError(null);
  };

  const handleRemoveTicket = (index: number) => {
    setConfiguredTickets(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('No estás autenticado.');
      return;
    }
    if (configuredTickets.length === 0) {
      setError("Debes configurar al menos un tipo de boleta.");
      return;
    }

    setLoading(true);
    setError(null);

    const finalFormData = new FormData();

    finalFormData.append('event_name', formData.event_name);
    finalFormData.append('description', formData.description);
    finalFormData.append('organizer', formData.organizer);
    finalFormData.append('category', formData.category);
    finalFormData.append('date', formData.date);
    finalFormData.append('start_datetime', formData.start_datetime);
    finalFormData.append('end_datetime', formData.end_datetime);
    finalFormData.append('country', formData.country);
    finalFormData.append('status', formData.status);

    if (formData.min_age) {
      finalFormData.append('min_age', formData.min_age);
    }
    if (formData.max_capacity) {
      finalFormData.append('max_capacity', formData.max_capacity);
    }
    if (formData.sales_open_datetime) {
      finalFormData.append('sales_open_datetime', formData.sales_open_datetime);
    }

    if (formData.country === 'Colombia') {
      if (!formData.location) {
        setError('Si el país es Colombia, debes seleccionar una ciudad.');
        setLoading(false);
        return;
      }
      finalFormData.append('location', formData.location);
    } else {
      if (!formData.city_text || !formData.department_text) {
        setError('Si el país no es Colombia, debes escribir la ciudad y el departamento.');
        setLoading(false);
        return;
      }
      finalFormData.append('city_text', formData.city_text);
      finalFormData.append('department_text', formData.department_text);
    }

    finalFormData.append('ticket_type', JSON.stringify(configuredTickets));

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/events/`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: finalFormData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        let errorMsg = 'Error al crear el evento.';
        if (typeof responseData === 'object') {
          errorMsg = Object.keys(responseData)
            .map(key => {
              let error = responseData[key];
              if (Array.isArray(error)) {
                if (typeof error[0] === 'object') {
                  const nestedErrors = error.map((errItem: any) =>
                    Object.values(errItem).join(', ')
                  ).join('; ');
                  return `${key}: ${nestedErrors}`;
                }
                return `${key}: ${error.join(', ')}`;
              }
              return `${key}: ${error}`;
            })
            .join(' | ');
        }
        throw new Error(errorMsg);
      }

      alert('¡Evento creado exitosamente!');
      window.location.href = '/admin/events';

    } catch (err: any) {
      setError(err.message);
      console.error("Respuesta completa del error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Clase común para inputs
  const inputClass = "mt-1 block w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";

  return (
    <div className="container mx-auto p-4">
      
      <h1 className="text-2xl font-bold mb-4">Crear Evento</h1>
      
      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Error" message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Sección 1: Información Principal */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Información Principal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="event_name" className="block text-sm font-medium text-gray-700">Nombre del Evento</label>
              <input type="text" name="event_name" id="event_name" value={formData.event_name} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="organizer" className="block text-sm font-medium text-gray-700">Organizador</label>
              <input type="text" name="organizer" id="organizer" value={formData.organizer} onChange={handleChange} required className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} required minLength={20} className={inputClass} rows={4}></textarea>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
              <select name="category" id="category" value={formData.category} onChange={handleChange} required className={inputClass}>
                <option value="">Seleccione una categoría</option>
                <option value="musica">Música</option>
                <option value="deporte">Deporte</option>
                <option value="educacion">Educación</option>
                <option value="tecnologia">Tecnología</option>
                <option value="arte">Arte</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">Imagen del Evento</label>
              <input type="file" name="image" id="image" onChange={handleFileChange} accept="image/jpeg, image/png" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
            </div>
            <div>
              <label htmlFor="min_age" className="block text-sm font-medium text-gray-700">Edad Mínima</label>
              <input type="number" name="min_age" id="min_age" value={formData.min_age} onChange={handleChange} placeholder="Ej: 18 (Opcional)" min="0" className={inputClass} />
            </div>
            <div>
              <label htmlFor="max_capacity" className="block text-sm font-medium text-gray-700">Aforo Máximo (Total)</label>
              <input type="number" name="max_capacity" id="max_capacity" value={formData.max_capacity} onChange={handleChange} placeholder="Ej: 1000 (Opcional)" min="0" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Sección 2: Fecha y Lugar */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Fecha y Lugar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha (Legacy)</label>
              <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="start_datetime" className="block text-sm font-medium text-gray-700">Fecha y Hora de Inicio</label>
              <input type="datetime-local" name="start_datetime" id="start_datetime" value={formData.start_datetime} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="end_datetime" className="block text-sm font-medium text-gray-700">Fecha y Hora de Fin</label>
              <input type="datetime-local" name="end_datetime" id="end_datetime" value={formData.end_datetime} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="sales_open_datetime" className="block text-sm font-medium text-gray-700">Inicio de Ventas (Opcional)</label>
              <input type="datetime-local" name="sales_open_datetime" id="sales_open_datetime" value={formData.sales_open_datetime} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">País</label>
              <select name="country" id="country" value={formData.country} onChange={handleChange} required className={inputClass}>
                <option value="Colombia">Colombia</option>
                <option value="Otro">Otro (Internacional)</option>
              </select>
            </div>

            {formData.country === 'Colombia' ? (
              <>
                <div>
                  <label htmlFor="department_filter" className="block text-sm font-medium text-gray-700">Departamento</label>
                  <select name="department_filter" id="department_filter" onChange={handleChange} required className={inputClass}>
                    <option value="">Seleccione un departamento</option>
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Ciudad</label>
                  <select name="location" id="location" value={formData.location} onChange={handleChange} required className={inputClass}>
                    <option value="">Seleccione una ciudad</option>
                    {filteredCities.map((city: any) => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="department_text" className="block text-sm font-medium text-gray-700">Departamento/Región</label>
                  <input type="text" name="department_text" id="department_text" value={formData.department_text} onChange={handleChange} required placeholder="Ej: California" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="city_text" className="block text-sm font-medium text-gray-700">Ciudad</label>
                  <input type="text" name="city_text" id="city_text" value={formData.city_text} onChange={handleChange} required placeholder="Ej: Los Angeles" className={inputClass} />
                </div>
              </>
            )}

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
              <select name="status" id="status" value={formData.status} onChange={handleChange} className={inputClass}>
                <option value="programado">Programado</option>
                <option value="activo">Activo</option>
                <option value="cancelado">Cancelado</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sección 3: Boletas */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Configuración de Boletas</h2>
          {eventTotalCapacity > 0 && (
            <p className="text-sm text-gray-600 mb-4">
              Aforo restante:
              <span className="font-bold"> {remainingCapacity.toLocaleString('es-CO')}</span> / {eventTotalCapacity.toLocaleString('es-CO')}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="md:col-span-1">
              <label htmlFor="ticket_type_id" className="block text-sm font-medium text-gray-700">Tipo de Boleta</label>
              <select name="ticket_type_id" id="ticket_type_id" value={currentTicket.ticket_type_id} onChange={handleTicketChange} className={inputClass}>
                <option value="">Seleccione un tipo</option>
                {ticketTypes.map((type: any) => (
                  <option key={type.id} value={type.id}>{type.ticket_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio</label>
              <input type="number" name="price" id="price" value={currentTicket.price} onChange={handleTicketChange} className={inputClass} min="0" step="0.01" />
            </div>
            <div>
              <label htmlFor="maximun_capacity" className="block text-sm font-medium text-gray-700">Capacidad Máxima</label>
              <input type="number" name="maximun_capacity" id="maximun_capacity" value={currentTicket.maximun_capacity} onChange={handleTicketChange} className={inputClass} min="1" />
            </div>
            <div className="md:col-span-1">
              <button type="button" onClick={handleAddTicket} className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Añadir Boleta
              </button>
            </div>
          </div>
          {configuredTickets.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium">Boletas Configuradas</h3>
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Boleta</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acción</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {configuredTickets.map((ticket: any, index) => {
                      const ticketType = ticketTypes.find((t: any) => t.id == ticket.ticket_type_id);
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticketType ? ticketType.ticket_name : 'ID No encontrado'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Intl.NumberFormat('es-CO').format(ticket.price)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Intl.NumberFormat('es-CO').format(ticket.maximun_capacity)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button type="button" onClick={() => handleRemoveTicket(index)} className="text-red-600 hover:text-red-900">Quitar</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" disabled={configuredTickets.length === 0 || loading}>
            {loading ? 'Creando...' : 'Crear Evento'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;