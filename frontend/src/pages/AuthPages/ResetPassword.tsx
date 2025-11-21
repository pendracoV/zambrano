import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import axios from "axios";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import AuthLayout from "./AuthPageLayout";
import PageMeta from "../../components/common/PageMeta";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (!token) {
            setError("Token inválido o faltante.");
            return;
        }

        setIsLoading(true);

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/users/password-reset-confirm/`,
                {
                    token,
                    password,
                    password_confirm: confirmPassword,
                }
            );
            setMessage("Contraseña restablecida correctamente. Redirigiendo...");
            setTimeout(() => {
                navigate("/signin");
            }, 3000);
        } catch (err: unknown) {
            console.error("Error resetting password:", err);
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.error || "Error al restablecer la contraseña.");
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
                title="Restablecer Contraseña | GestiFy"
                description="Página de restablecimiento de contraseña para GestiFy"
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
                                    Restablecer Contraseña
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Ingresa tu nueva contraseña.
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
                                                Nueva Contraseña <span className="text-error-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Ingresa tu nueva contraseña"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    disabled={isLoading}
                                                    required
                                                />
                                                <span
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                                >
                                                    {showPassword ? (
                                                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                                    ) : (
                                                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <Label>
                                                Confirmar Contraseña <span className="text-error-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirma tu nueva contraseña"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    disabled={isLoading}
                                                    required
                                                />
                                                <span
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                                    ) : (
                                                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <Button
                                                type="submit"
                                                className="w-full"
                                                size="sm"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? "Restableciendo..." : "Restablecer contraseña"}
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
