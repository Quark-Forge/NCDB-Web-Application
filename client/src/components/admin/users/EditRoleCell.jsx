import { useState } from "react";
import { useUpdateUserRoleMutation } from "../../../slices/usersApiSlice";
import { Check, Pencil, X } from "lucide-react";
import { toast } from "react-toastify";

const EditRoleCell = ({ user, roles, refetchUsers }) => {
  const [selectedRole, setSelectedRole] = useState(user.role_id);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updateUserRole] = useUpdateUserRoleMutation();

  const handleUpdate = async () => {
    if (selectedRole === user.role_id) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await updateUserRole({ userId: user.id, roleId: selectedRole }).unwrap();
      toast.success('Role updated successfully');
      refetchUsers();
      setIsEditing(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <div className="flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none cursor-pointer w-30"
            disabled={isLoading}
          >
            {roles?.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            <button
              onClick={handleUpdate}
              disabled={isLoading}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setSelectedRole(user.role_id);
              }}
              disabled={isLoading}
              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <>
          <span className="text-sm font-medium text-gray-700 capitalize">
            {roles?.find((r) => r.id === user.role_id)?.name || user.role_name}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
          >
            <Pencil size={14} />
          </button>
        </>
      )}
    </div>
  );
};

export default EditRoleCell;