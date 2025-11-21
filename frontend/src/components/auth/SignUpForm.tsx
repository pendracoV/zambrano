import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

interface SelectOption {
  id: number;
  name: string;
}

// Componente reutilizable para campos de input
const FormField = ({ 
  label, 
  error, 
  required = false, 
  children, 
  className = "" 
}: { 
  label: string; 
  error?: string; 
  required?: boolean; 
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <Label>
      {label}
      {required && <span className="text-error-500">*</span>}
    </Label>
    {children}
    {error && (
      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
        {error}
      </p>
    )}
  </div>
);

// Componente reutilizable para inputs de texto
const TextInput = ({ 
  error, 
  ...props 
}: { 
  error?: string;
  [key: string]: any;
}) => (
  <Input
    {...props}
    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition ${
      error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
    }`}
  />
);

// Componente reutilizable para selects
const SelectInput = ({ 
  error, 
  children,
  ...props 
}: { 
  error?: string;
  children: React.ReactNode;
  [key: string]: any;
}) => (
  <select
    {...props}
    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition ${
      error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
    }`}
  >
    {children}
  </select>
);



export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [country] = useState("Colombia"); // Solo Colombia
  const [departments, setDepartments] = useState<SelectOption[]>([]);
  const [cities, setCities] = useState<SelectOption[]>([]);
  const [documentTypes, setDocumentTypes] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Calcular la fecha máxima (18 años atrás desde hoy)
  const getMaxBirthDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    birth_date: "",
    document_type: "",
    document: "",
    country: "Colombia",
    department: "",
    city: "",
    city_text: "",
    department_text: "",
    password: "",
    password_confirm: ""
  });
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Crear instancia de axios
  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [deptRes, docTypeRes] = await Promise.all([
          apiClient.get('/departments/'),
          apiClient.get('/catalogs/document-types/')
        ]);

        if (deptRes.data) {
          setDepartments(deptRes.data);
        }
        if (docTypeRes.data) {
          setDocumentTypes(docTypeRes.data);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Cargar ciudades cuando cambia el departamento
  useEffect(() => {
    if (formData.department && country === "Colombia") {
      const fetchCities = async () => {
        try {
          const res = await apiClient.get('/cities/', {
            params: { department_id: formData.department }
          });
          if (res.data) {
            setCities(res.data);
          }
        } catch (error) {
          console.error("Error loading cities:", error);
        }
      };

      fetchCities();
    }
  }, [formData.department, country]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    // Filtrar caracteres según el campo
    if (name === "username") {
      // Solo alphanumeric y guiones bajos
      value = value.replace(/[^a-zA-Z0-9_]/g, "");
    } else if (name === "first_name" || name === "last_name") {
      // Solo letras, espacios, acentos y ñ
      value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    } else if (name === "document" || name === "phone") {
      // Solo números
      value = value.replace(/[^0-9]/g, "");
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    // Validar checkbox
    if (!isChecked) {
      setErrors({ general: ["Debes aceptar los Términos y Condiciones"] });
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/users/register/', formData);

      // Registro exitoso
      setSuccessMessage("¡Registro exitoso! Verifica tu correo electrónico para activar tu cuenta.");
      setFormData({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        birth_date: "",
        document_type: "",
        document: "",
        country: "Colombia",
        department: "",
        city: "",
        city_text: "",
        department_text: "",
        password: "",
        password_confirm: ""
      });
      setIsChecked(false);
      // Aquí puedes redirigir o realizar otra acción
      // setTimeout(() => navigate("/signin"), 2000);
    } catch (error: any) {
      // Manejo de errores
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: ["Ocurrió un error. Por favor intenta de nuevo."] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your information to create an account!
            </p>
          </div>
          <div>
            {/* Mensaje de éxito */}
            {successMessage && (
              <div className="p-3 mb-5 text-sm text-green-700 bg-green-100 border border-green-400 rounded-lg dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                {successMessage}
              </div>
            )}

            {/* Error general */}
            {errors.general && (
              <div className="p-3 mb-5 text-sm text-red-700 bg-red-100 border border-red-400 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                {errors.general[0]}
              </div>
            )}

            {loading ? (
              <div className="p-5 text-center text-gray-600 dark:text-gray-400">
                Cargando datos...
              </div>
            ) : successMessage ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-center">
                  <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
                    ¡Registro Exitoso!
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {successMessage}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-6">
                    Se ha enviado un enlace de verificación a tu correo electrónico.
                  </p>
                </div>
                <Link
                  to="/signin"
                  className="px-6 py-2 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700"
                >
                  Ir a Iniciar Sesión
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto pr-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Username */}
                  <FormField label="Usuario" required error={errors.username?.[0]}>
                    <TextInput
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Sin espacios, letras y números"
                      maxLength={30}
                    />
                  </FormField>

                  {/* Email */}
                  <FormField label="Email" error={errors.email?.[0]}>
                    <TextInput
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="correo@ejemplo.com"
                      maxLength={50}
                    />
                  </FormField>

                  {/* First Name */}
                  <FormField label="Nombre" required error={errors.first_name?.[0]}>
                    <TextInput
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Solo letras"
                      maxLength={50}
                    />
                  </FormField>

                  {/* Last Name */}
                  <FormField label="Apellido" required error={errors.last_name?.[0]}>
                    <TextInput
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Solo letras"
                      maxLength={50}
                    />
                  </FormField>

                  {/* Document Type */}
                  <FormField label="Tipo de documento" required error={errors.document_type?.[0]}>
                    <SelectInput
                      id="document_type"
                      name="document_type"
                      value={formData.document_type}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecciona un tipo de documento</option>
                      {documentTypes.map(doc => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name}
                        </option>
                      ))}
                    </SelectInput>
                  </FormField>

                  {/* Document */}
                  <FormField label="Número de documento" required error={errors.document?.[0]}>
                    <TextInput
                      type="text"
                      id="document"
                      name="document"
                      value={formData.document}
                      onChange={handleInputChange}
                      placeholder="Solo números"
                      maxLength={15}
                    />
                  </FormField>

                  {/* Phone */}
                  <FormField label="Teléfono" error={errors.phone?.[0]}>
                    <TextInput
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Solo números"
                      maxLength={15}
                    />
                  </FormField>

                  {/* Birth Date */}
                  <FormField label="Fecha de nacimiento" error={errors.birth_date?.[0]}>
                    <TextInput
                      type="date"
                      id="birth_date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      max={getMaxBirthDate()}
                    />
                  </FormField>

                  {/* Country - Solo Colombia, no mostrar */}

                  {/* Department - Siempre mostrado */}
                  <FormField label="Departamento" required error={errors.department?.[0]}>
                    <SelectInput
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecciona un departamento</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </SelectInput>
                  </FormField>

                  {/* City */}
                  <FormField label="Ciudad" required error={errors.city?.[0]}>
                    <SelectInput
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecciona una ciudad</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </SelectInput>
                  </FormField>

                  {/* Password */}
                  <FormField label="Contraseña" required error={errors.password?.[0]} className="col-span-1 md:col-span-2">
                    <div className="relative">
                      <TextInput
                        placeholder="Ingresa tu contraseña"
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        maxLength={100}
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
                  </FormField>

                  {/* Password Confirm */}
                  <FormField label="Confirmar contraseña" required error={errors.password_confirm?.[0]}>
                    <div className="relative">
                      <TextInput
                        placeholder="Confirma tu contraseña"
                        type={showPasswordConfirm ? "text" : "password"}
                        id="password_confirm"
                        name="password_confirm"
                        value={formData.password_confirm}
                        onChange={handleInputChange}
                        maxLength={100}
                      />
                      <span
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPasswordConfirm ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                  </FormField>

                  {/* Terms and Conditions - Full Width */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="flex items-start cursor-pointer space-x-2">
                      <div className="relative mt-1">
                        <Checkbox
                          checked={isChecked}
                          onChange={(checked: boolean) => setIsChecked(checked)}
                        />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-400">
                        Acepto los{" "}
                        <Link
                          to="/terms"
                          className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
                        >
                          Términos y Condiciones
                        </Link>
                      </span>
                    </label>
                  </div>

                  {/* Button - Full Width */}
                  <div className="col-span-1 md:col-span-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-brand-600 dark:hover:bg-brand-700"
                    >
                      {isLoading ? "Registrando..." : "Registrarse"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                ¿Ya tienes cuenta? {""}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}