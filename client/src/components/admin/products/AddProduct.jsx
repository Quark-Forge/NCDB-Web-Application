import { X, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCreateProductMutation } from "../../../slices/ProductsApiSlice";

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
        stock_level: '0',
        expiry_days: '',
        lead_time_days: '7',
        image_url: ''
    });

    const [errors, setErrors] = useState({});

    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

    const validateField = (name, value) => {
        let errorMessage = '';

        switch (name) {
            case 'name':
                if (!value.trim()) {
                    errorMessage = 'Product name is required';
                } else if (value.trim().length < 2) {
                    errorMessage = 'Product name must be at least 2 characters';
                } else if (value.trim().length > 100) {
                    errorMessage = 'Product name must be less than 100 characters';
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

            case 'supplier_sku':
                if (!value.trim()) {
                    errorMessage = 'Supplier SKU is required';
                } else if (value.trim().length > 50) {
                    errorMessage = 'Supplier SKU must be less than 50 characters';
                }
                break;

            case 'price':
            case 'purchase_price':
                if (!value) {
                    errorMessage = `${name.replace('_', ' ')} is required`;
                } else if (isNaN(value) || parseFloat(value) <= 0) {
                    errorMessage = `${name.replace('_', ' ')} must be greater than 0`;
                } else if (parseFloat(value) > 99999999.99) {
                    errorMessage = `${name.replace('_', ' ')} must be less than 100,000,000`;
                }
                break;

            case 'discount_price':
                if (value && (isNaN(value) || parseFloat(value) < 0)) {
                    errorMessage = 'Discount price cannot be negative';
                } else if (value && formData.price && parseFloat(value) >= parseFloat(formData.price)) {
                    errorMessage = 'Discount price must be less than selling price';
                } else if (value && parseFloat(value) > 99999999.99) {
                    errorMessage = 'Discount price must be less than 100,000,000';
                }
                break;

            case 'quantity_per_unit':
                if (!value) {
                    errorMessage = 'Quantity per unit is required';
                } else if (isNaN(value) || parseFloat(value) <= 0) {
                    errorMessage = 'Quantity per unit must be greater than 0';
                } else if (parseFloat(value) > 99999999.99) {
                    errorMessage = 'Quantity per unit must be less than 100,000,000';
                }
                break;

            case 'stock_level':
                if (value && (isNaN(value) || parseInt(value) < 0)) {
                    errorMessage = 'Stock level cannot be negative';
                } else if (value && parseInt(value) > 999999999) {
                    errorMessage = 'Stock level must be less than 1,000,000,000';
                }
                break;

            case 'expiry_days':
            case 'lead_time_days':
                if (value && (isNaN(value) || parseInt(value) < 0)) {
                    errorMessage = `${name.replace('_', ' ')} cannot be negative`;
                } else if (value && parseInt(value) > 9999) {
                    errorMessage = `${name.replace('_', ' ')} must be less than 10,000`;
                }
                break;

            case 'unit_symbol':
                if (!value.trim()) {
                    errorMessage = 'Unit symbol is required';
                } else if (value.trim().length > 20) {
                    errorMessage = 'Unit symbol must be less than 20 characters';
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

            case 'base_image_url':
            case 'image_url':
                if (value && value.trim()) {
                    try {
                        new URL(value.trim());
                        if (!value.trim().match(/^https?:\/\//)) {
                            errorMessage = 'URL must start with http:// or https://';
                        }
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInputChangeWithValidation = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        const errorMessage = validateField(name, value);
        
        setErrors(prev => ({
            ...prev,
            [name]: errorMessage
        }));

        if (name === 'price' && formData.discount_price) {
            const discountError = validateField('discount_price', formData.discount_price);
            setErrors(prev => ({
                ...prev,
                discount_price: discountError
            }));
        }
    };

    const isFormValid = () => {
        const requiredFields = [
            'name', 'sku', 'category_id', 'supplier_id', 'supplier_sku', 
            'purchase_price', 'price', 'quantity_per_unit', 'unit_symbol'
        ];
        
        const hasAllValues = requiredFields.every(field => 
            formData[field] && formData[field].toString().trim() !== ''
        );
        
        const hasNoErrors = Object.values(errors).every(error => error === '');
        
        return hasAllValues && hasNoErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const allErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) allErrors[key] = error;
        });

        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            toast.error('Please fix all validation errors before submitting');
            return;
        }

        try {
            const submitData = {
                name: formData.name.trim(),
                sku: formData.sku.trim().toUpperCase(),
                description: formData.description.trim() || undefined,
                category_id: formData.category_id,
                base_image_url: formData.base_image_url.trim() || undefined,
                
                supplier_id: formData.supplier_id,
                supplier_sku: formData.supplier_sku.trim(),
                purchase_price: parseFloat(formData.purchase_price),
                price: parseFloat(formData.price),
                discount_price: formData.discount_price ? parseFloat(formData.discount_price) : undefined,
                quantity_per_unit: parseFloat(formData.quantity_per_unit),
                unit_symbol: formData.unit_symbol.trim(),
                stock_level: parseInt(formData.stock_level) || 0,
                expiry_days: formData.expiry_days ? parseInt(formData.expiry_days) : undefined,
                lead_time_days: parseInt(formData.lead_time_days) || 7,
                image_url: formData.image_url.trim() || undefined
            };

            await createProduct(submitData).unwrap();
            toast.success('Product created successfully!');
            setShowCreateModal(false);
            refetch();
        } catch (err) {
            console.error('Product creation error:', err);
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
                                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter product name"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product SKU *
                                </label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleInputChangeWithValidation}
                                    required
                                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                        errors.sku ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="e.g., PROD-001"
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
                                    {categories && categories.map((category) => (
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
                                    {suppliers && suppliers.map((supplier) => (
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
                                    onChange={handleInputChangeWithValidation}
                                    required
                                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                        errors.supplier_sku ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Supplier's product code"
                                />
                                {errors.supplier_sku && (
                                    <p className="text-red-500 text-xs mt-1">{errors.supplier_sku}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Purchase Price *
                                </label>
                                <input
                                    type="number"
                                    name="purchase_price"
                                    value={formData.purchase_price}
                                    onChange={handleInputChangeWithValidation}
                                    required
                                    step="0.01"
                                    min="0"
                                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                        errors.purchase_price ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="0.00"
                                />
                                {errors.purchase_price && (
                                    <p className="text-red-500 text-xs mt-1">{errors.purchase_price}</p>
                                )}
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
                                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                        errors.price ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="0.00"
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
                                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                        errors.discount_price ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="0.00 (optional)"
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
                                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                        errors.quantity_per_unit ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="e.g., 1.5"
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
                                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                        errors.unit_symbol ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="e.g., kg, lbs, pcs"
                                />
                                {errors.unit_symbol && (
                                    <p className="text-red-500 text-xs mt-1">{errors.unit_symbol}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Initial Stock Level
                                </label>
                                <input
                                    type="number"
                                    name="stock_level"
                                    value={formData.stock_level}
                                    onChange={handleInputChangeWithValidation}
                                    min="0"
                                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                        errors.stock_level ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="0"
                                />
                                {errors.stock_level && (
                                    <p className="text-red-500 text-xs mt-1">{errors.stock_level}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lead Time (Days)
                                </label>
                                <input
                                    type="number"
                                    name="lead_time_days"
                                    value={formData.lead_time_days}
                                    onChange={handleInputChangeWithValidation}
                                    min="0"
                                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                        errors.lead_time_days ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="7"
                                />
                                {errors.lead_time_days && (
                                    <p className="text-red-500 text-xs mt-1">{errors.lead_time_days}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expiry Days
                                </label>
                                <input
                                    type="number"
                                    name="expiry_days"
                                    value={formData.expiry_days}
                                    onChange={handleInputChangeWithValidation}
                                    min="0"
                                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                        errors.expiry_days ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Leave empty if no expiry"
                                />
                                {errors.expiry_days && (
                                    <p className="text-red-500 text-xs mt-1">{errors.expiry_days}</p>
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
                                    onChange={handleInputChangeWithValidation}
                                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                        errors.base_image_url ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="https://example.com/image.jpg"
                                />
                                {errors.base_image_url && (
                                    <p className="text-red-500 text-xs mt-1">{errors.base_image_url}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Supplier Image URL
                                </label>
                                <input
                                    type="url"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleInputChangeWithValidation}
                                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                        errors.image_url ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="https://supplier.com/image.jpg"
                                />
                                {errors.image_url && (
                                    <p className="text-red-500 text-xs mt-1">{errors.image_url}</p>
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
                                className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Detailed product description..."
                            />
                            {errors.description && (
                                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
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