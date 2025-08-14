import { X, Mail, Phone, MapPin, Calendar, Clock, Building2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

const SupplierDetailModel = ({
    supplier,
    onClose,
    onEdit,
    onDelete,
    canEditDelete
}) => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    
    const handleDeleteConfirm = () => {
        onDelete(supplier.id);
        onClose();
    };

    const handleEdit = () => {
        onEdit(supplier);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-brightness-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in fade-in-90 zoom-in-90">
                <div
                    className="fixed inset-0 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Supplier Details
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                                        {supplier.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            {supplier.name}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            ID: {supplier.id}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-start space-x-2">
                                        <Building2 className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">
                                                Company Name
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {supplier.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <Phone className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">
                                                Contact Number
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {supplier.contact_number || 'Not provided'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <Mail className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">
                                                Email
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {supplier.email || 'Not provided'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">
                                                Address
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {supplier.address || 'Not provided'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <Calendar className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500">
                                                Status
                                            </h4>
                                            <p className="mt-1 text-sm text-gray-900">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${!supplier.deletedAt
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {!supplier.deletedAt ? 'Active' : 'Inactive'}
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
                                                {new Date(supplier.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {supplier.updatedAt && (
                                        <div className="flex items-start space-x-2">
                                            <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">
                                                    Last Updated
                                                </h4>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {new Date(supplier.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {supplier.deletedAt && (
                                        <div className="flex items-start space-x-2 sm:col-span-2">
                                            <Clock className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500">
                                                    Deleted At
                                                </h4>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    {new Date(supplier.deletedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {canEditDelete && !supplier.deletedAt && (
                                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                                        {!isConfirmingDelete ? (
                                            <>
                                                <button
                                                    onClick={handleEdit}
                                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setIsConfirmingDelete(true)}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setIsConfirmingDelete(false)}
                                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleDeleteConfirm}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Confirm Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierDetailModel;