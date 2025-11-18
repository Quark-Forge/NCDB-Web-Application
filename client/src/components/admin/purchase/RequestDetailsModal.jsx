import { X, Package, User, Calendar, FileText, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import Badges from '../../common/Badges';
import Button from '../../common/Button';

const RequestDetailsModal = ({ isOpen, request, onClose }) => {
    if (!isOpen || !request) return null;

    const getStatusBadge = (status) => {
        const variants = {
            pending: { variant: 'warning', icon: <Clock className="h-4 w-4 mr-1" /> },
            approved: { variant: 'success', icon: <CheckCircle className="h-4 w-4 mr-1" /> },
            rejected: { variant: 'danger', icon: <XCircle className="h-4 w-4 mr-1" /> },
            cancelled: { variant: 'neutral', icon: <XCircle className="h-4 w-4 mr-1" /> }
        };

        const { variant, icon } = variants[status] || { variant: 'neutral', icon: null };

        return (
            <Badges variant={variant} size="md">
                {icon}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badges>
        );
    };

    const formatCurrency = (amount) => {
        return `LKR ${parseFloat(amount || 0).toLocaleString()}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 backdrop-brightness-40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Purchase Request Details
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            ID: {request.id}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Product Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                                    Product Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Product Name</p>
                                        <p className="text-base font-semibold text-gray-900">
                                            {request.SupplierItem?.Product?.name || 'Unknown Product'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">SKU</p>
                                        <p className="text-base font-semibold text-gray-900">
                                            {request.SupplierItem?.Product?.sku || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Supplier SKU</p>
                                        <p className="text-base font-semibold text-gray-900">
                                            {request.SupplierItem?.supplier_sku || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Quantity</p>
                                        <p className="text-base font-semibold text-gray-900">
                                            {request.quantity} {request.SupplierItem?.unit_symbol || 'units'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Request Details */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                                    Request Details
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Urgency</p>
                                        <Badges
                                            variant={
                                                request.urgency === 'high' ? 'danger' :
                                                    request.urgency === 'medium' ? 'warning' : 'neutral'
                                            }
                                        >
                                            {request.urgency}
                                        </Badges>
                                    </div>
                                    {request.notes_from_requester && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Requester Notes</p>
                                            <p className="text-gray-900 mt-1 bg-white p-3 rounded border">
                                                {request.notes_from_requester}
                                            </p>
                                        </div>
                                    )}
                                    {request.notes_from_supplier && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Supplier Notes</p>
                                            <p className="text-gray-900 mt-1 bg-white p-3 rounded border">
                                                {request.notes_from_supplier}
                                            </p>
                                        </div>
                                    )}
                                    {request.rejection_reason && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Rejection Reason</p>
                                            <p className=" mt-1 bg-white p-3 rounded border text-red-600">
                                                {request.rejection_reason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Status & Timeline */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                                    <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                                    Status & Timeline
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium text-gray-500">Current Status</p>
                                        {getStatusBadge(request.status)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Created</p>
                                        <p className="text-sm text-gray-900">{formatDate(request.createdAt)}</p>
                                    </div>
                                    {request.updatedAt !== request.createdAt && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Last Updated</p>
                                            <p className="text-sm text-gray-900">{formatDate(request.updatedAt)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Supplier Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                                    <User className="h-5 w-5 mr-2 text-purple-600" />
                                    Supplier Information
                                </h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Name</p>
                                        <p className="text-sm text-gray-900">
                                            {request.SupplierItem?.Supplier?.name || 'Unknown Supplier'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email</p>
                                        <p className="text-sm text-gray-900">
                                            {request.SupplierItem?.Supplier?.email || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Contact</p>
                                        <p className="text-sm text-gray-900">
                                            {request.SupplierItem?.Supplier?.contact_number || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Information */}
                            {(request.SupplierItem?.price || request.supplier_quote) && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                                        <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                                        Financial Information
                                    </h3>
                                    <div className="space-y-2">
                                        {request.SupplierItem?.purchase_price && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Current Purchase Price</p>
                                                <p className="text-sm text-gray-900">
                                                    {formatCurrency(request.SupplierItem.purchase_price)}
                                                </p>
                                            </div>
                                        )}
                                        {request.SupplierItem?.price && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Current selling Price</p>
                                                <p className="text-sm text-gray-900">
                                                    {formatCurrency(request.SupplierItem.price)}
                                                </p>
                                            </div>
                                        )}
                                        {request.SupplierItem?.discount_price && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Current discount Price</p>
                                                <p className="text-sm text-gray-900">
                                                    {formatCurrency(request.SupplierItem.discount_price)}
                                                </p>
                                            </div>
                                        )}
                                        {request.supplier_quote && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Supplier Quote</p>
                                                <p className="text-sm font-semibold text-green-600">
                                                    {formatCurrency(request.supplier_quote)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200">
                    <Button variant="primary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RequestDetailsModal;