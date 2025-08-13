import { X, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCreateProductMutation } from "../../../slices/productsApiSlice";

const AddProduct = ({ setShowCreateModal, refetch, categories, suppliers }) => {
    



    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        category_id: '',
        base_image_url: '',
        supplier_id: '',
        supplier_sku: '',
        purchase_price: '',
        price: '',
        discount_price: '',
        quantity_per_unit: '',
        unit_symbol: '',
        stock_level: '',
        expiry_days: '',
        lead_time_days: ''
    });

    const [errors, setErrors] = useState({});

    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

    // Validation functions
    const validateField = (name, value) => {
        let errorMessage = '';

        switch (name) {
            case 'name':
                if (!value.trim()) {
                    errorMessage = 'Product name is required';
                } else if (value.trim().length < 2) {
                    errorMessage = 'Product name must be at least 2 characters';
                } else if (value.trim().length > 200) {
                    errorMessage = 'Product name must be less than 200 characters';
                }
                break;

            case 'sku':
                if (!value.trim()) {
                    errorMessage = 'SKU is required';
                } else if (!/^[A-Z0-9-_]+$/i.test(value.trim())) {
                    errorMessage = 'SKU can only contain letters, numbers, hyphens, and underscores';
                } else if (value.trim().length < 3) {
                    errorMessage = 'SKU must be at least 3 characters';
                } else if (value.trim().length > 50) {
                    errorMessage = 'SKU must be less than 50 characters';
                }
                break;

            case 'price':
                if (!value) {
                    errorMessage = 'Price is required';
                } else if (parseFloat(value) <= 0) {
                    errorMessage = 'Price must be greater than 0';
                } else if (parseFloat(value) > 999999.99) {
                    errorMessage = 'Price must be less than 1,000,000';
                }
                break;

            case 'discount_price':
                if (value && parseFloat(value) < 0) {
                    errorMessage = 'Discount price cannot be negative';
                } else if (value && formData.price && parseFloat(value) >= parseFloat(formData.price)) {
                    errorMessage = 'Discount price must be less than regular price';
                } else if (value && parseFloat(value) > 999999.99) {
                    errorMessage = 'Discount price must be less than 1,000,000';
                }
                break;

            case 'quantity_per_unit':
                if (!value) {
                    errorMessage = 'Quantity per unit is required';
                } else if (parseFloat(value) <= 0) {
                    errorMessage = 'Quantity per unit must be greater than 0';
                } else if (parseFloat(value) > 9999.99) {
                    errorMessage = 'Quantity per unit must be less than 10,000';
                }
                break;

            case 'quantity':
                if (!value) {
                    errorMessage = 'Stock quantity is required';
                } else if (parseInt(value) < 0) {
                    errorMessage = 'Stock quantity cannot be negative';
                } else if (parseInt(value) > 999999) {
                    errorMessage = 'Stock quantity must be less than 1,000,000';
                }
                break;

            case 'unit_symbol':
                if (!value.trim()) {
                    errorMessage = 'Unit symbol is required';
                } else if (value.trim().length > 10) {
                    errorMessage = 'Unit symbol must be less than 10 characters';
                }
                break;

            case 'category_id':
                if (!value) {
                    errorMessage = 'Category is required';
                }
                break;

            case 'supplier_id':
                if (!value) {
                    errorMessage = 'Supplier is required';
                }
                break;

            case 'description':
                if (value && value.trim().length > 1000) {
                    errorMessage = 'Description must be less than 1000 characters';
                }
                break;

            case 'image_url':
                if (value && value.trim()) {
                    try {
                        new URL(value.trim());
                    } catch {
                        errorMessage = 'Please enter a valid URL';
                    }
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
        
        // Update form data
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
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
        const requiredFields = ['name', 'sku', 'price', 'quantity_per_unit', 'quantity', 'unit_symbol', 'category_id', 'supplier_id'];
        
        // Check if all required fields have values
        const hasAllValues = requiredFields.every(field => 
            formData[field] && formData[field].toString().trim() !== ''
        );
        
        // Check if there are no error messages
        const hasNoErrors = Object.values(errors).every(error => error === '');
        
        return hasAllValues && hasNoErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProduct({
                ...formData,
                base_image_url: formData.base_image_url.trim() || null,
                price: parseFloat(formData.price),
                discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
                purchase_price: parseFloat(formData.purchase_price),
                quantity_per_unit: parseFloat(formData.quantity_per_unit),
                stock_level: parseInt(formData.stock_level),
                expiry_days: parseInt(formData.expiry_days),
                lead_time_days: parseInt(formData.lead_time_days) || 5
            }).unwrap();

            toast.success('Product created successfully!');
            setShowCreateModal(false);
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || 'Error creating product');
        }
    };

    return (
        <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg md:rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Create New Product</h2>
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Product Fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChangeWithValidation}
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SKU *
                                </label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleInputChangeWithValidation}
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                {errors.sku && (
                                    <p className="text-red-500 text-xs mt-1">{errors.sku}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleInputChangeWithValidation}
                                    required
                                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                        errors.category_id ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && (
                                    <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Base Image URL
                                </label>
                                <input
                                    type="url"
                                    name="base_image_url"
                                    value={formData.base_image_url}
                                    onChange={handleInputChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            {/* Supplier Item Fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Supplier *
                                </label>
                                <select
                                    name="supplier_id"
                                    value={formData.supplier_id}
                                    onChange={handleInputChangeWithValidation}
                                    required
                                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                        errors.supplier_id ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">Select a supplier</option>
                                    {suppliers.map((supplier) => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.supplier_id && (
                                    <p className="text-red-500 text-xs mt-1">{errors.supplier_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Supplier SKU *
                                </label>
                                <input
                                    type="text"
                                    name="supplier_sku"
                                    value={formData.supplier_sku}
                                    onChange={handleInputChange}
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Purchase Price *
                                </label>
                                <input
                                    type="number"
                                    name="purchase_price"
                                    value={formData.purchase_price}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                    min="0"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Selling Price *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChangeWithValidation}
                                    required
                                    step="0.01"
                                    min="0"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                {errors.price && (
                                    <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Discount Price
                                </label>
                                <input
                                    type="number"
                                    name="discount_price"
                                    value={formData.discount_price}
                                    onChange={handleInputChangeWithValidation}
                                    step="0.01"
                                    min="0"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                {errors.discount_price && (
                                    <p className="text-red-500 text-xs mt-1">{errors.discount_price}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity per Unit *
                                </label>
                                <input
                                    type="number"
                                    name="quantity_per_unit"
                                    value={formData.quantity_per_unit}
                                    onChange={handleInputChangeWithValidation}
                                    required
                                    step="0.01"
                                    min="0"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                {errors.quantity_per_unit && (
                                    <p className="text-red-500 text-xs mt-1">{errors.quantity_per_unit}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Unit Symbol *
                                </label>
                                <input
                                    type="text"
                                    name="unit_symbol"
                                    value={formData.unit_symbol}
                                    onChange={handleInputChangeWithValidation}
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                {errors.unit_symbol && (
                                    <p className="text-red-500 text-xs mt-1">{errors.unit_symbol}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Stock Level *
                                </label>
                                <input
                                    type="number"
                                    name="stock_level"
                                    value={formData.stock_level}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expiry Days
                                </label>
                                <input
                                    type="number"
                                    name="expiry_days"
                                    value={formData.expiry_days}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lead Time Days
                                </label>
                                <input
                                    type="number"
                                    name="lead_time_days"
                                    value={formData.lead_time_days}
                                    onChange={handleInputChange}
                                    min="0"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                />
                                {errors.quantity && (
                                    <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                                )}
                            </div>
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
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                            {errors.image_url && (
                                <p className="text-red-500 text-xs mt-1">{errors.image_url}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 pt-6">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
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
                                {isCreating ? 'Creating...' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;