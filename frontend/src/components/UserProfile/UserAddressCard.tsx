import { useContext } from "react";
import { AuthContext } from "../../context/Authcontext";

export default function UserAddressCard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6 mb-4">
        Ubicación
      </h4>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
        {user?.country && (
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              País
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {user.country}
            </p>
          </div>
        )}

        {user?.department_name && (
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Departamento
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {user.department_name}
            </p>
          </div>
        )}

        {user?.city_name && (
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Ciudad
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {user.city_name}
            </p>
          </div>
        )}

        {user?.document_type && (
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Tipo de Documento
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {user.document_type}
            </p>
          </div>
        )}

        {user?.document && (
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Número de Documento
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {user.document}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
