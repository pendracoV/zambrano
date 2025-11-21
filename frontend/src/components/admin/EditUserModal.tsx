import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; // Replace 'any' with a proper User interface
  onUpdate: (updatedUser: any) => void;
}

const EditUserModal = ({ isOpen, onClose, user, onUpdate }: EditUserModalProps) => {
  const [formData, setFormData] = useState(user);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData((prev: any) => ({ ...prev, [name]: checked }));
    } else {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    onUpdate(formData);
    onClose();
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
          Edit User: {user.first_name} {user.last_name}
        </h3>
        <form>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="col-span-1">
              <Label>First Name</Label>
              <Input name="first_name" value={formData?.first_name || ''} onChange={handleChange} />
            </div>
            <div className="col-span-1">
              <Label>Last Name</Label>
              <Input name="last_name" value={formData?.last_name || ''} onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <Label>Email</Label>
              <Input name="email" type="email" value={formData?.email || ''} onChange={handleChange} />
            </div>
            <div className="col-span-1">
              <Label>Phone</Label>
              <Input name="phone" value={formData?.phone || ''} onChange={handleChange} />
            </div>
            <div className="col-span-1">
              <Label>Document Type</Label>
              <Input name="document_type" value={formData?.document_type || ''} onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <Label>Document Number</Label>
              <Input name="document" value={formData?.document || ''} onChange={handleChange} />
            </div>
            <div className="col-span-1">
              <Label>Country</Label>
              <Input name="country" value={formData?.country || ''} onChange={handleChange} />
            </div>
            <div className="col-span-1">
              <Label>Department</Label>
              <Input name="department" value={formData?.department || ''} onChange={handleChange} />
            </div>
            <div className="col-span-1">
              <Label>City</Label>
              <Input name="city" value={formData?.city || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <input type="checkbox" name="is_staff" checked={formData?.is_staff || false} onChange={handleChange} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <Label className="ml-2">Is Staff?</Label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" name="is_superuser" checked={formData?.is_superuser || false} onChange={handleChange} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <Label className="ml-2">Is Superuser?</Label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" name="is_active" checked={formData?.is_active || false} onChange={handleChange} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <Label className="ml-2">Is Active?</Label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditUserModal;
