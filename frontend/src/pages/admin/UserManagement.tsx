import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { useAuth } from "../../context/Authcontext";
import Input from "../../components/form/input/InputField";
import EditUserModal from "../../components/admin/EditUserModal";
import ManageRoleModal from "../../components/admin/ManageRoleModal";
import DeleteUserModal from "../../components/admin/DeleteUserModal";

// Define the User interface based on the API response
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string[];
  is_active: boolean;
  is_superuser: boolean;
}

const UserManagement = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // State for modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isRoleModalOpen, setRoleModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Handlers to open modals
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleAssignRole = (user: User) => {
    setSelectedUser(user);
    setRoleModalOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  // API call handlers
  const handleUpdateUser = async (updatedUser: any) => {
    // --- INICIO DE LA SOLUCIÓN ---

      // 1. Clonamos el objeto para no modificar el estado original
      const payload = { ...updatedUser };

      // 2. Eliminamos TODOS los campos de solo lectura que envía el serializer.
      //    El backend no los acepta de vuelta.
      delete payload.role;
      delete payload.department_name;
      delete payload.city_name;
      delete payload.eventos_inscritos;
      delete payload.password; // Nunca se debe enviar la contraseña en un PUT de perfil

      // 3. (Importante) Corregimos los campos de ForeignKey.
      // El modal los envía como texto (ej. "Cédula de Ciudadanía"),
      // pero el backend espera el ID (ej. 1).
      // Por AHORA, para que el PUT no falle, los borraremos.
      // (La solución real es usar <select> en el modal, pero eso es un paso 2)
      delete payload.document_type;
      delete payload.department;
      delete payload.city;

      // --- FIN DE LA SOLUCIÓN ---
    //console.log("Enviando este payload al backend:", JSON.stringify(payload, null, 2));
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${updatedUser.id}/`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        fetchUsers(); // Refresh user list
      } else {
        console.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleUpdateRole = async (role: string) => {
    if (!selectedUser) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${selectedUser.id}/assign-role/`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      if (response.ok) {
        fetchUsers(); // Refresh user list
      } else {
        console.error("Failed to assign role");
      }
    } catch (error) {
      console.error("Error assigning role:", error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${selectedUser.id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      if (response.ok) {
        fetchUsers(); // Refresh user list
        setDeleteModalOpen(false);
      } else {
        console.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };


  const filteredUsers = users
    .filter((user) => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const email = user.email.toLowerCase();
      const search = searchTerm.toLowerCase();
      return fullName.includes(search) || email.includes(search);
    })
    .filter((user) => {
      if (roleFilter === "All") return true;
      return user.role.includes(roleFilter);
    });

  return (
    <>
      <PageMeta title="User Management | GestiFy" />
      <PageBreadcrumb pageTitle="User Management" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="flex flex-col gap-4 mb-5 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            User List
          </h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            >
              <option value="All">All Roles</option>
              <option value="Administrador">Administrador</option>
              <option value="Staff">Staff</option>
              <option value="Participante">Participante</option>
              <option value="Organizador">Organizador</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden border border-gray-200 rounded-xl dark:border-white/[0.05]">
          <div className="max-w-full overflow-x-auto">
            {loading ? (
              <p className="p-4">Loading...</p>
            ) : (
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader>Name</TableCell>
                    <TableCell isHeader>Email</TableCell>
                    <TableCell isHeader>Role(s)</TableCell>
                    <TableCell isHeader>Status</TableCell>
                    <TableCell isHeader>Superuser</TableCell>
                    <TableCell isHeader>Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.role.map((role) => (
                            <Badge key={role} color={role === 'Admin' ? 'error' : 'primary'}>{role}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge color={user.is_active ? "success" : "error"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge color={user.is_superuser ? "info" : "secondary"}>
                          {user.is_superuser ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>Edit</Button>
                          <Button size="sm" variant="outline" onClick={() => handleAssignRole(user)}>Assign Role</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(user)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={selectedUser}
          onUpdate={handleUpdateUser}
        />
      )}

      {isRoleModalOpen && selectedUser && (
        <ManageRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => setRoleModalOpen(false)}
          user={selectedUser}
          onUpdate={handleUpdateRole}
        />
      )}

      {isDeleteModalOpen && selectedUser && (
        <DeleteUserModal
          isOpen={isDeleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          user={selectedUser}
          onConfirm={handleDeleteUser}
        />
      )}
    </>
  );
};

export default UserManagement;
