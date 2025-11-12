// StatusUpdateModal.jsx
import { useState } from 'react';
import { X, DollarSign, FileText } from 'lucide-react';
import Button from '../../common/Button';
import Card from '../../common/Card';

const StatusUpdateModal = ({ isOpen, onClose, request, action, onConfirm }) => {
    const [formData, setFormData] = useState({
        supplier_quote: '',
        rejection_reason: '',
        notes_from_supplier: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(request.id, action === 'approve' ? 'approved' : 'rejected', formData);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="fixed inset-0 z-50 backdrop-brightness-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in-90 zoom-in-90">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {action === 'approve' ? 'Approve Request' : 'Reject Request'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Request Summary */}
                <div className="p-6 border-b border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">Request Details</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span>Item:</span>
                            <span className="font-medium">{request?.SupplierItem?.Product?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Quantity:</span>
                            <span className="font-medium">{request?.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Urgency:</span>
                            <span className="font-medium capitalize">{request?.urgency}</span>
                        </div>
                        {request?.notes_from_requester && (
                            <div>
                                <span>Requester Notes:</span>
                                <p className="text-gray-500 mt-1">{request.notes_from_requester}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {action === 'approve' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <DollarSign className="h-4 w-4 inline mr-1" />
                                Supplier Quote (LKR)
                            </label>
                            <input
                                type="number"
                                name="supplier_quote"
                                value={formData.supplier_quote}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                placeholder="Enter quote amount"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    )}

                    {action === 'reject' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason *
                            </label>
                            <textarea
                                name="rejection_reason"
                                value={formData.rejection_reason}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Please provide a reason for rejecting this request..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="h-4 w-4 inline mr-1" />
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            name="notes_from_supplier"
                            value={formData.notes_from_supplier}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Add any additional notes or instructions..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant={action === 'approve' ? 'primary' : 'danger'}
                            className="flex-1"
                        >
                            {action === 'approve' ? 'Approve Request' : 'Reject Request'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StatusUpdateModal;