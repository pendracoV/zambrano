import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../context/Authcontext';
import UserDropdown from '../../components/header/UserDropdown';
import axios from 'axios'; 
import { Search, MapPin, ArrowRight } from 'lucide-react';

// --- 1. IMPORTACIÓN DE IMÁGENES POR DEFECTO ---
// Asegúrate de que estas rutas sean correctas según tu estructura de carpetas (public o assets)
import defaultEventImageArte from '/images/arte.jpeg';
import defaultEventImageDeporte from '/images/deportes.jpg';
import defaultEventImageEducacion from '/images/educacion.jpg';
import defaultEventImageMusica from '/images/musica.webp';
import defaultEventImageOtros from '/images/otros.jpg';
import defaultEventImageTecnologia from '/images/tecnologia.jpg';

// --- 2. MAPEO DE CATEGORÍAS A IMÁGENES ---
const defaultImages: { [key: string]: string } = {
  musica: defaultEventImageMusica,
  deporte: defaultEventImageDeporte,
  arte: defaultEventImageArte,
  tecnologia: defaultEventImageTecnologia,
  educacion: defaultEventImageEducacion,
  otros: defaultEventImageOtros,
};

const CATEGORIES = [
  { id: 'musica', name: 'Música', icon: '🎵' },
  { id: 'tecnologia', name: 'Tecnología', icon: '💻' },
  { id: 'deporte', name: 'Deportes', icon: '⚽' },
  { id: 'arte', name: 'Arte y Cultura', icon: '🎨' },
  { id: 'educacion', name: 'Educación', icon: '📚' },
  { id: 'otros', name: 'Otros', icon: '✨' },
];

// --- 3. HELPER PARA OBTENER LA IMAGEN ---
const getEventImage = (event: any): string => {
  // A. Si el evento tiene imagen en BD, la usamos
  if (event.image && event.image.trim() !== '') {
    return event.image;
  }

  // B. Si no, buscamos por categoría
  const category = event.category?.toLowerCase(); // Aseguramos minúsculas para coincidir con las llaves
  if (category && defaultImages[category]) {
    return defaultImages[category];
  }

  // C. Si no hay categoría o no coincide, imagen de 'otros'
  return defaultEventImageOtros;
};

// --- COMPONENTE DE TARJETA ---
const EventCard = ({ event, variant = 'standard' }: { event: any, variant?: 'featured' | 'standard' }) => {
  const isFeatured = variant === 'featured';
  
  // Usamos el helper aquí
  const imageUrl = getEventImage(event);
  
  return (
    <Link
      to={`/events/${event.id}`}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        isFeatured ? 'col-span-1 md:col-span-2 row-span-2 h-full' : 'col-span-1 h-full'
      }`}
    >
      {/* Imagen de Fondo */}
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={event.event_name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          // Fallback extra por si la URL de la BD está rota
          onError={(e) => {
            e.currentTarget.src = defaultEventImageOtros;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
      </div>

      {/* Contenido */}
      <div className="absolute bottom-0 left-0 p-6 w-full z-20">
        <span className="inline-block px-3 py-1 mb-3 text-xs font-bold text-white bg-blue-600 rounded-full uppercase tracking-wider">
          {event.category}
        </span>
        <h3 className={`font-bold text-white mb-2 leading-tight ${isFeatured ? 'text-3xl' : 'text-xl'}`}>
          {event.event_name}
        </h3>
        <div className="flex items-center text-gray-300 text-sm space-x-4">
          <span>📅 {new Date(event.start_datetime).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}</span>
          <span>📍 {event.location_details?.name || event.city_text || 'Ubicación'}</span>
        </div>
      </div>
    </Link>
  );
};

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]); 
  const navigate = useNavigate();

  // 1. Cargar eventos reales para "Tendencias"
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/events/`);
        // Filtramos solo activos y tomamos 4
        const activeEvents = response.data
            .filter((e: any) => e.status === 'activo')
            .slice(0, 4); 
        setFeaturedEvents(activeEvents);
      } catch (error) {
        console.error("Error cargando tendencias", error);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToEvents = () => {
    const eventsSection = document.getElementById('events-section');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 2. Función para buscar y redirigir
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault(); 
    if (searchTerm.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  // 3. Función para clic en categoría
  const handleCategoryClick = (categoryId: string) => {
      navigate(`/events?genre=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* --- 1. NAVBAR --- */}
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className={`text-2xl font-extrabold tracking-tight ${scrolled ? 'text-blue-600' : 'text-white'}`}>
            GestiFy<span className="text-blue-400">.</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            {['Inicio', 'Eventos', 'Organizadores'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase() === 'inicio' ? 'home' : item.toLowerCase() === 'eventos' ? 'events-section' : 'organizer'}`}
                onClick={item === 'Eventos' ? (e) => { e.preventDefault(); scrollToEvents(); } : undefined}
                className={`text-sm font-medium transition-colors hover:text-blue-400 ${scrolled ? 'text-slate-600' : 'text-white/90'}`}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/events" className={`hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                   scrolled ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                }`}>
                  Todos los eventos
                </Link>
                <UserDropdown />
              </>
            ) : (
              <>
                <Link to="/signin" className={`text-sm font-medium hover:text-blue-400 transition-colors ${scrolled ? 'text-slate-600' : 'text-white'}`}>
                  Ingresar
                </Link>
                <Link to="/signup" className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* --- 2. HERO SECTION --- */}
      <section id="home" className="relative h-[85vh] flex items-center justify-center overflow-hidden px-6">
        {/* FONDO */}
        <div className="absolute inset-0 z-0">
            <img 
                src="/images/carousel/carousel-04.png" 
                alt="Background" 
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>

        {/* CONTENIDO */}
        <div className="relative z-10 max-w-4xl mx-auto text-center mt-16">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 drop-shadow-lg">
            Vive momentos <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              inolvidables.
            </span>
          </h1>
          <p className="text-xl text-slate-200 mb-10 max-w-2xl mx-auto font-light">
            Descubre los mejores eventos, compra tus entradas y gestiona tus experiencias en un solo lugar.
          </p>

          {/* Barra de Búsqueda */}
          <div className="relative max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex items-center bg-white rounded-full shadow-2xl p-2 focus-within:ring-4 ring-blue-500/30 transition-all transform hover:scale-[1.01]">
              <div className="pl-4 text-gray-400">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                className="w-full bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 px-4 py-3 text-lg outline-none"
                placeholder="Buscar eventos, artistas o lugares..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg">
                Buscar
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* --- 3. FILTROS / CATEGORÍAS --- */}
      <section className="px-6 py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Explorar por categoría</h2>
            <Link to="/events" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
                Ver todo <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md transition-all whitespace-nowrap group"
              >
                <span className="text-xl group-hover:scale-125 transition-transform">{cat.icon}</span>
                <span className="font-semibold text-gray-700">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- 4. GRID DE EVENTOS (Bento Grid) --- */}
      <section id="events-section" className="px-6 mb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            🔥 Tendencias esta semana
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            
            {featuredEvents.length > 0 ? (
                <>
                    {featuredEvents[0] && <EventCard event={featuredEvents[0]} variant="featured" />}
                    <div className="col-span-1 md:col-span-1 row-span-2 grid grid-rows-2 gap-6 h-full">
                        {featuredEvents[1] && <EventCard event={featuredEvents[1]} />}
                        {featuredEvents[2] && <EventCard event={featuredEvents[2]} />}
                    </div>
                </>
            ) : (
                <div className="col-span-3 text-center py-10 text-gray-500 bg-gray-100 rounded-lg">
                    Cargando tendencias o no hay eventos activos...
                </div>
            )}
            
            {/* Sección Organizadores */}
            <div id="organizer" className="col-span-1 md:col-span-3 lg:col-span-3 h-64 relative rounded-2xl overflow-hidden bg-gradient-to-r from-purple-900 to-blue-900 flex items-center justify-between p-10 shadow-xl">
              <div className="z-10 max-w-xl">
                 <h3 className="text-3xl font-bold text-white mb-2">¿Eres organizador?</h3>
                 <p className="text-blue-100 mb-6">Crea, gestiona y vende entradas para tus eventos con las herramientas más potentes del mercado.</p>
                 <Link to="/create-event" className="bg-white text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors inline-block">
                   Crear mi evento
                 </Link>
              </div>
              <div className="absolute right-0 top-0 h-full w-1/2 bg-white/5 -skew-x-12 transform translate-x-20 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* --- 5. FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-4">GestiFy.</h3>
              <p className="text-slate-500 leading-relaxed">
                Facilitando la conexión entre personas y experiencias únicas. La plataforma segura para tu próximo gran evento.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Plataforma</h4>
              <ul className="space-y-3 text-slate-600">
                <li><a href="#home" className="hover:text-blue-600 transition-colors">Inicio</a></li>
                <li><Link to="/events" className="hover:text-blue-600 transition-colors">Explorar Eventos</Link></li>
                <li><a href="#organizer" className="hover:text-blue-600 transition-colors">Soluciones para Organizadores</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Soporte</h4>
              <ul className="space-y-3 text-slate-600">
                <li><Link to="/help" className="hover:text-blue-600 transition-colors">Centro de Ayuda</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contáctanos</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Términos y Condiciones</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4">Síguenos</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-pointer">
                    FB
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-pointer">
                    TW
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-pink-100 hover:text-pink-600 transition-colors cursor-pointer">
                    IG
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
            <p>© 2025 Gestify Inc. Todos los derechos reservados.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-slate-800">Privacidad</a>
                <a href="#" className="hover:text-slate-800">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;