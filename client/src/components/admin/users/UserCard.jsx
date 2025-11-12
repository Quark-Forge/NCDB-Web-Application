import { RefreshCw, Trash2, Eye } from "lucide-react";
import { useGetRolesQuery } from "../../../slices/rolesApiSlice";
import EditRoleCell from "../../admin/users/EditRoleCell";
import { useRestoreUserMutation } from "../../../slices/usersApiSlice";
import { toast } from "react-toastify";
import { useState } from "react";
import UserDetailModal from "./UserDetailsModal";

const UserCard = ({ filteredUsers, refetch, deleteHandle }) => {
    const { data: rolesData, error: roleError } = useGetRolesQuery();
    const roles = rolesData?.data || [];
    const [restoreUser] = useRestoreUserMutation();
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRestore = async (userId) => {
        try {
            await restoreUser(userId).unwrap();
            toast.success('User restored successfully!');
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || 'Error restoring user');
        }
    };

    const openUserDetails = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    return (
        <div>
            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3 p-3">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div
                                className="flex items-center space-x-3 cursor-pointer"
                                onClick={() => openUserDetails(user)}
                            >
                                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${!user.deletedAt ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {!user.deletedAt ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <EditRoleCell user={user} roles={roles} refetchUsers={refetch} />
                            <div className="flex space-x-2">
                                <button
                                    className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-50 transition-colors"
                                    onClick={() => openUserDetails(user)}
                                >
                                    <Eye size={16} />
                                </button>
                                {!user.deletedAt && (
                                    <button
                                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                                        onClick={() => deleteHandle({ userID: user.id })}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                {user.deletedAt && (
                                    <button
                                        className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors ml-2"
                                        onClick={() => handleRestore(user.id)}
                                    >
                                        <RefreshCw size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td
                                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                    onClick={() => openUserDetails(user)}
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer"
                                    onClick={() => openUserDetails(user)}
                                >
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <EditRoleCell user={user} roles={roles} refetchUsers={refetch} />
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                    onClick={() => openUserDetails(user)}
                                >
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${!user.deletedAt ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {!user.deletedAt ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        className="text-blue-400 hover:text-blue-600 rounded-md p-1 hover:bg-blue-50 transition-colors"
                                        onClick={() => openUserDetails(user)}
                                    >
                                        <Eye size={18} />
                                    </button>
                                    {!user.deletedAt && (
                                        <button
                                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                                            onClick={() => deleteHandle({ userID: user.id })}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                    {user.deletedAt && (
                                        <button
                                            className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors ml-2"
                                            onClick={() => handleRestore(user.id)}
                                        >
                                            <RefreshCw size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={closeModal}
                />
            )}
        </div>
    )
}

export default UserCard;