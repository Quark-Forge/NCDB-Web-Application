import { X, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCreateProductMutation } from "../../../slices/ProductsApiSlice";
import FormInput from "./FormInput";
import { validateField, validateAllFields, isFormValid } from "../../../utils/productValidation";
import ImageUpload from "../../common/ImageUpload";

const AddProduct = ({ setShowCreateModal, refetch, categories, suppliers }) => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        category_id: '',
        supplier_id: '',
        supplier_sku: '',
        purchase_price: '',
        price: '',
        discount_price: '',
        quantity_per_unit: '',
        unit_symbol: '',
        stock_level: '0',
        expiry_days: '',
        lead_time_days: '1'
    });

    const [errors, setErrors] = useState({});
    const [productImage, setProductImage] = useState(null);
    const [createdProductId, setCreatedProductId] = useState(null);

    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

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

        const errorMessage = validateField(name, value, formData);

        setErrors(prev => ({
            ...prev,
            [name]: errorMessage
        }));

        if (name === 'price' && formData.discount_price) {
            const discountError = validateField('discount_price', formData.discount_price, formData);
            setErrors(prev => ({
                ...prev,
                discount_price: discountError
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const allErrors = validateAllFields(formData);
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
                supplier_id: formData.supplier_id,
                supplier_sku: formData.supplier_sku.trim(),
                purchase_price: parseFloat(formData.purchase_price),
                price: parseFloat(formData.price),
                discount_price: formData.discount_price ? parseFloat(formData.discount_price) : undefined,
                quantity_per_unit: parseFloat(formData.quantity_per_unit),
                unit_symbol: formData.unit_symbol.trim(),
                stock_level: parseInt(formData.stock_level) || 0,
                expiry_days: formData.expiry_days ? parseInt(formData.expiry_days) : undefined,
                lead_time_days: parseInt(formData.lead_time_days) || 7
            };

            const result = await createProduct(submitData).unwrap();
            const productId = result.data?.product?.id;

            // Set the created product ID for image upload
            setCreatedProductId(productId);

            // If we have a product image and product was created successfully, update the ImageUpload
            if (productImage && productId) {
                // The ImageUpload component will automatically upload when entityId changes
                toast.success('Product created successfully! Image upload in progress...');
            } else {
                toast.success('Product created successfully!');
            }

            setShowCreateModal(false);
            refetch();
        } catch (err) {
            console.error('Product creation error:', err);
            toast.error(err?.data?.message || 'Error creating product');
        }
    };

    return (
        <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg md:rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload Section */}
                        <ImageUpload
                            currentImage={productImage}
                            onImageChange={setProductImage}
                            entityId={createdProductId}
                            className="mb-6"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Product Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChangeWithValidation}
                                error={errors.name}
                                required={true}
                                placeholder="Enter product name"
                            />

                            <FormInput
                                label="Product SKU"
                                name="sku"
                                value={formData.sku}
                                onChange={handleInputChangeWithValidation}
                                error={errors.sku}
                                required={true}
                                placeholder="e.g., PROD-001"
                            />

                            <FormInput
                                label="Category"
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleInputChangeWithValidation}
                                error={errors.category_id}
                                type="select"
                                required={true}
                                options={categories || []}
                            />

                            <FormInput
                                label="Supplier"
                                name="supplier_id"
                                value={formData.supplier_id}
                                onChange={handleInputChangeWithValidation}
                                error={errors.supplier_id}
                                type="select"
                                required={true}
                                options={suppliers || []}
                            />

                            <FormInput
                                label="Supplier SKU"
                                name="supplier_sku"
                                value={formData.supplier_sku}
                                onChange={handleInputChangeWithValidation}
                                error={errors.supplier_sku}
                                required={true}
                                placeholder="Supplier's product code"
                            />

                            <FormInput
                                label="Purchase Price"
                                name="purchase_price"
                                value={formData.purchase_price}
                                onChange={handleInputChangeWithValidation}
                                error={errors.purchase_price}
                                type="number"
                                required={true}
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                            />

                            <FormInput
                                label="Selling Price"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChangeWithValidation}
                                error={errors.price}
                                type="number"
                                required={true}
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                            />

                            <FormInput
                                label="Discount Price"
                                name="discount_price"
                                value={formData.discount_price}
                                onChange={handleInputChangeWithValidation}
                                error={errors.discount_price}
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00 (optional)"
                            />

                            <FormInput
                                label="Quantity per Unit"
                                name="quantity_per_unit"
                                value={formData.quantity_per_unit}
                                onChange={handleInputChangeWithValidation}
                                error={errors.quantity_per_unit}
                                type="number"
                                required={true}
                                step="0.01"
                                min="0"
                                placeholder="e.g., 1.5"
                            />

                            <FormInput
                                label="Unit Symbol"
                                name="unit_symbol"
                                value={formData.unit_symbol}
                                onChange={handleInputChangeWithValidation}
                                error={errors.unit_symbol}
                                required={true}
                                placeholder="e.g., kg, lbs, pcs"
                            />

                            <FormInput
                                label="Initial Stock Level"
                                name="stock_level"
                                value={formData.stock_level}
                                onChange={handleInputChangeWithValidation}
                                error={errors.stock_level}
                                type="number"
                                min="0"
                                placeholder="0"
                            />

                            <FormInput
                                label="Lead Time (Days)"
                                name="lead_time_days"
                                value={formData.lead_time_days}
                                onChange={handleInputChangeWithValidation}
                                error={errors.lead_time_days}
                                type="number"
                                min="0"
                                placeholder="7"
                            />

                            <FormInput
                                label="Expiry Days"
                                name="expiry_days"
                                value={formData.expiry_days}
                                onChange={handleInputChangeWithValidation}
                                error={errors.expiry_days}
                                type="number"
                                min="0"
                                placeholder="Leave empty if no expiry"
                            />
                        </div>

                        <FormInput
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChangeWithValidation}
                            error={errors.description}
                            type="textarea"
                            placeholder="Detailed product description..."
                        />

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
                                disabled={isCreating || !isFormValid(formData, errors)}
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