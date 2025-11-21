import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircleIcon } from "../../icons";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Token de verificación no proporcionado. Por favor, verifica el link del email.");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/users/verify-email/?token=${token}`
        );

        if (response.ok) {
          setStatus("success");
          setMessage("¡Correo verificado exitosamente! Tu cuenta está activa.");
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            navigate("/signin");
          }, 3000);
        } else if (response.status === 400) {
          setStatus("error");
          const text = await response.text();
          setMessage(text || "El token de verificación es inválido o ha expirado. Por favor, registra nuevamente.");
        } else if (response.status === 404) {
          setStatus("error");
          setMessage("Usuario no encontrado. Por favor, registra nuevamente.");
        } else {
          setStatus("error");
          setMessage("Error al verificar el correo. Por favor, intenta nuevamente más tarde.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.");
        console.error("Verification error:", error);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md px-6 py-8 bg-white rounded-2xl shadow-lg dark:bg-gray-800">
        {/* Loading State */}
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-brand-500 rounded-full animate-spin dark:border-gray-600 dark:border-t-brand-400"></div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Verificando tu correo...
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Por favor espera mientras verificamos tu dirección de correo electrónico.
            </p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full dark:bg-green-900/20">
              <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
              ¡Verificación Exitosa!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {message}
            </p>
            <div className="w-full pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                Serás redirigido al inicio de sesión en 3 segundos...
              </p>
            </div>
            <button
              onClick={() => navigate("/signin")}
              className="w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors"
            >
              Ir al inicio de sesión
            </button>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 flex items-center justify-center bg-red-100 rounded-full dark:bg-red-900/20">
              <svg
                className="w-10 h-10 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
              Error en la Verificación
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {message}
            </p>
            <div className="w-full space-y-2 pt-4">
              <button
                onClick={() => navigate("/signin")}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 transition-colors"
              >
                Volver al Inicio de Sesión
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="w-full px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 dark:text-brand-400 dark:bg-brand-900/20 dark:hover:bg-brand-900/40 transition-colors border border-brand-200 dark:border-brand-800"
              >
                Registrarse de Nuevo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
