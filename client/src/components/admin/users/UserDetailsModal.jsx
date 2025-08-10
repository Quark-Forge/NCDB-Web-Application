import { X, Mail, User, Shield, Calendar, Clock, Phone } from "lucide-react";
import { FaAddressBook } from "react-icons/fa";

const UserDetailModal = ({
    user,
    onClose,
}) => {

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-brightness-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in fade-in-90 zoom-in-90">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Modal container */}
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    User Details
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            {user.name}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            ID: {user.id}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-start space-x-2">
                                        <Mail className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">
                                                Email
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <Shield className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">
                                                Role
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {user.role_name || 'No role assigned'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <Phone className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">
                                                Phone
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {user.contact_number || 'No role assigned'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <FaAddressBook className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">
                                                address
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {user.address || 'No role assigned'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <User className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">
                                                Status
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-900">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${!user.deletedAt
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {!user.deletedAt ? 'Active' : 'Inactive'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <Calendar className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">
                                                Created At
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {user.deletedAt && (
                                        <div className="flex items-start space-x-2 sm:col-span-2">
                                            <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">
                                                    Deleted At
                                                </h4>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {new Date(user.deletedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;