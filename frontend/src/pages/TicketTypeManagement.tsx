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
  const [formError, setFormError] = useState<string | null>(null);
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
        headers: { Authorization: `Token ${token}` },
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
    setFormError(null);
    setFormData({ ticket_name: '', description: '' });
    setCurrentTicketType(null);
    openFormModal();
  };

  const handleOpenEditModal = (ticketType: any) => {
    setIsEditMode(true);
    setFormError(null);
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
    setFormError(null);
    if (!token) return;

    const url = isEditMode
      ? `${import.meta.env.VITE_API_URL}/ticket-types/${currentTicketType.id}/`
      : `${import.meta.env.VITE_API_URL}/ticket-types/`;

    const method = isEditMode ? 'put' : 'post';

    try {
      await axios[method](url, formData, {
        headers: { Authorization: `Token ${token}` },
      });
      closeFormModal();
      fetchTicketTypes();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
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
        headers: { Authorization: `Token ${token}` },
      });
      closeDeleteModal();
      fetchTicketTypes();
    } catch (err) {
      alert('No se pudo eliminar el tipo de boleta. Puede que esté en uso.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Gestión de Tipos de Boleta
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Administra las categorías de entradas disponibles para los eventos.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="group inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear Nuevo Tipo
          </button>
        </div>

        {/* Controls & Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-shadow duration-200"
            />
          </div>
        </div>

        {/* Table Section */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTicketTypes.map((ticketType) => (
                    <tr
                      key={ticketType.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ease-in-out group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        #{ticketType.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {ticketType.ticket_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {ticketType.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleOpenEditModal(ticketType)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(ticketType)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTicketTypes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">No se encontraron tipos de boleta.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={isFormOpen} onClose={closeFormModal} title={isEditMode ? 'Editar Tipo de Boleta' : 'Crear Tipo de Boleta'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-200">{formError}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="ticket_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la Boleta
            </label>
            <input
              type="text"
              name="ticket_name"
              id="ticket_name"
              value={formData.ticket_name}
              onChange={handleFormChange}
              className="block w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ej. VIP, General, Estudiante"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={4}
              className="block w-full px-4 py-3 rounded-xl border-gray-300 dark:border-gray-600 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Detalles sobre este tipo de entrada..."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={closeFormModal}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEditMode ? 'Guardar Cambios' : 'Crear Tipo'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal} title="Confirmar Eliminación">
        <div className="space-y-4">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">¿Eliminar tipo de boleta?</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              ¿Estás seguro de que deseas eliminar <span className="font-bold text-gray-800 dark:text-gray-200">'{currentTicketType?.ticket_name}'</span>? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={closeDeleteModal}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sí, Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TicketTypeManagement;
