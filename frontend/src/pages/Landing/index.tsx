import React from 'react';
import { Link } from 'react-router-dom';

// Importaremos los componentes del Header y Footer aquí
// import LandingHeader from '../../layout/LandingHeader';
// import LandingFooter from '../../layout/LandingFooter';

// Placeholder para el componente de la tarjeta de evento
const EventCard = ({ event }: any) => (
  <div className="border rounded-lg p-4 shadow-lg">
    <img src={event.image} alt={event.name} className="w-full h-48 object-cover rounded-t-lg" />
    <div className="p-4">
      <p className="text-sm text-gray-500">{event.date}</p>
      <h3 className="text-xl font-bold mt-2">{event.name}</h3>
      <p className="text-gray-600 mt-1">{event.location}</p>
      <p className="text-lg font-semibold mt-2">{event.price === 0 ? 'Gratis' : `${event.price}`}</p>
      <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Ver Detalles
      </button>
    </div>
  </div>
);

const LandingPage = () => {
  // Datos de muestra para los eventos 
  const upcomingEvents = [
    {
      id: 1,
      name: 'Conferencia de Tecnología 2025',
      date: '15/11/2025',
      location: 'Centro de Convenciones Metropolitano',
      price: 75,
      image: '/images/carousel/carousel-01.png',
    },
    {
      id: 2,
      name: 'Festival de Música Indie',
      date: '22/11/2025',
      location: 'Parque de la Ciudad',
      price: 40,
      image: '/images/carousel/carousel-02.png',
    },
    {
      id: 3,
      name: 'Taller de Cocina Internacional',
      date: '30/11/2025',
      location: 'Escuela Culinaria "El Sabor"',
      price: 0,
      image: '/images/carousel/carousel-03.png',
    },
  ];

  const scrollToEvents = () => {
    const eventsSection = document.getElementById('events-section');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gray-100 text-gray-800">
      {/* Sección 1: Barra de Navegación (Placeholder) */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50 p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">Gestify</div>
        <nav>
          <a href="#home" className="mx-2">Inicio</a>
          <a href="#events" onClick={(e) => { e.preventDefault(); scrollToEvents(); }} className="mx-2">Eventos</a>
          <a href="#organizer" className="mx-2">¿Eres Organizador?</a>
        </nav>
        <div>
          <Link to="/signin" className="mx-2">Iniciar Sesión</Link>
          <Link to="/signup" className="mx-2 bg-blue-500 text-white py-2 px-4 rounded">Registrarse</Link>
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
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Sección 4: Pie de Página (Placeholder) */}
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
