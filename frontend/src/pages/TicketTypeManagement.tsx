// src/pages/TicketTypeManagement.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/Authcontext';
import { useModal } from '../hooks/useModal';
import Modal from '../components/common/Modal';

const TicketTypeManagement = () => {
  const { token } = useAuth();
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [filteredTicketTypes, setFilteredTicketTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen: isFormOpen, openModal: openFormModal, closeModal: closeFormModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTicketType, setCurrentTicketType] = useState<any>(null);
  const [formData, setFormData] = useState({ ticket_name: '', description: '' });
  const [formError, setFormError] = useState<string | null>(null); // Estado para errores de formulario
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTicketTypes = async () => {
    if (!token) {
      setIsLoading(false);
      setError("No estás autenticado.");
      return;
    }

    try {
      setIsLoading(true);
      const apiUrl = `${import.meta.env.VITE_API_URL}/ticket-types/`;
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setTicketTypes(response.data);
      setFilteredTicketTypes(response.data);
    } catch (err) {
      setError('No se pudieron cargar los tipos de boleta. Intenta de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketTypes();
  }, [token]);

  useEffect(() => {
    const filtered = ticketTypes.filter(ticketType =>
      ticketType.ticket_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTicketTypes(filtered);
  }, [searchTerm, ticketTypes]);

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setFormError(null); // Limpiar errores al abrir
    setFormData({ ticket_name: '', description: '' });
    setCurrentTicketType(null);
    openFormModal();
  };

  const handleOpenEditModal = (ticketType: any) => {
    setIsEditMode(true);
    setFormError(null); // Limpiar errores al abrir
    setFormData({ ticket_name: ticketType.ticket_name, description: ticketType.description });
    setCurrentTicketType(ticketType);
    openFormModal();
  };

  const handleOpenDeleteModal = (ticketType: any) => {
    setCurrentTicketType(ticketType);
    openDeleteModal();
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Limpiar error previo
    if (!token) return;

    const url = isEditMode
      ? `${import.meta.env.VITE_API_URL}/ticket-types/${currentTicketType.id}/`
      : `${import.meta.env.VITE_API_URL}/ticket-types/`;
    
    const method = isEditMode ? 'put' : 'post';

    try {
      await axios[method](url, formData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      closeFormModal();
      fetchTicketTypes(); // Refresh data
    } catch (err) {
      // Mostrar error al usuario
      if (axios.isAxiosError(err) && err.response) {
        // Puedes ser más específico si tu API devuelve mensajes de error claros
        setFormError(`Error: ${Object.values(err.response.data).join(', ')}`);
      } else {
        setFormError('No se pudo guardar el tipo de boleta. Inténtalo de nuevo.');
      }
    }
  };

  const handleDelete = async () => {
    if (!token || !currentTicketType) return;

    try {
      const url = `${import.meta.env.VITE_API_URL}/ticket-types/${currentTicketType.id}/`;
      await axios.delete(url, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      closeDeleteModal();
      fetchTicketTypes(); // Refresh data
    } catch (err) {
      // Aquí podrías usar un sistema de notificaciones (toasts) para informar del error
      alert('No se pudo eliminar el tipo de boleta. Puede que esté en uso.');
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Tipos de Boleta</h1>
        <button onClick={handleOpenCreateModal} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Crear Nuevo Tipo de Boleta
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-gray-900 dark:text-white"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12"><p className="text-gray-600 dark:text-gray-400">Cargando...</p></div>
      ) : error ? (
        <div className="text-center py-12"><p className="text-red-500">{error}</p></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTicketTypes.map((ticketType) => (
                <tr key={ticketType.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{ticketType.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{ticketType.ticket_name}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{ticketType.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => handleOpenEditModal(ticketType)} className="text-blue-500 hover:text-blue-700 mr-4">Editar</button>
                    <button onClick={() => handleOpenDeleteModal(ticketType)} className="text-red-500 hover:text-red-700">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isFormOpen} onClose={closeFormModal} title={isEditMode ? 'Editar Tipo de Boleta' : 'Crear Tipo de Boleta'}>
        <form onSubmit={handleSubmit}>
          {formError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{formError}</div>
          )}
          <div className="mb-4">
            <label htmlFor="ticket_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la Boleta</label>
            <input
              type="text"
              name="ticket_name"
              id="ticket_name"
              value={formData.ticket_name}
              onChange={handleFormChange}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={closeFormModal} className="mr-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded">
              Cancelar
            </button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Guardar
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal} title="Confirmar Eliminación">
        <div>
          <p className="text-gray-800 dark:text-gray-200">¿Estás seguro de que deseas eliminar el tipo de boleta '{currentTicketType?.ticket_name}'?</p>
          <p className="text-sm text-red-500 mt-2">Cuidado: Esta acción no se puede deshacer y puede afectar a eventos existentes.</p>
          <div className="flex justify-end mt-4">
            <button type="button" onClick={closeDeleteModal} className="mr-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded">
              Cancelar
            </button>
            <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TicketTypeManagement;
