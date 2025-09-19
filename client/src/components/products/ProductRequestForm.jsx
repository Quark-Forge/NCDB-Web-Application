import { useState, useEffect } from 'react';
import {
    X,
    Plus,
    Minus,
    Search,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useCreateSupplierItemRequestMutation } from './PurchaseApiSlice';
import { useGetSupplierItemsQuery } from './supplierItemsApiSlice';
import Button from './Button';
import Card from './Card';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

const ProductRequestForm = ({ onClose, onSuccess }) => {
    const [createRequest, { isLoading: isCreating, error: createError }] = useCreateSupplierItemRequestMutation();

    const [formData, setFormData] = useState({
        supplier_item_id: '',
        quantity: 1,
        urgency: 'medium',
        notes_from_requester: ''
    });

    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Fetch supplier items with search functionality
    const {
        data: supplierItemsData,
        isLoading: isLoadingItems,
        error: itemsError,
        refetch: refetchItems
    } = useGetSupplierItemsQuery();

    const [filteredItems, setFilteredItems] = useState([]);

    useEffect(() => {
        if (supplierItemsData?.data?.supplierItems) {
            if (searchTerm.length > 2) {
                const results = supplierItemsData.data.supplierItems.filter(item =>
                    item.Product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.Supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.supplier_sku?.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setFilteredItems(results);
            } else {
                setFilteredItems([]);
            }
        }
    }, [searchTerm, supplierItemsData]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        setShowSearchResults(term.length > 2);
    };

    const handleSelectItem = (item) => {
        setSelectedItem(item);
        setFormData(prev => ({
            ...prev,
            supplier_item_id: item.id
        }));
        setSearchTerm('');
        setShowSearchResults(false);
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

    const formatPrice = (price) => {
        return `LKR ${parseFloat(price).toFixed(2)}`;
    };

    const getStockStatus = (stockLevel) => {
        if (stockLevel <= 10) return { variant: 'danger', text: 'Low Stock' };
        if (stockLevel <= 25) return { variant: 'warning', text: 'Moderate Stock' };
        return { variant: 'success', text: 'Good Stock' };
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in-90 zoom-in-90">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Request New Item</h2>
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

                    {/* Item Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Item *
                        </label>

                        {selectedItem ? (
                            <Card className="p-4 border-green-200 bg-green-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-green-900">{selectedItem.Product?.name}</h4>
                                        <p className="text-sm text-green-700">{selectedItem.Supplier?.name}</p>
                                        <p className="text-sm text-green-600 mt-1">{selectedItem.description}</p>
                                        <div className="flex items-center mt-2 space-x-4 text-xs">
                                            <span className="text-gray-600">SKU: {selectedItem.supplier_sku}</span>
                                            <span className="text-gray-600">Price: {formatPrice(selectedItem.price)}</span>
                                            <Badges
                                                variant={getStockStatus(selectedItem.stock_level).variant}
                                                size="sm"
                                            >
                                                Stock: {selectedItem.stock_level}
                                            </Badges>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedItem(null);
                                            setFormData(prev => ({ ...prev, supplier_item_id: '' }));
                                        }}
                                        className="text-green-600 hover:text-green-800 ml-2"
                                        disabled={isCreating}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </Card>
                        ) : (
                            <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        placeholder="Search for items by name, supplier, or description..."
                                        className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        onFocus={() => searchTerm.length > 2 && setShowSearchResults(true)}
                                        disabled={isLoadingItems}
                                    />
                                    {isLoadingItems && (
                                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                                    )}
                                </div>

                                {itemsError && (
                                    <div className="mt-2 text-sm text-red-600">
                                        Failed to load items. <button onClick={refetchItems} className="text-blue-600 hover:underline">Retry</button>
                                    </div>
                                )}

                                {showSearchResults && (
                                    <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-auto shadow-lg">
                                        {filteredItems.length > 0 ? (
                                            filteredItems.map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                    onClick={() => handleSelectItem(item)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900">{item.Product?.name}</div>
                                                            <div className="text-sm text-gray-600">{item.Supplier?.name}</div>
                                                            <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {formatPrice(item.price)}
                                                            </div>
                                                            <Badges
                                                                variant={getStockStatus(item.stock_level).variant}
                                                                size="sm"
                                                                className="mt-1"
                                                            >
                                                                {item.stock_level} in stock
                                                            </Badges>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        SKU: {item.supplier_sku} • Lead time: {item.lead_time_days} days
                                                    </div>
                                                </button>
                                            ))
                                        ) : searchTerm.length > 2 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                <Search className="h-6 w-6 mx-auto mb-2" />
                                                <p>No items found matching "{searchTerm}"</p>
                                            </div>
                                        ) : null}
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>

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
                        <Card className="p-4 bg-blue-50 border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">Request Summary</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Item:</span>
                                    <span className="font-medium ml-2">{selectedItem.Product?.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Supplier:</span>
                                    <span className="font-medium ml-2">{selectedItem.Supplier?.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Quantity:</span>
                                    <span className="font-medium ml-2">{formData.quantity}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Urgency:</span>
                                    <span className="font-medium ml-2 capitalize">{formData.urgency}</span>
                                </div>
                            </div>
                        </Card>
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

// Badges component (since it's used in this file)
const Badges = ({
    variant = 'neutral',
    size = 'md',
    children,
    className = ''
}) => {
    const variants = {
        neutral: 'bg-gray-100 text-gray-800',
        primary: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-indigo-100 text-indigo-800'
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base'
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
};

export default ProductRequestForm;