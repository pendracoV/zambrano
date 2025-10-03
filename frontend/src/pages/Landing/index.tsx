import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/Authcontext';
import UserDropdown from '../../components/header/UserDropdown';
import EventCard from '../../components/ecommerce/EventCard';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Asumimos que el endpoint para eventos es /events/
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/events/`);
        // El console.log ya no es necesario
        setEvents(response.data);
      } catch (err) {
        setError('No se pudieron cargar los eventos. Intente de nuevo más tarde.');
        console.error("Error fetching events:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []); // El array vacío asegura que esto se ejecute solo una vez

  const scrollToEvents = () => {
    const eventsSection = document.getElementById('events-section');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gray-100 text-gray-800">
      {/* Sección 1: Barra de Navegación */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50 p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">Gestify</div>
        <nav>
          <a href="#home" className="mx-2">Inicio</a>
          <Link to="/events" className="mx-2">Eventos</Link>
          <a href="#organizer" className="mx-2">¿Eres Organizador?</a>
        </nav>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hidden sm:block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                Ir al Dashboard
              </Link>
              <UserDropdown />
            </>
          ) : (
            <>
              <Link to="/signin" className="mx-2">Iniciar Sesión</Link>
              <Link to="/signup" className="mx-2 bg-blue-500 text-white py-2 px-4 rounded">Registrarse</Link>
            </>
          )}
        </div>
      </header>

      {/* Sección 2: Héroe */}
      <section id="home" className="relative h-screen flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "url('/images/carousel/carousel-04.png')" }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold text-white">Tu Próxima Gran Experiencia te Espera</h1>
          <p className="mt-4 text-xl text-gray-200">La plataforma definitiva para descubrir, unirte y gestionar los mejores eventos a tu alrededor.</p>
          <button onClick={scrollToEvents} className="mt-8 bg-blue-500 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-600">
            Ver Próximos Eventos
          </button>
        </div>
      </section>

      {/* Sección 3: Próximos Eventos */}
      <section id="events-section" className="py-20 px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Próximos Eventos</h2>
        <div className="container mx-auto">
          {isLoading ? (
            <p className="text-center text-lg">Cargando eventos...</p>
          ) : error ? (
            <p className="text-center text-lg text-red-500">No se pudieron cargar los eventos. Intente de nuevo más tarde.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sección 4: Pie de Página */}
      <footer className="bg-gray-800 text-white py-10 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-bold">Gestify</h3>
            <p className="mt-2 text-gray-400">Tu portal a las mejores experiencias.</p>
          </div>
          <div>
            <h4 className="font-semibold">Navegación</h4>
            <ul className="mt-2 space-y-1">
              <li><a href="#home" className="hover:underline">Inicio</a></li>
              <li><a href="#events" onClick={(e) => { e.preventDefault(); scrollToEvents(); }} className="hover:underline">Eventos</a></li>
              <li><a href="#register" className="hover:underline">Registrarse</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Legal</h4>
            <ul className="mt-2 space-y-1">
              <li><a href="#" className="hover:underline">Política de Privacidad</a></li>
              <li><a href="#" className="hover:underline">Términos de Servicio</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Redes Sociales</h4>
            {/* Social media icons would go here */}
          </div>
        </div>
        <div className="text-center text-gray-500 border-t border-gray-700 pt-6 mt-8">
          <p>© 2025 Gestify. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
