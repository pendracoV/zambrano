import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";

interface ManageRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; // Replace 'any' with a proper User interface
  onUpdate: (selectedRole: string) => void;
}

const ManageRoleModal = ({ isOpen, onClose, user, onUpdate }: ManageRoleModalProps) => {
  // The user's current primary role is the first one in the array, if it exists
  const currentRole = user?.role && user.role.length > 0 ? user.role[0] : 'Participant';
  const [selectedRole, setSelectedRole] = useState(currentRole);

  useEffect(() => {
    const currentRole = user?.role && user.role.length > 0 ? user.role[0] : 'Participant';
    setSelectedRole(currentRole);
  }, [user]);

  const handleSave = () => {
    onUpdate(selectedRole);
    onClose();
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
          Manage Role for: {user.first_name} {user.last_name}
        </h3>
        <form>
          <div className="space-y-2">
            <Label htmlFor="role-select">Assign New Role</Label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
            >
              <option value="Administrador">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Participante">Participant</option>
              <option value="Organizador">Organizer</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Note: Assigning a new role will replace all existing roles for this user.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Role</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ManageRoleModal;
