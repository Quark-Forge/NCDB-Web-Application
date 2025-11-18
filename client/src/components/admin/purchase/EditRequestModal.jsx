import { useState, useEffect } from 'react';
import { X, Package, AlertCircle } from 'lucide-react';
import Button from '../../common/Button';

const EditRequestModal = ({ isOpen, request, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        quantity: '',
        urgency: 'medium',
        notes_from_requester: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (request) {
            setFormData({
                quantity: request.quantity || '',
                urgency: request.urgency || 'medium',
                notes_from_requester: request.notes_from_requester || ''
            });
        }
    }, [request]);

    if (!isOpen || !request) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await onSave(formData);
            // Success handled by parent component
        } catch (error) {
            setError(error.data?.message || 'Failed to update request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value) || '' : value
        }));
    };

    return (
        <div className="fixed inset-0 backdrop-brightness-40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Edit Purchase Request
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Update request details for {request.SupplierItem?.Product?.name || 'Unknown Product'}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        disabled={isSubmitting}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        {/* Product Info */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center">
                                <Package className="h-5 w-5 text-blue-600 mr-2" />
                                <h3 className="text-sm font-semibold text-blue-900">Product Information</h3>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-blue-700">Product</p>
                                    <p className="font-medium text-blue-900">
                                        {request.SupplierItem?.Product?.name || 'Unknown Product'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-blue-700">Supplier</p>
                                    <p className="font-medium text-blue-900">
                                        {request.SupplierItem?.Supplier?.name || 'Unknown Supplier'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Warning Message */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                                <p className="text-sm font-medium text-yellow-800">
                                    Note: You can only edit pending requests. Once approved or rejected, editing is disabled.
                                </p>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Quantity */}
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity *
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>

                            {/* Urgency */}
                            <div>
                                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
                                    Urgency *
                                </label>
                                <select
                                    id="urgency"
                                    name="urgency"
                                    value={formData.urgency}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label htmlFor="notes_from_requester" className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                id="notes_from_requester"
                                name="notes_from_requester"
                                value={formData.notes_from_requester}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Add any additional notes or requirements..."
                                disabled={isSubmitting}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>

                        {/* Current Status */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Status</h4>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Request Status</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Request'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditRequestModal;