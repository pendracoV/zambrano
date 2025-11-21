import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { ProtectedRoute, PublicRoute } from "./routes/AppRoutes";
import { AuthProvider } from "./context/Authcontext";
import LandingPage from "./pages/Landing";
import AllEventsPage from "./pages/Events/AllEventsPage";
import CreateEvent from "./pages/Events/CreateEvent";
import EventDetailPage from "./pages/Events/EventDetailPage";
import MyTickets from "./pages/MyTickets";
import TicketDetailPage from "./pages/TicketDetailPage";
import TicketTypeManagement from "./pages/TicketTypeManagement";
import MyEvents from "./pages/Events/MyEvents";
import EditEvent from "./pages/Events/EditEvent";
import ManageEvent from "./pages/Events/ManageEvent";
import UserManagement from "./pages/admin/UserManagement";
import PaymentSuccess from './pages/PaymentSuccess'; // Importa las nuevas páginas
import PaymentFailed from './pages/PaymentFailed';
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Rutas Públicas - Redirige al dashboard si ya está autenticado */}
          <Route element={<PublicRoute />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Rutas Protegidas - Requieren autenticación */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Home />} />

              {/* Admin */}
              <Route path="/admin/user-management" element={<UserManagement />} />

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/events" element={<AllEventsPage />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/organizer/my-events" element={<MyEvents />} />
              <Route path="/organizer/events/:id/edit" element={<EditEvent />} />
              <Route path="/organizer/events/:id/manage" element={<ManageEvent />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/my-tickets" element={<MyTickets />} />
              <Route path="/my-tickets/:id" element={<TicketDetailPage />} />
              <Route path="/ticket-types" element={<TicketTypeManagement />} />
              <Route path="/blank" element={<Blank />} />
              <Route path="/compra/exitosa" element={<PaymentSuccess />} />
              <Route path="/compra/fallida" element={<PaymentFailed />} />
            </Route>
          </Route>
          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
