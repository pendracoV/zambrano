import { useAuth } from "../../context/Authcontext";

export default function UserInfoCard() {
  const { user } = useAuth();

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
        Información Personal
      </h4>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7">
        {/* Nombre */}
        <div>
          <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
            Nombre
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {user?.first_name || "—"}
          </p>
        </div>

        {/* Apellido */}
        <div>
          <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
            Apellido
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {user?.last_name || "—"}
          </p>
        </div>

        {/* Correo electrónico */}
        <div>
          <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
            Correo Electrónico
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {user?.email || "—"}
          </p>
        </div>

        {/* Teléfono */}
        <div>
          <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
            Teléfono
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {user?.phone || "No proporcionado"}
          </p>
        </div>

        {/* Fecha de nacimiento */}
        {user?.birth_date && (
          <div>
            <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
              Fecha de Nacimiento
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {new Date(user.birth_date).toLocaleDateString("es-CO")}
            </p>
          </div>
        )}

        {/* Documento */}
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

        {/* País */}
        <div>
          <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
            País
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {user?.country || "—"}
          </p>
        </div>

        {/* Departamento */}
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

        {/* Ciudad */}
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
      </div>

      {/* Nota: Para editar correo y teléfono, usa el botón "Editar Perfil" en la sección de arriba */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 <strong>Tip:</strong> Para cambiar tu correo electrónico o teléfono, haz clic en "Editar Perfil" en la sección de arriba.
        </p>
      </div>
    </div>
  );
}

