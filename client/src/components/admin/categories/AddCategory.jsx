// components/admin/AddCategory.jsx
import { Loader2, X } from "lucide-react";
import { useCreateCategoryMutation } from "../../../slices/categoryApiSlice";
import { toast } from "react-toastify";
import { useState } from "react";

const AddCategory = ({ closeModals, handleInputChange, formData, refetch }) => {
    const [errors, setErrors] = useState({});

    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();

    // Validation functions
    const validateField = (name, value) => {
        let errorMessage = '';

        switch (name) {
            case 'name':
                if (!value.trim()) {
                    errorMessage = 'Category name is required';
                } else if (value.trim().length < 2) {
                    errorMessage = 'Category name must be at least 2 characters';
                } else if (value.trim().length > 100) {
                    errorMessage = 'Category name must be less than 100 characters';
                } else if (!/^[a-zA-Z\s&.-]+$/.test(value.trim())) {
                    errorMessage = 'Category name can only contain letters, spaces, &, ., and -';
                }
                break;

            case 'description':
                if (value && value.trim().length > 500) {
                    errorMessage = 'Description must be less than 500 characters';
                }
                break;

            default:
                break;
        }

        return errorMessage;
    };

    // Enhanced input change handler with validation
    const handleInputChangeWithValidation = (e) => {
        const { name, value } = e.target;

        // Call the original handleInputChange from parent
        handleInputChange(e);
        // Validate the field
        const errorMessage = validateField(name, value);

        // Update errors state
        setErrors(prev => ({
            ...prev,
            [name]: errorMessage
        }));
    };

    // Check if form is valid
    const isFormValid = () => {
        const requiredFields = ['name'];

        // Check if all required fields have values
        const hasAllValues = requiredFields.every(field =>
            formData[field] && formData[field].toString().trim() !== ''
        );

        // Check if there are no error messages
        const hasNoErrors = Object.values(errors).every(error => error === '');

        return hasAllValues && hasNoErrors;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createCategory(formData).unwrap();
            toast.success('Category created successfully!');
            closeModals();
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || 'Error creating category');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg md:rounded-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Create New Category</h2>
                        <button
                            onClick={closeModals}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChangeWithValidation}
                                required
                                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter category name"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChangeWithValidation}
                                rows={3}
                                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter category description"
                            />
                            {errors.description && (
                                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={closeModals}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isCreating || !isFormValid()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {isCreating ? 'Creating...' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCategory;