import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

interface Department {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
  department: {
    id: number;
    name: string;
  };
}

interface DocumentType {
  id: number;
  name: string;
}

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
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
    password: "",
    password_confirm: ""
  });
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar departamentos, ciudades y tipos de documento al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar departamentos
        const deptResponse = await fetch(`${import.meta.env.VITE_API_URL}/departments/`);
        if (deptResponse.ok) {
          const deptData = await deptResponse.json();
          const deptsArray = Array.isArray(deptData) ? deptData : (deptData.results || []);
          console.log("Departments loaded:", deptsArray);
          setDepartments(deptsArray);
        } else {
          console.error("Error loading departments:", deptResponse.status);
        }

        // Cargar ciudades
        const citiesResponse = await fetch(`${import.meta.env.VITE_API_URL}/cities/`);
        if (citiesResponse.ok) {
          const citiesData = await citiesResponse.json();
          const citiesArray = Array.isArray(citiesData) ? citiesData : (citiesData.results || []);
          console.log("Cities loaded:", citiesArray);
          setCities(citiesArray);
        } else {
          console.error("Error loading cities:", citiesResponse.status);
        }

        // Cargar tipos de documento
        const docTypesResponse = await fetch(`${import.meta.env.VITE_API_URL}/document-types/`);
        if (docTypesResponse.ok) {
          const docTypesData = await docTypesResponse.json();
          console.log("Document Types loaded:", docTypesData);
          // docTypesData es un array directo, no tiene .results
          setDocumentTypes(Array.isArray(docTypesData) ? docTypesData : (docTypesData.results || []));
        } else {
          console.error("Error loading document types:", docTypesResponse.status);
        }
      } catch (error) {
        console.error("Error loading form data:", error);
      }
    };

    fetchData();
  }, []);

  // Filtrar ciudades cuando cambia el departamento
  useEffect(() => {
    if (formData.department) {
      const deptId = typeof formData.department === 'number' ? formData.department : parseInt(formData.department);
      const filtered = cities.filter(city => city.department.id === deptId);
      console.log("Filtered cities for department", deptId, ":", filtered);
      setFilteredCities(filtered);
      // Limpiar ciudad seleccionada si cambió el departamento
      if (formData.city && !filtered.some(c => c.id === (typeof formData.city === 'number' ? formData.city : parseInt(formData.city)))) {
        setFormData(prev => ({ ...prev, city: "" }));
      }
    } else {
      setFilteredCities([]);
    }
  }, [formData.department, cities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    
    // Convertir valores numéricos para selects de IDs
    let finalValue: any = value;
    if (['document_type', 'department', 'city'].includes(name) && value !== "") {
      finalValue = parseInt(value, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
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
      setErrors({ general: ["You must agree to the Terms and Conditions"] });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Si hay errores de validación
        setErrors(data);
      } else {
        // Registro exitoso
        setSuccessMessage("Account created successfully! Please check your email to verify your account.");
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
          password: "",
          password_confirm: ""
        });
        setIsChecked(false);
        // Aquí puedes redirigir o realizar otra acción
        // setTimeout(() => navigate("/signin"), 2000);
      }
    } catch (error) {
      setErrors({ general: ["An error occurred. Please try again."] });
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

            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Username */}
                <div>
                  <Label>
                    Username<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose a username"
                    className={errors.username ? "border-red-500" : ""}
                  />
                  {errors.username && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.username[0]}
                    </p>
                  )}
                </div>

                {/* First Name */}
                <div>
                  <Label>
                    First Name<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className={errors.first_name ? "border-red-500" : ""}
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.first_name[0]}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <Label>
                    Last Name<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className={errors.last_name ? "border-red-500" : ""}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.last_name[0]}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.email[0]}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label>
                    Phone<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.phone[0]}
                    </p>
                  )}
                </div>

                {/* Birth Date */}
                <div>
                  <Label>
                    Birth Date<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    id="birth_date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleInputChange}
                    className={errors.birth_date ? "border-red-500" : ""}
                  />
                  {errors.birth_date && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.birth_date[0]}
                    </p>
                  )}
                </div>

                {/* Document Type */}
                <div>
                  <Label>
                    Document Type
                  </Label>
                  <select
                    id="document_type"
                    name="document_type"
                    value={formData.document_type}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                      errors.document_type ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a document type</option>
                    {documentTypes.map(docType => (
                      <option key={docType.id} value={docType.id}>
                        {docType.name}
                      </option>
                    ))}
                  </select>
                  {errors.document_type && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.document_type[0]}
                    </p>
                  )}
                </div>

                {/* Document */}
                <div>
                  <Label>
                    Document Number
                  </Label>
                  <Input
                    type="text"
                    id="document"
                    name="document"
                    value={formData.document}
                    onChange={handleInputChange}
                    placeholder="Enter your document number"
                    className={errors.document ? "border-red-500" : ""}
                  />
                  {errors.document && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.document[0]}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <Label>
                    Department<span className="text-error-500">*</span>
                  </Label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                      errors.department ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.department[0]}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <Label>
                    City<span className="text-error-500">*</span>
                  </Label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!formData.department}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    } ${!formData.department ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <option value="">Select a city</option>
                    {filteredCities.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.city[0]}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={errors.password ? "border-red-500" : ""}
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
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.password[0]}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <Label>
                    Confirm Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Confirm your password"
                      type={showConfirmPassword ? "text" : "password"}
                      id="password_confirm"
                      name="password_confirm"
                      value={formData.password_confirm}
                      onChange={handleInputChange}
                      className={errors.password_confirm ? "border-red-500" : ""}
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
                  {errors.password_confirm && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.password_confirm[0]}
                    </p>
                  )}
                </div>

                {/* Terms and Conditions Checkbox */}
                <div>
                  <label className="flex items-start cursor-pointer">
                    <div className="relative">
                      <Checkbox
                        checked={isChecked}
                        onChange={(checked: boolean) => setIsChecked(checked)}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-400">
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                      >
                        Terms and Conditions
                      </Link>
                    </span>
                  </label>
                </div>

                {/* Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Signing Up..." : "Sign Up"}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account? {""}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}