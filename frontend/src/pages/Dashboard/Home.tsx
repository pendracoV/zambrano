import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/Authcontext";

export default function Home() {
  const { user } = useAuth();
  
  // Verificar si el usuario es organizador
  const isOrganizer = user?.role?.includes("Organizador");

  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Organizer Call to Action - Solo para Organizadores */}
        {isOrganizer && (
          <div className="col-span-12 bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Panel de Organizador</h2>
              <p className="text-gray-600 mt-1">Crea, gestiona y analiza tus eventos en un solo lugar.</p>
            </div>
            <Link 
              to="/organizer/my-events"
              className="mt-4 md:mt-0 px-5 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
            >
              Gestionar mis eventos
            </Link>
          </div>
        )}

        {/* Participant Greeting - Para Participantes */}
        {!isOrganizer && (
          <div className="col-span-12 bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-center text-white">
            <div>
              <h2 className="text-xl font-bold">¡Bienvenido, {user?.first_name}!</h2>
              <p className="mt-1 text-blue-100">Explora eventos y compra tus entradas</p>
            </div>
            <Link 
              to="/events"
              className="mt-4 md:mt-0 px-5 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-50 transition-colors"
            >
              Ver Eventos
            </Link>
          </div>
        )}

        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
