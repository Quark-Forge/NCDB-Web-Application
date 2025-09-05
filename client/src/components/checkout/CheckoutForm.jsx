import { useState } from 'react';
import { MapPin, Edit3 } from 'lucide-react';
import AddressModal from './AddressModal';
import PaymentMethod from './PaymentMethod';

const CheckoutForm = ({
    addresses,
    selectedAddress,
    paymentMethod,
    onAddressSelect,
    onPaymentMethodChange
}) => {
    const [showAddressModal, setShowAddressModal] = useState(false);

    // Helper function to display address information
    const getAddressDisplay = (address) => {
        return {
            name: address.shipping_name || address.name || 'Unknown',
            phone: address.shipping_phone || address.phone || '',
            email: address.email || '',
            address: `${address.address_line1 || address.address || ''} ${address.address_line2 || ''}`.trim(),
            city: address.city || '',
            postal_code: address.postal_code || address.postalCode || '',
            shipping_cost: address.ShippingCost?.cost || address.shipping_cost || 0
        };
    };

    const displayAddress = selectedAddress ? getAddressDisplay(selectedAddress) : null;

    return (
        <>
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Shipping Address</h2>
                    <button
                        onClick={() => setShowAddressModal(true)}
                        className="flex items-center space-x-2 text-sm text-red-500 hover:text-red-700"
                    >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                    </button>
                </div>

                {selectedAddress ? (
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="font-medium text-gray-900">{displayAddress.name}</p>
                                <p className="text-sm text-gray-600">{displayAddress.phone}</p>
                                {displayAddress.email && (
                                    <p className="text-sm text-gray-600">{displayAddress.email}</p>
                                )}
                                <p className="text-sm text-gray-600 mt-2">{displayAddress.address}</p>
                                <p className="text-sm text-gray-600">{displayAddress.city}, {displayAddress.postal_code}</p>
                                {displayAddress.shipping_cost > 0 && (
                                    <p className="text-sm text-green-600 mt-1">
                                        Shipping: LKR {parseFloat(displayAddress.shipping_cost).toFixed(2)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <p className="text-gray-500">No address selected</p>
                        <button
                            onClick={() => setShowAddressModal(true)}
                            className="mt-2 text-sm text-red-500 hover:text-red-700"
                        >
                            Select Address
                        </button>
                    </div>
                )}
            </div>

            {/* Payment Method */}
            <PaymentMethod
                paymentMethod={paymentMethod}
                onPaymentMethodChange={onPaymentMethodChange}
            />

            {/* Address Modal */}
            {showAddressModal && (
                <AddressModal
                    addresses={addresses}
                    selectedAddress={selectedAddress}
                    onClose={() => setShowAddressModal(false)}
                    onSelectAddress={onAddressSelect}
                />
            )}
        </>
    );
};

export default CheckoutForm;