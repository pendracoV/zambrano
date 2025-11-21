import { useState, useEffect } from "react";
import { useAuth } from "../../context/Authcontext";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

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
  } | number;
}

export default function UserAddressCard() {
  const { user, setUser } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState({
    country: user?.country || "",
    department: user?.department || null,
    city: user?.city || null,
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Actualizar formData cuando el usuario cambia
  useEffect(() => {
    setFormData({
      country: user?.country || "",
      department: user?.department || null,
      city: user?.city || null,
    });
  }, [user]);

  // Cargar departamentos y ciudades al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadDepartmentsAndCities();
    }
  }, [isOpen]);

  // Filtrar ciudades cuando cambia el departamento
  useEffect(() => {
    if (formData.department) {
      const filtered = cities.filter((city) => {
        const deptId = typeof city.department === "object" ? city.department.id : city.department;
        return deptId === formData.department;
      });
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [formData.department, cities]);

  const loadDepartmentsAndCities = async () => {
    try {
      const [deptsRes, citiesRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/departments/"),
        fetch("http://127.0.0.1:8000/api/cities/"),
      ]);

      if (deptsRes.ok && citiesRes.ok) {
        const deptsData = await deptsRes.json();
        const citiesData = await citiesRes.json();
        setDepartments(deptsData);
        setCities(citiesData);
      } else {
        setError("Error cargando departamentos y ciudades");
      }
    } catch (err) {
      console.error("Error loading departments/cities:", err);
      setError("Error de conexión al cargar datos");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "department" || name === "city" ? (value ? parseInt(value) : null) : value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://127.0.0.1:8000/api/users/profile/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          country: formData.country,
          department: formData.department,
          city: formData.city,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        closeModal();
      } else {
        const errorData = await response.json();
        setError(errorData.city?.[0] || errorData.detail || "Error al actualizar ubicación");
      }
    } catch (err) {
      setError("Error de conexión");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Location Information
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              {/* Country */}
              {user?.country && (
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Country
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {user.country}
                  </p>
                </div>
              )}

              {/* Department - usa department_name */}
              {(user as any)?.department_name && (
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Department
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {(user as any).department_name}
                  </p>
                </div>
              )}

              {/* City - usa city_name */}
              {(user as any)?.city_name && (
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    City
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {(user as any).city_name}
                  </p>
                </div>
              )}
            </div>

            {/* If no location info, show message */}
            {!user?.country && !(user as any)?.department_name && !(user as any)?.city_name && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No location information added yet.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Location Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your location details.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Country</Label>
                  <Input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter country"
                  />
                </div>

                <div>
                  <Label>Department</Label>
                  <select
                    name="department"
                    value={formData.department || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>City</Label>
                  <select
                    name="city"
                    value={formData.city || ""}
                    onChange={handleChange}
                    disabled={!formData.department}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {formData.department ? "Select a city" : "Select a department first"}
                    </option>
                    {filteredCities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} disabled={loading}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
