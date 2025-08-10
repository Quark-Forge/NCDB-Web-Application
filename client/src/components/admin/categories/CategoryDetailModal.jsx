import { X, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

const CategoryDetailModal = ({
  category,
  onClose,
  onEdit,
  onDelete,
  canEditDelete
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleDeleteConfirm = () => {
    onDelete(category.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-brightness-60 flex items-center justify-center p-4">
      <div className="fbg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in fade-in-90 zoom-in-90">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
        </div>
        
        {/* Modal container */}
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Category Details
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
                    {category.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {category.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      ID: {category.id}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Status
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${!category.deletedAt
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {!category.deletedAt ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Description
                  </h4>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                    {category.description || 'No description available'}
                  </p>
                </div>

                {category.createdAt && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Created At
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(category.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {category.updatedAt && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Last Updated
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(category.updatedAt).toLocaleString()}
                    </p>
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

export default CategoryDetailModal;