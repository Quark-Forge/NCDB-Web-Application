import { Eye, Pencil, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import { useState } from "react";
import CategoryDetailModal from "./CategoryDetailModal";

const allowedRoles = ['Admin', 'Inventory Manager'];

const CategoryCard = ({ filteredCategories, handleEdit, handleDelete }) => {
    const { userInfo } = useSelector((state) => state.auth);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleViewDetails = (category) => {
        setSelectedCategory(category);
        setIsDetailModalOpen(true);
    };

    const closeModal = () => {
        setIsDetailModalOpen(false);
        setSelectedCategory(null);
    };

    const canEditDelete = allowedRoles.includes(userInfo?.user_role);

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3 p-4">
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No categories found
                    </div>
                ) : (
                    filteredCategories.map((category) => (
                        <div 
                            key={category.id} 
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150"
                        >
                            <div className="flex items-center justify-between">
                                <div 
                                    className="flex items-center space-x-3 cursor-pointer"
                                    onClick={() => handleViewDetails(category)}
                                >
                                    <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                        {category.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                                            {category.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 line-clamp-1">
                                            {category.description || 'No description'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    !category.deletedAt 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {!category.deletedAt ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            
                            <div className="mt-3 flex items-center justify-between">
                                <button
                                    onClick={() => handleViewDetails(category)}
                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    View details
                                </button>
                                
                                {canEditDelete && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(category);
                                            }}
                                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                                            aria-label="Edit category"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(category.id);
                                            }}
                                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                                            aria-label="Delete category"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
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
                        {filteredCategories.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                    No categories found
                                </td>
                            </tr>
                        ) : (
                            filteredCategories.map((category) => (
                                <tr 
                                    key={category.id} 
                                    className="hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <td 
                                        className="px-6 py-4 whitespace-nowrap cursor-pointer"
                                        onClick={() => handleViewDetails(category)}
                                    >
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                                {category.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {category.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {category.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td 
                                        className="px-6 py-4 max-w-xs cursor-pointer"
                                        onClick={() => handleViewDetails(category)}
                                    >
                                        <div className="text-sm text-gray-900 line-clamp-2">
                                            {category.description || 'No description'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            !category.deletedAt 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {!category.deletedAt ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center space-x-2">
                                            <button
                                                onClick={() => handleViewDetails(category)}
                                                className="text-blue-400 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50 transition-colors"
                                                aria-label="View details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            
                                            {canEditDelete && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                                                        aria-label="Edit category"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                                                        aria-label="Delete category"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Category Detail Modal */}
            {isDetailModalOpen && selectedCategory && (
                <CategoryDetailModal
                    category={selectedCategory}
                    onClose={closeModal}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    canEditDelete={canEditDelete}
                />
            )}
        </div>
    );
};

export default CategoryCard;