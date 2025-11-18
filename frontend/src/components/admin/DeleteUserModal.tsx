import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; // Replace 'any' with a proper User interface
  onConfirm: () => void;
}

const DeleteUserModal = ({ isOpen, onClose, user, onConfirm }: DeleteUserModalProps) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Confirm Deletion
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Are you sure you want to delete the user{" "}
          <span className="font-bold">{user.first_name} {user.last_name}</span>?
        </p>
        <p className="mt-2 text-sm text-red-500">
          This action is permanent and cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Yes, Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteUserModal;
