import { useState, useEffect } from 'react';
import { X, Plus, Minus, Search, AlertCircle, Loader2 } from 'lucide-react';
import { useCreateSupplierItemRequestMutation } from '../../../slices/PurchaseApiSlice';
import Button from '../../common/Button';
import ErrorMessage from '../../common/ErrorMessage';
import LoadingSpinner from '../../common/LoadingSpinner';
import ItemSearch from './ItemSearch';
import RequestSummary from './RequestSummary';

const ProductRequestForm = ({ onClose, onSuccess, preSelectedItem }) => {
    const [createRequest, { isLoading: isCreating, error: createError }] = useCreateSupplierItemRequestMutation();
    const [formData, setFormData] = useState({
        supplier_item_id: '',
        quantity: 1,
        urgency: 'medium',
        notes_from_requester: ''
    });
    const [selectedItem, setSelectedItem] = useState(null);

    // Handle pre-selected item when component mounts or preSelectedItem changes
    useEffect(() => {
        if (preSelectedItem) {
            setSelectedItem(preSelectedItem);
            setFormData(prev => ({
                ...prev,
                supplier_item_id: preSelectedItem.id,
                quantity: preSelectedItem.stock_level < 5 ? 20 : 10 // Auto-set quantity based on stock level
            }));
        }
    }, [preSelectedItem]);

    const handleSelectItem = (item) => {
        setSelectedItem(item);
        setFormData(prev => ({
            ...prev,
            supplier_item_id: item.id
        }));
    };

    const handleQuantityChange = (change) => {
        const newQuantity = formData.quantity + change;
        if (newQuantity >= 1) {
            setFormData(prev => ({
                ...prev,
                quantity: newQuantity
            }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedItem) {
            alert('Please select an item');
            return;
        }

        try {
            await createRequest({
                ...formData,
                supplier_id: selectedItem.supplier_id
            }).unwrap();

            onSuccess?.();
            onClose?.();
        } catch (err) {
            console.error('Failed to create request:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 backdrop-brightness-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in-90 zoom-in-90">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {preSelectedItem ? 'Request Item' : 'Request New Item'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isCreating}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {createError && (
                        <ErrorMessage
                            message={createError.data?.message || 'Failed to create request'}
                            className="mb-4"
                        />
                    )}

                    {/* Item Selection - Hide if pre-selected item is provided */}
                    {!preSelectedItem ? (
                        <ItemSearch
                            selectedItem={selectedItem}
                            onSelectItem={handleSelectItem}
                            onClearItem={() => {
                                setSelectedItem(null);
                                setFormData(prev => ({ ...prev, supplier_item_id: '' }));
                            }}
                            disabled={isCreating}
                        />
                    ) : (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-medium text-blue-900 mb-2">Pre-selected Item</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-600">Product:</span>
                                    <span className="font-medium ml-2">{selectedItem?.Product?.name || selectedItem?.productName}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Supplier:</span>
                                    <span className="font-medium ml-2">{selectedItem?.Supplier?.name || selectedItem?.supplierName}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Current Stock:</span>
                                    <span className="font-medium ml-2">{selectedItem?.stock_level}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">SKU:</span>
                                    <span className="font-medium ml-2">{selectedItem?.Product?.sku || selectedItem?.supplierSku}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity *
                        </label>
                        <div className="flex items-center max-w-xs">
                            <button
                                type="button"
                                onClick={() => handleQuantityChange(-1)}
                                className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={formData.quantity <= 1 || isCreating}
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                min="1"
                                className="w-20 px-4 py-2 border-y border-gray-300 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={isCreating}
                            />
                            <button
                                type="button"
                                onClick={() => handleQuantityChange(1)}
                                className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isCreating}
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        {selectedItem && (
                            <p className="text-sm text-gray-500 mt-2">
                                Available stock: {selectedItem.stock_level} units
                                {formData.quantity > selectedItem.stock_level && (
                                    <span className="text-orange-600 ml-2">
                                        <AlertCircle className="h-4 w-4 inline mr-1" />
                                        Requesting more than available stock
                                    </span>
                                )}
                            </p>
                        )}
                    </div>

                    {/* Urgency */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Urgency *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['low', 'medium', 'high'].map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, urgency: level }))}
                                    className={`p-3 border rounded-lg text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${formData.urgency === level
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
                                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                        }`}
                                    disabled={isCreating}
                                >
                                    <div className="font-medium capitalize">{level}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {level === 'low' && 'Within 2 weeks'}
                                        {level === 'medium' && 'Within 1 week'}
                                        {level === 'high' && 'Within 48 hours'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes
                        </label>
                        <textarea
                            name="notes_from_requester"
                            value={formData.notes_from_requester}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Add any special instructions, delivery requirements, or specific quality expectations..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:opacity-50"
                            disabled={isCreating}
                        />
                    </div>

                    {/* Form Summary */}
                    {selectedItem && (
                        <RequestSummary selectedItem={selectedItem} formData={formData} />
                    )}

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            disabled={isCreating || !selectedItem}
                        >
                            {isCreating ? (
                                <>
                                    <LoadingSpinner size="sm" color="light" className="mr-2" />
                                    Creating Request...
                                </>
                            ) : (
                                'Submit Request'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductRequestForm;