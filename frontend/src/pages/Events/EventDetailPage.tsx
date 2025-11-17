import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CalenderIcon } from '../../icons';

// ✅ OPCIÓN 2: Importar imágenes (recomendada por Vite/React)

import defaultEventImage from '/public/images/1.jpg';
const defaultImages: { [key: string]: string } = {
  musica: defaultEventImage,
  deporte: defaultEventImage,
  arte: defaultEventImage,
  tecnologia: defaultEventImage,
  educacion: defaultEventImage,
  otros: defaultEventImage,
};

/**
 * Helper function con lógica de cascada para obtener imagen
 */
const getEventImage = (event: any): string | null => {
  if (event.image && event.image.trim() !== '') {
    return event.image;
  }
  
  const category = event.category?.toLowerCase();
  if (category && defaultImages[category]) {
    return defaultImages[category];
  }
  
  return null;
};

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [eventRes, availabilityRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/events/${id}/`),
          axios.get(`${import.meta.env.VITE_API_URL}/events/${id}/availability/`)
        ]);

        setEvent(eventRes.data);
        setTicketTypes(availabilityRes.data);

        if (availabilityRes.data && availabilityRes.data.length > 0) {
          const firstAvailableTicket = availabilityRes.data.find(
            (t: any) => (t.maximun_capacity - t.capacity_sold) > 0
          );
          setSelectedTicket(firstAvailableTicket || null);
          setQuantity(1); 
        }

      } catch (err) {
        setError('No se pudo cargar la información del evento.');
        console.error(`Error fetching event data ${id}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  if (isLoading) {
    return <div className="p-10 text-center">Cargando evento...</div>;
  }
  if (error) {
    return <div className="p-10 text-center text-red-500">{error}</div>;
  }
  if (!event) {
    return <div className="p-10 text-center">Evento no encontrado.</div>;
  }

  const subtotal = selectedTicket ? quantity * parseFloat(selectedTicket.price) : 0;
  const serviceFee = 0;
  const total = subtotal + serviceFee;

  const handleCheckout = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log({
      eventId: event.id,
      selectedTicketId: selectedTicket.id,
      selectedTicketName: selectedTicket.ticket_type, 
      quantity,
      subtotal,
      serviceFee,
      total,
    });
    setIsProcessing(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.event_name,
        text: `¡Mira este evento! ${event.event_name}`,
        url: window.location.href,
      }).catch(err => console.log('Error al compartir', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleSave = () => {
    console.log('Guardar evento:', event.id);
    alert('¡Evento guardado en tus favoritos!');
  };

  const eventDate = new Date(event.start_datetime.replace(' ', 'T')).toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const eventTime = new Date(event.start_datetime.replace(' ', 'T')).toLocaleTimeString('es-ES', { 
    hour: '2-digit', minute: '2-digit', hour12: true 
  });

  const locationName = event.country === 'Colombia' && event.location_details 
    ? event.location_details.name 
    : (event.city_text || 'Ubicación por confirmar');

  const regionName = event.country === 'Colombia' && event.location_details 
    ? event.location_details.department.name 
    : (event.department_text || '');

  let buttonText = 'Conseguir Boletas';
  let isButtonDisabled = false;

  if (event.status === 'programado') {
    buttonText = 'Venta Próximamente';
    isButtonDisabled = true;
  } else if (event.status === 'cancelado') {
    buttonText = 'Evento Cancelado';
    isButtonDisabled = true;
  } else if (event.status === 'finalizado') {
    buttonText = 'Evento Finalizado';
    isButtonDisabled = true;
  } else if (!selectedTicket) {
    buttonText = 'Boletas Agotadas';
    isButtonDisabled = true;
  } else if ((selectedTicket.maximun_capacity - selectedTicket.capacity_sold) === 0) {
    buttonText = 'Boleta Agotada';
    isButtonDisabled = true;
  }

  const imageUrl = getEventImage(event);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

        <div className="lg:col-span-2">
          
          {event.status === 'cancelado' && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <h3 className="font-bold text-lg">Evento Cancelado</h3>
              <p>Este evento ha sido cancelado. Si ya tenías boletas, contacta al organizador.</p>
            </div>
          )}
          {event.status === 'finalizado' && (
            <div className="mb-6 p-4 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg">
              <h3 className="font-bold text-lg">Evento Finalizado</h3>
              <p>Este evento ya ocurrió. ¡Gracias por participar!</p>
            </div>
          )}

          <div className="mb-6">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={`Banner de ${event.event_name}`}
                className="w-full h-auto max-h-96 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  console.error('Error cargando imagen:', imageUrl);
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-64 sm:h-80 lg:h-96 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg flex items-center justify-center">
                        <p class="text-gray-500">No se pudo cargar la imagen</p>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Este evento no tiene imagen</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">{event.event_name}</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{event.description.substring(0, 100)}...</p>
          </div>

          <div className="flex flex-wrap gap-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 mb-8">
            <div className="flex items-center gap-3">
              <CalenderIcon className="w-6 h-6 text-brand-500" />
              <div>
                <p className="font-semibold">{eventDate}</p>
                <p className="text-sm text-gray-500">{eventTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-5.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">{locationName}</p>
                <p className="text-sm text-gray-500">{regionName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              <div>
                <p className="font-semibold">{event.min_age ? `Mayores de ${event.min_age}` : 'Todo público'}</p>
                <p className="text-sm text-gray-500">Restricción de edad</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Acerca de este evento</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{event.description}</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Ubicación</h2>
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-2">
              <p>Placeholder para el mapa interactivo (Google Maps)</p>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{locationName}, {regionName}</p>
          </div>
        </div>

        {(event.status === 'activo' || event.status === 'programado') && (
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
              
              <h2 className="text-2xl font-bold mb-4">Boletas</h2>
              
              <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Las boletas se enviarán a tu correo electrónico inmediatamente después del pago.</span>
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                {ticketTypes.length > 0 ? (
                  ticketTypes.map((ticket) => {
                    const available = ticket.maximun_capacity - ticket.capacity_sold;
                    const isAvailable = available > 0;
                    const isSelected = selectedTicket?.id === ticket.id;
                    const soldPercentage = (ticket.capacity_sold / ticket.maximun_capacity) * 100;
                    const isAlmostSoldOut = soldPercentage > 80;

                    return (
                      <div 
                        key={ticket.id} 
                        onClick={() => { 
                          if (isAvailable && event.status === 'activo') {
                            setSelectedTicket(ticket); 
                            setQuantity(1); 
                          }
                        }}
                        className={`
                          relative p-4 border-2 rounded-xl transition-all
                          ${isSelected 
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-md ring-2 ring-brand-200' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-brand-300'
                          }
                          ${!isAvailable || event.status !== 'activo' 
                            ? 'opacity-40 bg-gray-50 cursor-not-allowed' 
                            : 'cursor-pointer hover:shadow-md'
                          }
                        `}
                      >
                        {ticket.ticket_type.toLowerCase().includes('vip') && isAvailable && (
                          <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                            ⭐ Popular
                          </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-lg text-gray-900 dark:text-white">
                              {ticket.ticket_type}
                            </p>
                          </div>
                          
                          {isSelected && (
                            <div className="bg-brand-500 text-white rounded-full p-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-end justify-between mb-2">
                          <div>
                            <p className="text-2xl font-extrabold text-brand-500">
                              ${parseFloat(ticket.price).toLocaleString('es-CO')}
                            </p>
                            <p className="text-xs text-gray-500">por boleta</p>
                          </div>
                          
                          <div className="text-right">
                            {!isAvailable ? (
                              <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
                                Agotado
                              </span>
                            ) : isAlmostSoldOut ? (
                              <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded animate-pulse">
                                ¡Últimas {available}!
                              </span>
                            ) : (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {available} disponibles
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {isAvailable && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all ${
                                isAlmostSoldOut ? 'bg-orange-500' : 'bg-brand-500'
                              }`}
                              style={{ width: `${soldPercentage}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay boletas configuradas para este evento.</p>
                )}
              </div>

              {event.status === 'programado' && event.sales_open_datetime && (
                <div className="mb-6 p-3 bg-blue-50 text-blue-700 rounded-lg text-center text-sm">
                  La venta de boletas comienza el: 
                  <strong className="block mt-1">
                    {new Date(event.sales_open_datetime.replace(' ', 'T')).toLocaleString('es-CO', {dateStyle: 'medium', timeStyle: 'short'})}
                  </strong>
                </div>
              )}

              {event.status === 'activo' && selectedTicket && (
                <>
                  <hr className="my-6 border-gray-200 dark:border-gray-700" />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-lg">Cantidad</p>
                      <p className="text-sm text-gray-500">
                        Máx: {selectedTicket.maximun_capacity - selectedTicket.capacity_sold}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between gap-4">
                      <button 
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 
                                   flex items-center justify-center text-2xl font-bold 
                                   hover:bg-gray-100 dark:hover:bg-gray-700 
                                   disabled:opacity-30 disabled:cursor-not-allowed
                                   transition-all active:scale-95"
                      >
                        −
                      </button>
                      
                      <div className="flex-1 text-center">
                        <span className="font-bold text-3xl">{quantity}</span>
                        <p className="text-xs text-gray-500 mt-1">boletas</p>
                      </div>
                      
                      <button 
                        onClick={() => setQuantity(q => Math.min(q + 1, selectedTicket.maximun_capacity - selectedTicket.capacity_sold))}
                        disabled={quantity >= (selectedTicket.maximun_capacity - selectedTicket.capacity_sold)}
                        className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 
                                   flex items-center justify-center text-2xl font-bold 
                                   hover:bg-gray-100 dark:hover:bg-gray-700 
                                   disabled:opacity-30 disabled:cursor-not-allowed
                                   transition-all active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <hr className="my-6 border-gray-200 dark:border-gray-700" />

                  <div className="space-y-3 py-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {quantity}x {selectedTicket.ticket_type}
                      </span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">
                        ${parseFloat(selectedTicket.price).toLocaleString('es-CO')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal boletas</span>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">
                        ${subtotal.toLocaleString('es-CO')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600 dark:text-gray-400">Fee de servicio</span>
                        <button 
                          title="Cargos adicionales por procesamiento"
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">
                        ${serviceFee.toLocaleString('es-CO')}
                      </span>
                    </div>
                    
                    <hr className="border-gray-300 dark:border-gray-600" />
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">Total</span>
                      <span className="text-2xl font-bold text-brand-500">
                        ${total.toLocaleString('es-CO')}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center">Impuestos incluidos</p>
                  </div>
                </>
              )}

              <button 
                onClick={handleCheckout} 
                disabled={isButtonDisabled || isProcessing}
                className={`mt-6 w-full py-4 rounded-lg font-bold transition-all text-lg
                  flex items-center justify-center gap-2 shadow-lg
                  ${isButtonDisabled || isProcessing
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-brand-500 hover:bg-brand-600 hover:shadow-xl active:scale-[0.98] text-white'
                  }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>{buttonText}</span>
                  </>
                )}
              </button>

              {event.status === 'activo' && (
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Pago seguro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Confirmación inmediata</span>
                  </div>
                </div>
              )}

              {event.status === 'activo' && (
                <div className="mt-6 space-y-3">
                  <button 
                    onClick={handleShare}
                    className="w-full py-2.5 text-brand-500 border border-brand-500 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Compartir evento
                  </button>
                  
                  <button 
                    onClick={handleSave}
                    className="w-full py-2.5 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Guardar para después
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
        )}

      </div>
    </div>
  );
};

export default EventDetailPage;