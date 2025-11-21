import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/Authcontext';
import Alert from '../../components/ui/alert/Alert';
//import BarChartOne from '../../components/charts/bar/BarChartOne';
import EventCapacityChart from '../../components/events/EventCapacityChart'
// --- Helper Components (recreados aquí para simplicidad) ---

// 1. Métricas (KPIs)   
const EventMetrics = ({ metrics }: { metrics: any[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {metrics.map((metric, index) => (
      <div key={index} className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500 mb-2">{metric.title}</h4>
        <div className="flex items-center">
          {metric.icon}
          <p className="text-2xl font-bold text-gray-800 ml-3">{metric.value}</p>
        </div>
        {metric.progress !== undefined && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${metric.progress}%` }}></div>
          </div>
        )}
      </div>
    ))}
  </div>
);

// 2. Tabla de Asistentes
const AttendeesTable = ({ attendees, onExport }: { attendees: any[], onExport: () => void }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAttendees = useMemo(() => {
    if (!searchTerm) return attendees;
    return attendees.filter(a =>
      a.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.unique_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [attendees, searchTerm]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre, email o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2 lg:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={onExport}
          className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors"
        >
          Exportar a CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Nombre</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Tipo de Boleta</th>
              <th scope="col" className="px-6 py-3">Estado Boleta</th>
              <th scope="col" className="px-6 py-3">Código</th>
              <th scope="col" className="px-6 py-3">Fecha de Compra</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendees.map(attendee => (
              <tr key={attendee.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{`${attendee.user.first_name} ${attendee.user.last_name}`}</td>
                <td className="px-6 py-4">{attendee.user.email}</td>
                <td className="px-6 py-4">{attendee.ticket_type}</td>
                <td className="px-6 py-4">{attendee.status}</td>
                <td className="px-6 py-4 font-mono">{attendee.unique_code}</td>
                <td className="px-6 py-4">{new Date(attendee.date_of_purchase.replace(' ', 'T')).toLocaleDateString('es-CO')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// --- Componente Principal ---

const ManageEvent = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('summary');
  const [eventData, setEventData] = useState<any>(null);
  const [availabilityData, setAvailabilityData] = useState<any[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = { 'Authorization': `Token ${token}` };
        const apiUrlBase = import.meta.env.VITE_API_URL;

        // En la pestaña de resumen, solo cargamos lo esencial
        if (activeTab === 'summary') {
          const [eventRes, availabilityRes] = await Promise.all([
            fetch(`${apiUrlBase}/events/${id}/`, { headers }),
            fetch(`${apiUrlBase}/events/${id}/availability/`, { headers }),
          ]);

          if (!eventRes.ok) throw new Error('No se pudo cargar el evento.');
          if (!availabilityRes.ok) throw new Error('No se pudo cargar la disponibilidad.');

          const event = await eventRes.json();
          const availability = await availabilityRes.json();

          setEventData(event);
          setAvailabilityData(availability);

        } else if (activeTab === 'attendees') {
          // Si no tenemos datos del evento, los cargamos primero
          if (!eventData) {
            const eventRes = await fetch(`${apiUrlBase}/events/${id}/`, { headers });
            if (!eventRes.ok) throw new Error('No se pudo cargar el evento.');
            setEventData(await eventRes.json());
          }
          // Cargamos los asistentes
          const attendeesRes = await fetch(`${apiUrlBase}/events/${id}/attendees/`, { headers });
          if (!attendeesRes.ok) throw new Error('No se pudieron cargar los asistentes.');
          setAttendees(await attendeesRes.json());
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, activeTab]);

  const handleCancelEvent = async () => {
    if (!id || !token) return;
    if (window.confirm('¿Estás seguro de que quieres cancelar este evento? Esta acción es irreversible.')) {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/events/${id}/cancel/`, {
          method: 'POST',
          headers: { 'Authorization': `Token ${token}` },
        });
        if (!response.ok) {
          throw new Error('No se pudo cancelar el evento.');
        }
        // Refrescar datos del evento
        const eventRes = await fetch(`${import.meta.env.VITE_API_URL}/events/${id}/`, { headers: { 'Authorization': `Token ${token}` } });
        setEventData(await eventRes.json());
        alert('¡Evento cancelado con éxito!');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExportToCSV = () => {
    if (attendees.length === 0) return;
    const headers = ['Nombre', 'Email', 'Tipo de Boleta', 'Estado', 'Código', 'Fecha de Compra'];
    const rows = attendees.map(a => [
      `${a.user.first_name} ${a.user.last_name}`,
      a.user.email,
      a.ticket_type, // <--- CORREGIDO
      a.status,
      a.unique_code,
      new Date(a.date_of_purchase.replace(' ', 'T')).toLocaleDateString('es-CO') // <--- CORREGIDO
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `asistentes_${eventData?.event_name.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Datos Calculados para la UI ---
  const kpiData = useMemo(() => {
    const sold = availabilityData.reduce((sum, t) => sum + t.capacity_sold, 0);
    const capacity = availabilityData.reduce((sum, t) => sum + t.maximun_capacity, 0);
    const revenue = availabilityData.reduce((sum, t) => sum + (t.capacity_sold * t.price), 0);
    return { sold, capacity, revenue };
  }, [availabilityData]);

  const metrics = [
    { title: 'Aforo', value: `${kpiData.sold} / ${kpiData.capacity}`, progress: kpiData.capacity > 0 ? (kpiData.sold / kpiData.capacity) * 100 : 0, icon: <div /> },
    { title: 'Ingresos', value: `$${kpiData.revenue.toLocaleString('es-CO')}`, icon: <div /> },
    { title: 'Estado', value: eventData?.status?.charAt(0).toUpperCase() + eventData?.status?.slice(1) || 'N/A', icon: <div /> },
  ];

  const chartState = {
    series: [{ name: 'Boletas Vendidas', data: availabilityData.map(t => t.capacity_sold) }],
    categories: availabilityData.map(t => t.ticket_type.name),
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
        Gestionar: {loading && !eventData ? 'Cargando...' : eventData?.event_name}
      </h1>

      {error && <Alert variant="error" title="Error" message={error} />}

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button onClick={() => setActiveTab('summary')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'summary' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Resumen
          </button>
          <button onClick={() => setActiveTab('attendees')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'attendees' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Lista de Asistentes
          </button>
        </nav>
      </div>

      {loading && <div className="text-center p-10">Cargando datos...</div>}

      {!loading && activeTab === 'summary' && (
        <div className="space-y-6">
          <EventMetrics metrics={metrics} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              {/* No necesitas el <h3>, tu componente EventCapacityChart ya tiene un título */}
              <EventCapacityChart availabilityData={availabilityData} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow border border-red-300">
              <h3 className="text-xl font-semibold mb-4 text-red-700">Zona de Peligro</h3>
              <p className="text-gray-600 mb-4">Esta acción es permanente. Al cancelar el evento, se invalidarán todas las boletas y no podrá ser reactivado.</p>
              <button onClick={handleCancelEvent} className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors" disabled={loading || eventData?.status === 'cancelado'}>
                {eventData?.status === 'cancelado' ? 'Evento ya Cancelado' : 'Cancelar Evento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'attendees' && (
        <AttendeesTable attendees={attendees} onExport={handleExportToCSV} />
      )}
    </div>
  );
};

export default ManageEvent;