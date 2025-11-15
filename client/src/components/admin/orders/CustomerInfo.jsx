import { UserCircle, Phone } from 'lucide-react';

const CustomerInfo = ({ order }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <UserCircle size={20} /> Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
                    <div className="space-y-3">
                        {/* Customer Account Info */}
                        {order.customer && (
                            <div className="pb-2 border-b border-gray-100">
                                <p className="text-xs font-medium text-gray-500 mb-1">Registered Customer</p>
                                <div className="flex items-center gap-2">
                                    {order.customer.image_url ? (
                                        <img
                                            src={order.customer.image_url}
                                            alt={order.customer.name}
                                            className="w-6 h-6 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                    ) : (
                                        <UserCircle size={16} className="text-gray-400" />
                                    )}
                                    <span className="text-sm font-medium text-gray-900">
                                        {order.customer.name}
                                    </span>
                                </div>
                                {order.customer.email && (
                                    <p className="text-xs text-gray-600 mt-1">{order.customer.email}</p>
                                )}
                                {order.customer.contact_number && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <Phone size={12} className="text-gray-400" />
                                        <p className="text-xs text-gray-600">{order.customer.contact_number}</p>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Customer ID: #{order.customer.id}</p>
                                {order.customer.is_verified !== undefined && (
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${order.customer.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {order.customer.is_verified ? 'Verified' : 'Not Verified'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Shipping Contact */}
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Shipping Contact</p>
                            <p className="text-sm text-gray-900 font-medium">{order.shipping_name}</p>
                            <p className="text-sm text-gray-600">{order.shipping_phone}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h4>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-900">{order.address_line1}</p>
                        {order.address_line2 && (
                            <p className="text-sm text-gray-900">{order.address_line2}</p>
                        )}
                        <p className="text-sm text-gray-600">
                            {order.city}, {order.state} {order.postal_code}
                        </p>
                        {order.country && (
                            <p className="text-sm text-gray-600">{order.country}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerInfo;