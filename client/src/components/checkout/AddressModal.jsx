import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { useAddShippingAddressMutation } from '../../slices/shippingAddressApiSlice';
import { useGetShippingCostQuery } from '../../slices/shippingCostApiSlice';

const AddressModal = ({ addresses, selectedAddress, onClose, onSelectAddress }) => {
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        shipping_name: '',
        shipping_phone: '',
        email: '',
        address_line1: '',
        address_line2: '',
        city: '',
        postal_code: '',
        shipping_cost_id: ''
    });

    const [addShippingAddress] = useAddShippingAddressMutation();
    const { data: shippingCostsData } = useGetShippingCostQuery();

    // Extract cities from shipping costs
    const shippingCosts = shippingCostsData?.data || shippingCostsData || [];
    const cities = shippingCosts.map(cost => cost.city);

    // Set shipping_cost_id when city is selected
    useEffect(() => {
        if (newAddress.city) {
            const selectedCost = shippingCosts.find(cost => cost.city === newAddress.city);
            if (selectedCost) {
                setNewAddress(prev => ({
                    ...prev,
                    shipping_cost_id: selectedCost.id
                }));
            }
        }
    }, [newAddress.city, shippingCosts]);

    const handleAddNewAddress = async () => {
        if (!newAddress.shipping_name || !newAddress.shipping_phone ||
            !newAddress.address_line1 || !newAddress.city) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const result = await addShippingAddress(newAddress).unwrap();
            onSelectAddress(result.data || result);
            setShowNewAddressForm(false);
            setNewAddress({
                shipping_name: '',
                shipping_phone: '',
                email: '',
                address_line1: '',
                address_line2: '',
                city: '',
                postal_code: '',
                shipping_cost_id: ''
            });
        } catch (error) {
            console.error('Error adding address:', error);
            alert('Failed to add address. Please try again.');
        }
    };

    // Helper function to display address information
    const getAddressDisplay = (address) => {
        return {
            name: address.shipping_name || address.name || 'Unknown',
            phone: address.shipping_phone || address.phone || '',
            email: address.email || '',
            address: `${address.address_line1 || address.address || ''} ${address.address_line2 || ''}`.trim(),
            city: address.city || '',
            postal_code: address.postal_code || '',
            shipping_cost: address.ShippingCost?.cost || address.shipping_cost || 0
        };
    };

    return (
        <div className="fixed inset-0 backdrop-brightness-40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">Select Address</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Stored Addresses */}
                    <div className="space-y-4 mb-6">
                        <h4 className="font-medium text-gray-900">Saved Addresses</h4>
                        {addresses.length === 0 ? (
                            <p className="text-gray-500 text-sm">No saved addresses found.</p>
                        ) : (
                            addresses.map(address => {
                                const displayAddress = getAddressDisplay(address);
                                return (
                                    <div
                                        key={address.id}
                                        onClick={() => {
                                            onSelectAddress(address);
                                            onClose();
                                        }}
                                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddress?.id === address.id
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{displayAddress.name}</p>
                                                <p className="text-sm text-gray-600">{displayAddress.phone}</p>
                                                {displayAddress.email && (
                                                    <p className="text-sm text-gray-600">{displayAddress.email}</p>
                                                )}
                                                <p className="text-sm text-gray-600 mt-1">{displayAddress.address}</p>
                                                <p className="text-sm text-gray-600">{displayAddress.city}, {displayAddress.postal_code}</p>
                                                {displayAddress.shipping_cost > 0 && (
                                                    <p className="text-sm text-green-600 mt-1">
                                                        Shipping: LKR {parseFloat(displayAddress.shipping_cost).toFixed(2)}
                                                    </p>
                                                )}
                                                {address.is_default && (
                                                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Add New Address */}
                    <div className="border-t pt-6">
                        {!showNewAddressForm ? (
                            <button
                                onClick={() => setShowNewAddressForm(true)}
                                className="flex items-center text-red-500 hover:text-red-700"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                <span>Add New Address</span>
                            </button>
                        ) : (
                            <>
                                <div className="flex items-center mb-4">
                                    <Plus className="w-5 h-5 text-red-500 mr-2" />
                                    <h4 className="font-medium text-gray-900">Add New Address</h4>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Full Name *"
                                        value={newAddress.shipping_name}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, shipping_name: e.target.value }))}
                                        className="border border-gray-300 rounded-lg p-3 w-full"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Phone Number *"
                                        value={newAddress.shipping_phone}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, shipping_phone: e.target.value }))}
                                        className="border border-gray-300 rounded-lg p-3 w-full"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={newAddress.email}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, email: e.target.value }))}
                                        className="border border-gray-300 rounded-lg p-3 w-full sm:col-span-2"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Address Line 1 *"
                                        value={newAddress.address_line1}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, address_line1: e.target.value }))}
                                        className="border border-gray-300 rounded-lg p-3 w-full sm:col-span-2"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Address Line 2 (Optional)"
                                        value={newAddress.address_line2}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, address_line2: e.target.value }))}
                                        className="border border-gray-300 rounded-lg p-3 w-full sm:col-span-2"
                                    />

                                    {/* City Dropdown */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            City *
                                        </label>
                                        <select
                                            value={newAddress.city}
                                            onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                                            className="border border-gray-300 rounded-lg p-3 w-full"
                                        >
                                            <option value="">Select a City</option>
                                            {cities.map(city => (
                                                <option key={city} value={city}>
                                                    {city}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Postal Code"
                                        value={newAddress.postal_code}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                                        className="border border-gray-300 rounded-lg p-3 w-full"
                                    />
                                </div>

                                <div className="flex space-x-3 mt-4">
                                    <button
                                        onClick={handleAddNewAddress}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Save Address
                                    </button>
                                    <button
                                        onClick={() => setShowNewAddressForm(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddressModal;