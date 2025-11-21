import { useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import { ChevronLeftIcon } from "../../icons";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import AuthLayout from "./AuthPageLayout";
import PageMeta from "../../components/common/PageMeta";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/users/password-reset/`,
        { email }
      );
      setMessage("Se ha enviado un enlace de recuperación a tu correo electrónico.");
    } catch (err: unknown) {
      console.error("Error sending password reset email:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || "Error al enviar el correo.");
      } else {
        setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Recuperar Contraseña | GestiFy"
        description="Página de recuperación de contraseña para GestiFy"
      />
      <AuthLayout>
        <div className="flex flex-col flex-1">
          <div className="w-full max-w-md pt-10 mx-auto">
            <Link
              to="/signin"
              className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ChevronLeftIcon className="size-5" />
              Volver al inicio de sesión
            </Link>
          </div>
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  Recuperar Contraseña
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ingresa tu correo electrónico para recibir un enlace de recuperación.
                </p>
              </div>
              <div>
                <form onSubmit={handleSubmit}>
                  {message && (
                    <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900/20 dark:text-green-400">
                      {message}
                    </div>
                  )}
                  {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/20 dark:text-red-400">
                      {error}
                    </div>
                  )}
                  <div className="space-y-6">
                    <div>
                      <Label>
                        Email <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="email"
                        placeholder="info@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div>
                      <Button
                        type="submit"
                        className="w-full"
                        size="sm"
                        disabled={isLoading}
                      >
                        {isLoading ? "Enviando..." : "Enviar enlace"}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
