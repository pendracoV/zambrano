import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Alert from '../../components/ui/alert/Alert';
import { useAuth } from '../../context/Authcontext';

const EditEvent = () => {
  const { token } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<any>({
    event_name: '',
    description: '',
    organizer: '',
    category: '',
    image: null,
    current_image_url: '',
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const eventTotalCapacity = parseInt(formData.max_capacity, 10) || 0;
  const currentConfiguredCapacity = configuredTickets.reduce((total, ticket) => total + ticket.maximun_capacity, 0);
  const remainingCapacity = eventTotalCapacity - currentConfiguredCapacity;

  useEffect(() => {
    if (!token || !id) return;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const headers = { 'Authorization': `Token ${token}` };
        const apiUrlBase = import.meta.env.VITE_API_URL;

        const [eventRes, ticketsRes, departmentsRes, citiesRes] = await Promise.all([
          fetch(`${apiUrlBase}/events/${id}/`, { headers }),
          fetch(`${apiUrlBase}/ticket-types/`, { headers }),
          fetch(`${apiUrlBase}/departments/`, { headers }),
          fetch(`${apiUrlBase}/cities/`, { headers }),
        ]);

        if (!eventRes.ok) throw new Error('No se pudo cargar el evento.');
        if (!ticketsRes.ok) throw new Error('No se pudieron cargar los tipos de boleta');
        if (!departmentsRes.ok) throw new Error('No se pudieron cargar los departamentos');
        if (!citiesRes.ok) throw new Error('No se pudieron cargar las ciudades');

        const eventData = await eventRes.json();
        const ticketsData = await ticketsRes.json();
        const departmentsData = await departmentsRes.json();
        const citiesData = await citiesRes.json();

        // Populate form
        setFormData({
          ...eventData,
          date: eventData.date.split('T')[0], // Format date
          start_datetime: eventData.start_datetime.slice(0, 16),
          end_datetime: eventData.end_datetime.slice(0, 16),
          sales_open_datetime: eventData.sales_open_datetime ? eventData.sales_open_datetime.slice(0, 16) : '',
          current_image_url: eventData.image,
          image: null, // Reset image file input
        });
        // --- INICIO DE LA SOLUCIÓN ---
        // eventData.ticket_type es la data de LECTURA (para la app móvil)
        // Tiene un formato como: [{ ticket_type: { id: 1, ... }, price: 50000, ... }]
        const loadedTickets = eventData.ticket_type || [];

        // Normalizamos los datos al formato que nuestro formulario espera:
        // { ticket_type_id: 1, price: 50000, ... }
        const normalizedTickets = loadedTickets.map((ticket: any) => ({
          ticket_type_id: ticket.ticket_type.id, // <-- Aquí está la magia
          price: parseFloat(ticket.price),
          maximun_capacity: ticket.maximun_capacity
        }));

        setConfiguredTickets(normalizedTickets);
        // --- FIN DE LA SOLUCIÓN ---

        // Populate catalogs
        setTicketTypes(ticketsData);
        setDepartments(departmentsData);
        setCities(citiesData);

        if (eventData.location) {
          const city = citiesData.find((c: any) => c.id === eventData.location);
          if (city) {
            const deptId = city.department.id;
            setFilteredCities(citiesData.filter((c: any) => c.department.id === deptId));
            // This is tricky, we need to set the department filter value
            // We'll need to add a value to the select for the department
          }
        }


      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [token, id]);

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
      setFormData((prev: any) => ({ ...prev, image: e.target.files[0], current_image_url: '' }));
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

    // --- INICIO DE LA CORRECCIÓN ---
    // 1. Añadir campos de texto simples explícitamente
    finalFormData.append('event_name', formData.event_name);
    finalFormData.append('description', formData.description);
    finalFormData.append('organizer', formData.organizer);
    finalFormData.append('category', formData.category);
    finalFormData.append('date', formData.date);
    finalFormData.append('start_datetime', formData.start_datetime);
    finalFormData.append('end_datetime', formData.end_datetime);
    finalFormData.append('country', formData.country);
    finalFormData.append('status', formData.status);

    // 2. Añadir campos opcionales (asegúrate de que no sean null)
    if (formData.min_age) {
      finalFormData.append('min_age', formData.min_age);
    }
    if (formData.max_capacity) {
      finalFormData.append('max_capacity', formData.max_capacity);
    }
    if (formData.sales_open_datetime) {
      finalFormData.append('sales_open_datetime', formData.sales_open_datetime);
    }

    // 3. Lógica condicional de ubicación
    if (formData.country === 'Colombia') {
      if (formData.location) {
        finalFormData.append('location', formData.location);
      }
    } else {
      finalFormData.append('city_text', formData.city_text);
      finalFormData.append('department_text', formData.department_text);
    }

    // 4. Lógica de imagen
    if (formData.image) {
      // El usuario subió una imagen nueva
      finalFormData.append('image', formData.image);
    } else if (!formData.current_image_url) {
      // El usuario quitó la imagen y no subió una nueva
      finalFormData.append('image', '');
    }
    // Si current_image_url existe y no hay imagen nueva, no adjuntamos nada,
    // y el backend mantendrá la imagen existente.

    // 5. Lógica de tickets
    finalFormData.append('ticket_type_json', JSON.stringify(configuredTickets));
    // --- FIN DE LA CORRECCIÓN ---

    if (formData.image) {
      finalFormData.append('image', formData.image);
    }

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/events/${id}/`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: finalFormData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        let errorMsg = 'Error al actualizar el evento.';
        if (typeof responseData === 'object') {
          errorMsg = Object.keys(responseData)
            .map(key => `${key}: ${responseData[key]}`)
            .join(' | ');
        }
        throw new Error(errorMsg);
      }

      alert('¡Evento actualizado exitosamente!');
      navigate('/organizer/my-events');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !id) return;

    if (window.confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${id}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Token ${token}` },
        });

        if (!response.ok) {
          throw new Error('No se pudo eliminar el evento.');
        }

        alert('¡Evento eliminado exitosamente!');
        navigate('/organizer/my-events');

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Evento: {formData.event_name}</h1>
      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Error" message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Información Principal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="event_name" className="block text-sm font-medium text-gray-700">Nombre del Evento</label>
              <input type="text" name="event_name" id="event_name" value={formData.event_name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="organizer" className="block text-sm font-medium text-gray-700">Organizador</label>
              <input type="text" name="organizer" id="organizer" value={formData.organizer} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} required minLength={20} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows={4}></textarea>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
              <select name="category" id="category" value={formData.category} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
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
              <label className="block text-sm font-medium text-gray-700">Imagen del Evento</label>
              {formData.current_image_url && (
                <div className="mt-2">
                  <img src={formData.current_image_url} alt="Imagen actual del evento" className="h-32 w-auto rounded" />
                </div>
              )}
              <input type="file" name="image" id="image" onChange={handleFileChange} accept="image/jpeg, image/png" className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
              {formData.current_image_url && <button type="button" onClick={() => setFormData((prev: any) => ({ ...prev, current_image_url: '', image: null }))} className="text-sm text-red-600 mt-1">Quitar imagen</button>}
            </div>
            <div>
              <label htmlFor="min_age" className="block text-sm font-medium text-gray-700">Edad Mínima</label>
              <input type="number" name="min_age" id="min_age" value={formData.min_age} onChange={handleChange} placeholder="Ej: 18 (Opcional)" min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="max_capacity" className="block text-sm font-medium text-gray-700">Aforo Máximo (Total)</label>
              <input type="number" name="max_capacity" id="max_capacity" value={formData.max_capacity} onChange={handleChange} placeholder="Ej: 1000 (Opcional)" min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Fecha y Lugar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha (Legacy)</label>
              <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="start_datetime" className="block text-sm font-medium text-gray-700">Fecha y Hora de Inicio</label>
              <input type="datetime-local" name="start_datetime" id="start_datetime" value={formData.start_datetime} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="end_datetime" className="block text-sm font-medium text-gray-700">Fecha y Hora de Fin</label>
              <input type="datetime-local" name="end_datetime" id="end_datetime" value={formData.end_datetime} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="sales_open_datetime" className="block text-sm font-medium text-gray-700">Inicio de Ventas (Opcional)</label>
              <input type="datetime-local" name="sales_open_datetime" id="sales_open_datetime" value={formData.sales_open_datetime} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">País</label>
              <select name="country" id="country" value={formData.country} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option value="Colombia">Colombia</option>
                <option value="Otro">Otro (Internacional)</option>
              </select>
            </div>
            {formData.country === 'Colombia' ? (
              <>
                <div>
                  <label htmlFor="department_filter" className="block text-sm font-medium text-gray-700">Departamento</label>
                  <select name="department_filter" id="department_filter" onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    <option value="">Seleccione un departamento</option>
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Ciudad</label>
                  <select name="location" id="location" value={formData.location} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
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
                  <input type="text" name="department_text" id="department_text" value={formData.department_text} onChange={handleChange} required placeholder="Ej: California" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                  <label htmlFor="city_text" className="block text-sm font-medium text-gray-700">Ciudad</label>
                  <input type="text" name="city_text" id="city_text" value={formData.city_text} onChange={handleChange} required placeholder="Ej: Los Angeles" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
              </>
            )}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
              <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option value="programado">Programado</option>
                <option value="activo">Activo</option>
                <option value="cancelado">Cancelado</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Configuración de Boletas</h2>
          {eventTotalCapacity > 0 && (
            <p className="text-sm text-gray-600 mb-4">
              Aforo restante: <span className="font-bold">{remainingCapacity.toLocaleString('es-CO')}</span> / {eventTotalCapacity.toLocaleString('es-CO')}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="md:col-span-1">
              <label htmlFor="ticket_type_id" className="block text-sm font-medium text-gray-700">Tipo de Boleta</label>
              <select name="ticket_type_id" id="ticket_type_id" value={currentTicket.ticket_type_id} onChange={handleTicketChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option value="">Seleccione un tipo</option>
                {ticketTypes.map((type: any) => (
                  <option key={type.id} value={type.id}>{type.ticket_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Precio</label>
              <input type="number" name="price" id="price" value={currentTicket.price} onChange={handleTicketChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" min="0" step="0.01" />
            </div>
            <div>
              <label htmlFor="maximun_capacity" className="block text-sm font-medium text-gray-700">Capacidad Máxima</label>
              <input type="number" name="maximun_capacity" id="maximun_capacity" value={currentTicket.maximun_capacity} onChange={handleTicketChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" min="1" />
            </div>
            <div className="md:col-span-1">
              <button type="button" onClick={handleAddTicket} className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">Añadir Boleta</button>
            </div>
          </div>
          {configuredTickets.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium">Boletas Configradas</h3>
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
          <button type="submit" className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700" disabled={configuredTickets.length === 0 || loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>

      <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-red-500">
        <h2 className="text-xl font-semibold mb-4 text-red-700">Zona de Peligro</h2>
        <p className="text-gray-600 mb-4">Esta acción es permanente y no se puede deshacer. Asegúrate de que realmente quieres eliminar este evento.</p>
        <button onClick={handleDelete} className="px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700" disabled={loading}>
          {loading ? 'Eliminando...' : 'Eliminar Evento'}
        </button>
      </div>
    </div>
  );
};

export default EditEvent;