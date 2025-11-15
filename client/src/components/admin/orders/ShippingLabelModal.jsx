import { Download, Eye, X } from 'lucide-react';

const ShippingLabelModal = ({
    isOpen,
    onClose,
    shippingData,
    onShippingDataChange,
    onCreateLabel,
    onPreviewLabel,
    isCreating
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-brightness-40 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Create Shipping Label</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Package Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Package Type
                        </label>
                        <select
                            value={shippingData.packageType}
                            onChange={(e) => onShippingDataChange({ ...shippingData, packageType: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="package">Package</option>
                            <option value="envelope">Envelope</option>
                            <option value="box">Box</option>
                            <option value="pallet">Pallet</option>
                        </select>
                    </div>

                    {/* Package Weight */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Package Weight (kg)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={shippingData.weight}
                            onChange={(e) => onShippingDataChange({ ...shippingData, weight: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter weight in kg"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={shippingData.notes}
                            onChange={(e) => onShippingDataChange({ ...shippingData, notes: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Any special instructions..."
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onCreateLabel}
                        disabled={isCreating}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Download size={18} />
                        {isCreating ? 'Creating...' : 'Download Label'}
                    </button>
                    <button
                        onClick={onPreviewLabel}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                        <Eye size={18} />
                        Preview
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShippingLabelModal;