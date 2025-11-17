import { Eye, Trash2, CheckCircle, XCircle } from "lucide-react";
import SupplierDetailModel from './SupplierDetailModel';
import { useState } from 'react';
import { useSelector } from "react-redux";
const allowedRoles = ['Admin'];

const SupplierCard = ({ filteredSuppliers, handleDelete }) => {
    const { userInfo } = useSelector((state) => state.auth);
    const [selectSupplier, setSelectSupplier] = useState(null);
    const [isDetailModelOpen, setIsDetailModelOpen] = useState(false);

    const handleViewDetail = (supplier) => {
        setSelectSupplier(supplier);
        setIsDetailModelOpen(true);
    }

    const closeModel = () => {
        setSelectSupplier(null);
        setIsDetailModelOpen(false);
    }

    const canDelete = allowedRoles.includes(userInfo?.user_role);

    return (
        <div>
            {/* Mobile View */}
            <div className="md:hidden space-y-3 p-3">
                {filteredSuppliers.map((supplier) => (
                    <div key={supplier.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div
                                className="flex items-center space-x-3 cursor-pointer flex-1"
                                onClick={() => handleViewDetail(supplier)}
                            >
                                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                    {supplier.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-gray-900">{supplier.name}</h3>
                                    <p className="text-xs text-gray-500">{supplier.contact_number || 'No contact number'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                    {supplier.user ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${!supplier.deletedAt ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {!supplier.deletedAt ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                                {supplier.email || 'No email provided'}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleViewDetail(supplier)}
                                    className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    <Eye size={16} />
                                </button>
                                {canDelete && (
                                    <button
                                        onClick={() => handleDelete(supplier.id)}
                                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Supplier
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
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
                        {filteredSuppliers.map((supplier) => (
                            <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                                <td
                                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                    onClick={() => handleViewDetail(supplier)}
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                            {supplier.name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                                            <div className="text-sm text-gray-500">ID: {supplier.id.substring(0, 8)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 cursor-pointer"
                                    onClick={() => handleViewDetail(supplier)}
                                >
                                    <div className="text-sm text-gray-900">
                                        {supplier.contact_number || 'No contact number'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {supplier.email || 'No email provided'}
                                    </div>
                                </td>
                                <td
                                    className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                    onClick={() => handleViewDetail(supplier)}
                                >
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${!supplier.deletedAt ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {!supplier.deletedAt ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => handleViewDetail(supplier)}
                                            className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-50 transition-colors"
                                            aria-label="View supplier"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        {canDelete && (
                                            <button
                                                onClick={() => handleDelete(supplier.id)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {isDetailModelOpen && selectSupplier && (
                <SupplierDetailModel
                    supplier={selectSupplier}
                    onClose={closeModel}
                    onDelete={handleDelete}
                    canDelete={canDelete}
                />
            )}
        </div>
    )
}

export default SupplierCard;