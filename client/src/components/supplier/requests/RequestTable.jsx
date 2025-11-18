import { Eye, CheckCircle, XCircle, User, Calendar, Clock, Printer } from 'lucide-react';
import Badges from '../../common/Badges';
import Table from '../../common/Table';
import { useNavigate } from 'react-router-dom';

const RequestTable = ({ requests, onStatusUpdate, onViewDetails, onPrintSingle }) => {
    const getStatusBadge = (status) => {
        const variants = {
            pending: { variant: 'warning', icon: <Clock className="h-3 w-3 mr-1" /> },
            approved: { variant: 'success', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
            rejected: { variant: 'danger', icon: <XCircle className="h-3 w-3 mr-1" /> },
            cancelled: { variant: 'neutral', icon: <Clock className="h-3 w-3 mr-1" /> }
        };

        const { variant, icon } = variants[status] || { variant: 'neutral', icon: null };

        return (
            <Badges variant={variant} size="sm">
                {icon}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badges>
        );
    };

    const navigate = useNavigate();

    const getUrgencyBadge = (urgency) => {
        const variants = {
            high: 'danger',
            medium: 'warning',
            low: 'neutral'
        };

        return (
            <Badges variant={variants[urgency]} size="sm">
                {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
            </Badges>
        );
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'Not quoted';
        return `LKR ${parseFloat(amount).toLocaleString()}`;
    };

    return (
        <Table
            headers={['Item', 'Quantity', 'Urgency', 'Status', 'Requested By', 'Requested Date', 'Your Quote', 'Actions']}
            className="rounded-lg"
        >
            {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                            <div className="text-sm font-medium text-gray-900">
                                {request.product_name || request.SupplierItem?.Product?.name || 'Unknown Item'}
                            </div>
                            <div className="text-sm text-gray-500">
                                {request.notes_from_requester && (
                                    <>
                                        {request.notes_from_requester.substring(0, 50)}
                                        {request.notes_from_requester.length > 50 && '...'}
                                    </>
                                )}
                            </div>
                        </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.quantity}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                        {getUrgencyBadge(request.urgency)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            {request.User?.name || 'Unknown'}
                        </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            {new Date(request.created_at || request.createdAt).toLocaleDateString()}
                        </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(request.supplier_quote)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                            {/* Print Button */}
                            <button
                                onClick={() => onPrintSingle?.(request)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                                aria-label="Print request"
                            >
                                <Printer size={16} />
                            </button>

                            {/* View Details Button */}
                            <button
                                onClick={() => navigate(`/suppliers/requests/${request.id}`)}
                                className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-50 transition-colors"
                                aria-label="View request details"
                            >
                                <Eye size={16} />
                            </button>

                            {/* Approve Button - Only for pending requests */}
                            {request.status === 'pending' && (
                                <button
                                    onClick={() => onStatusUpdate(request, 'approve')}
                                    className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors"
                                    aria-label="Approve request"
                                >
                                    <CheckCircle size={16} />
                                </button>
                            )}

                            {/* Reject Button - Only for pending requests */}
                            {request.status === 'pending' && (
                                <button
                                    onClick={() => onStatusUpdate(request, 'reject')}
                                    className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                                    aria-label="Reject request"
                                >
                                    <XCircle size={16} />
                                </button>
                            )}
                        </div>
                    </td>
                </tr>
            ))}
        </Table>
    );
};

export default RequestTable;