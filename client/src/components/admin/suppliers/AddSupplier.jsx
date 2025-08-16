import { toast } from "react-toastify";
import { useCreateSupplierMutation } from "../../../slices/suppliersApiSlice";
import { Loader2, X } from "lucide-react";
import { useState } from "react";

const AddSupplier = ({ closeModals, setShowCreateModal, formData, handleInputChange, refetch, resetForm }) => {

    const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
    const [errors, setErrors] = useState({});

    // Validation functions
    const validateField = (name, value) => {
        let errorMessage = '';

        switch (name) {
            case 'name':
                if (!value.trim()) {
                    errorMessage = 'Supplier name is required';
                } else if (value.trim().length < 2) {
                    errorMessage = 'Supplier name must be at least 2 characters';
                } else if (value.trim().length > 100) {
                    errorMessage = 'Supplier name must be less than 100 characters';
                } else if (!/^[a-zA-Z\s&.-]+$/.test(value.trim())) {
                    errorMessage = 'Supplier name can only contain letters, spaces, &, ., and -';
                }
                break;

            case 'contact_number':
                if (!value.trim()) {
                    errorMessage = 'Contact number is required';
                } else if (!/^\+?[0-9\s\-()]{10}$/.test(value.trim())) {
                    errorMessage = 'Please enter a valid contact number (10 digits)';
                }
                break;

            case 'email':
                if (!value.trim()) {
                    errorMessage = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                    errorMessage = 'Please enter a valid email address';
                } else if (value.trim().length > 100) {
                    errorMessage = 'Email must be less than 100 characters';
                }
                break;

            case 'address':
                if (!value.trim()) {
                    errorMessage = 'Address is required';
                } else if (value.trim().length < 5) {
                    errorMessage = 'Address must be at least 5 characters';
                } else if (value.trim().length > 500) {
                    errorMessage = 'Address must be less than 500 characters';
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
        const requiredFields = ['name', 'contact_number', 'email', 'address'];
        
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
            await createSupplier(formData).unwrap();
            
            // Success operations
            toast.success('Supplier created successfully!');
            
            // Close modal first
            setShowCreateModal(false);
            
            // Reset form if function is provided
            if (resetForm && typeof resetForm === 'function') {
                resetForm();
            } else {
                // Fallback: reset form fields manually if resetForm is not provided
                const form = document.querySelector('form');
                if (form) {
                    form.reset();
                }
            }
            
            // Refetch data
            if (refetch && typeof refetch === 'function') {
                refetch();
            }
            
        } catch (err) {
            console.error('Error creating supplier:', err);
            toast.error(err?.data?.message || 'Error creating supplier');
        }
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg md:rounded-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Create New Supplier</h2>
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
                                Supplier Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChangeWithValidation}
                                required
                                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter supplier name"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Number *
                            </label>
                            <input
                                type="tel"
                                name="contact_number"
                                value={formData.contact_number}
                                onChange={handleInputChangeWithValidation}
                                required
                                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                    errors.contact_number ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter contact number"
                            />
                            {errors.contact_number && (
                                <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChangeWithValidation}
                                required
                                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter email address"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address *
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChangeWithValidation}
                                rows={3}
                                required
                                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                    errors.address ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Enter supplier address"
                            />
                            {errors.address && (
                                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
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
                                {isCreating ? 'Creating...' : 'Create Supplier'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}



export default AddSupplier;