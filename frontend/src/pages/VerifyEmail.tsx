import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircleIcon, AlertIcon, ChevronLeftIcon } from "../icons";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Token de verificación no proporcionado");
        setLoading(false);
        return;
      }

      console.log("🔍 Token recibido:", token);
      console.log("📧 URL API:", `${import.meta.env.VITE_API_URL}/users/verify-email/?token=${token}`);

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/verify-email/`,
          {
            params: { token }
          }
        );

        console.log("✅ Respuesta del servidor:", response);
        console.log("Status:", response.status);
        console.log("Data:", response.data);
        
        // Si la respuesta es 200, el token es válido
        if (response.status === 200) {
          console.log("✅ Token verificado exitosamente");
          setVerified(true);
          setError("");
          setMessage(response.data?.message || "¡Correo verificado exitosamente! Tu cuenta está activa.");
          
          // Redirigir a login después de 3 segundos
          setTimeout(() => {
            navigate("/signin");
          }, 3000);
        }
      } catch (err: any) {
        console.error("❌ Error verificando email:", err);
        console.error("Response status:", err.response?.status);
        console.error("Response data:", err.response?.data);
        
        setVerified(false);
        
        // Si recibimos 400, es token inválido o expirado
        if (err.response?.status === 400) {
          const errorData = err.response.data;
          let errorMessage = errorData?.error || "Token inválido o expirado";
          
          // Si el error menciona que solicite un nuevo link, sugérelo claramente
          if (errorMessage.includes("Solicita un nuevo link")) {
            errorMessage = "El link de verificación ya fue usado o expiró. Por favor solicita un nuevo link en el formulario de registro.";
          }
          
          console.error("Error 400:", errorMessage);
          setError(errorMessage);
        } else if (err.response?.status === 404) {
          setError("Página no encontrada. Verifica que la URL sea correcta.");
        } else if (err.response) {
          setError(`Error: ${err.response.status}. ${err.response.data?.error || "Error desconocido"}`);
        } else if (err.message === 'Network Error') {
          setError("Error de conexión. Verifica tu conexión a internet.");
        } else {
          setError("Error al verificar el correo. Por favor intenta de nuevo.");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="flex flex-col flex-1 w-full h-screen overflow-hidden bg-white dark:bg-gray-900">
      <div className="w-full pt-6 px-4 sm:pt-10">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon className="size-5" />
            Back to dashboard
          </Link>
        </div>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full px-4">
        <div className="max-w-2xl mx-auto w-full">
          <div className="mb-8 sm:mb-12">
            <h1 className="mb-3 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              Verificación de Correo
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Estamos verificando tu correo electrónico para activar tu cuenta
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-12 px-6 sm:px-12 bg-gray-50 dark:bg-gray-800 rounded-2xl space-y-8">
            {loading && (
              <div className="flex flex-col items-center space-y-6">
                <div className="w-20 h-20 border-4 border-gray-300 dark:border-gray-600 border-t-brand-500 dark:border-t-brand-400 rounded-full animate-spin" />
                <div className="text-center">
                  <p className="text-xl text-gray-700 dark:text-gray-200 font-medium">
                    Verificando tu correo...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Por favor espera mientras procesamos tu verificación
                  </p>
                </div>
              </div>
            )}

            {!loading && verified && !error && (
              <div className="flex flex-col items-center space-y-6 w-full">
                <div className="p-6 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircleIcon className="size-16 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-3">
                    ¡Éxito!
                  </h2>
                  <p className="text-lg text-gray-700 dark:text-gray-200 mb-4">
                    {message}
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Tu correo ha sido verificado correctamente. Serás redirigido a la página de inicio de sesión en 3 segundos...
                    </p>
                  </div>
                </div>
                <Link
                  to="/signin"
                  className="px-8 py-3 text-base font-semibold text-white transition rounded-lg bg-brand-500 shadow-lg hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 w-full text-center"
                >
                  Ir a Iniciar Sesión Ahora
                </Link>
              </div>
            )}

            {!loading && error && !verified && (
              <div className="flex flex-col items-center space-y-6 w-full">
                <div className="p-6 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <AlertIcon className="size-16 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-3">
                    Error en la Verificación
                  </h2>
                  <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
                    {error}
                  </p>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      Es posible que el token haya expirado (válido por 24 horas) o sea inválido. Por favor solicita un nuevo link de verificación.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <Link
                    to="/signup"
                    className="px-8 py-3 text-base font-semibold text-white transition rounded-lg bg-brand-500 shadow-lg hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 text-center"
                  >
                    Volver al Registro
                  </Link>
                  <Link
                    to="/signin"
                    className="px-8 py-3 text-base font-semibold text-brand-600 transition border-2 border-brand-500 rounded-lg hover:bg-brand-50 dark:text-brand-400 dark:border-brand-400 dark:hover:bg-brand-900/10 text-center"
                  >
                    Iniciar Sesión
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
