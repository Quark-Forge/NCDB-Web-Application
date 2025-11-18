import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Package,
    Calendar,
    User,
    Clock,
    CheckCircle,
    XCircle,
    FileText,
    Mail,
    Phone,
} from 'lucide-react';
import Badges from '../../components/common/Badges';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import {
    useGetSupplierItemRequestByIdQuery,
    useUpdateSupplierItemRequestStatusMutation
} from '../../slices/PurchaseApiSlice';

const SupplierRequestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [supplierQuote, setSupplierQuote] = useState('');
    const [notesFromSupplier, setNotesFromSupplier] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    const {
        data: requestData,
        error,
        isLoading,
        refetch
    } = useGetSupplierItemRequestByIdQuery(id);

    const [updateRequestStatus, { isLoading: isUpdating }] = useUpdateSupplierItemRequestStatusMutation();

    useEffect(() => {
        if (requestData?.data) {
            setRequest(requestData.data);
            // Pre-fill supplier quote with current price if available
            if (requestData.data.SupplierItem?.price && !requestData.data.supplier_quote) {
                setSupplierQuote(requestData.data.SupplierItem.purchase_price.toString());
            }
        }
    }, [requestData]);

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

    const getUrgencyBadge = (urgency) => {
        const variants = {
            high: { variant: 'danger', color: 'text-red-600', bg: 'bg-red-50' },
            medium: { variant: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-50' },
            low: { variant: 'neutral', color: 'text-gray-600', bg: 'bg-gray-50' }
        };

        const { variant, color, bg } = variants[urgency] || variants.low;

        return (
            <Badges variant={variant}>
                {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Priority
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

    const handleApprove = async () => {
        if (!supplierQuote) {
            alert('Please provide a supplier quote');
            return;
        }

        try {
            await updateRequestStatus({
                id,
                status: 'approved',
                supplier_quote: parseFloat(supplierQuote),
                notes_from_supplier: notesFromSupplier || null
            }).unwrap();

            setShowApproveModal(false);
            refetch(); // Refresh the request data
        } catch (error) {
            console.error('Failed to approve request:', error);
            alert('Failed to approve request. Please try again.');
        }
    };

    const handleReject = async () => {
        if (!rejectionReason) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            await updateRequestStatus({
                id,
                status: 'rejected',
                rejection_reason: rejectionReason,
                notes_from_supplier: notesFromSupplier || null
            }).unwrap();

            setShowRejectModal(false);
            refetch(); // Refresh the request data
        } catch (error) {
            console.error('Failed to reject request:', error);
            alert('Failed to reject request. Please try again.');
        }
    };

    const resetModals = () => {
        setShowApproveModal(false);
        setShowRejectModal(false);
        setSupplierQuote(request?.SupplierItem?.price?.toString() || '');
        setNotesFromSupplier('');
        setRejectionReason('');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <ErrorMessage
                    message="Failed to load request details"
                    onRetry={refetch}
                    buttonText="Retry"
                />
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Request Not Found</h3>
                    <p className="text-gray-500 mb-4">The requested purchase request could not be found.</p>
                    <Button variant="primary" onClick={() => navigate('/suppliers/requests')}>
                        Back to Requests
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/suppliers/requests')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Requests
                    </Button>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Purchase Request #{request.id.slice(0, 8)}...
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Requested on {formatDate(request.createdAt)}
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                            {getStatusBadge(request.status)}
                            {getUrgencyBadge(request.urgency)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - 2/3 width */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Information */}
                        <Card>
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                                    Product Information
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Product Name</h3>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {request.SupplierItem?.Product?.name || 'Unknown Product'}
                                        </p>
                                        {request.SupplierItem?.Product?.description && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                {request.SupplierItem.Product.description}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">SKU</h3>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {request.SupplierItem?.Product?.sku || 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Supplier SKU</h3>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {request.SupplierItem?.supplier_sku || 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Quantity Requested</h3>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {request.quantity} {request.SupplierItem?.unit_symbol || 'units'}
                                        </p>
                                    </div>

                                    {request.SupplierItem?.price && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Current Price</h3>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {formatCurrency(request.SupplierItem.purchase_price)}
                                            </p>
                                        </div>
                                    )}

                                    {request.supplier_quote && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Your Quote</h3>
                                            <p className="text-lg font-semibold text-green-600">
                                                {formatCurrency(request.supplier_quote)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Request Details */}
                        <Card>
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                                    Request Details
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {request.notes_from_requester && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Requester Notes</h3>
                                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border">
                                                {request.notes_from_requester}
                                            </p>
                                        </div>
                                    )}

                                    {request.notes_from_supplier && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Your Notes</h3>
                                            <p className="text-gray-900 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                {request.notes_from_supplier}
                                            </p>
                                        </div>
                                    )}

                                    {request.rejection_reason && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Rejection Reason</h3>
                                            <p className="text-gray-900 bg-red-50 p-3 rounded-lg border border-red-200">
                                                {request.rejection_reason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar - 1/3 width */}
                    <div className="space-y-6">
                        {/* Requester Information */}
                        <Card>
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-purple-600" />
                                    Requester Information
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Name</h3>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {request.User?.name || 'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                        <div className="flex items-center text-sm text-gray-900">
                                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                            {request.User?.email || 'N/A'}
                                        </div>
                                    </div>

                                    {request.User?.phone && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                                {request.User.phone}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Timeline & Actions */}
                        <Card>
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                                    Timeline
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">Request Created</p>
                                            <p className="text-sm text-gray-500">{formatDate(request.createdAt)}</p>
                                        </div>
                                    </div>

                                    {request.updatedAt !== request.createdAt && (
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                                                <p className="text-sm text-gray-500">{formatDate(request.updatedAt)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {request.status === 'pending' && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <p className="text-sm text-gray-600 mb-3">
                                                This request is awaiting your response.
                                            </p>
                                        </div>
                                    )}

                                    {request.status === 'approved' && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="flex items-center text-green-600 mb-2">
                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                <span className="text-sm font-medium">Request Approved</span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                You have approved this request. The requester has been notified.
                                            </p>
                                        </div>
                                    )}

                                    {request.status === 'rejected' && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="flex items-center text-red-600 mb-2">
                                                <XCircle className="h-5 w-5 mr-2" />
                                                <span className="text-sm font-medium">Request Rejected</span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                You have rejected this request. The requester has been notified.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        {request.status === 'pending' && (
                            <Card>
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                                </div>
                                <div className="p-6 space-y-3">
                                    <Button
                                        variant="success"
                                        className="w-full justify-center"
                                        onClick={() => setShowApproveModal(true)}
                                        disabled={isUpdating}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        {isUpdating ? 'Processing...' : 'Approve Request'}
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="w-full justify-center"
                                        onClick={() => setShowRejectModal(true)}
                                        disabled={isUpdating}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        {isUpdating ? 'Processing...' : 'Reject Request'}
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Approve Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 backdrop-brightness-40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Request</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Supplier Quote (LKR) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={supplierQuote}
                                    onChange={(e) => setSupplierQuote(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder="Enter your quote"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    value={notesFromSupplier}
                                    onChange={(e) => setNotesFromSupplier(e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder="Add any additional notes for the requester..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={resetModals}
                                disabled={isUpdating}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="success"
                                onClick={handleApprove}
                                disabled={isUpdating || !supplierQuote}
                            >
                                {isUpdating ? 'Approving...' : 'Approve Request'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 backdrop-brightness-40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Request</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rejection Reason *
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    placeholder="Please provide a reason for rejecting this request..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    value={notesFromSupplier}
                                    onChange={(e) => setNotesFromSupplier(e.target.value)}
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    placeholder="Add any additional notes..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={resetModals}
                                disabled={isUpdating}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleReject}
                                disabled={isUpdating || !rejectionReason}
                            >
                                {isUpdating ? 'Rejecting...' : 'Reject Request'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierRequestDetail;