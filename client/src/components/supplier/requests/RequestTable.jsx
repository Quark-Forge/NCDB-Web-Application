import { MoreVertical, Eye, CheckCircle, XCircle, User, Calendar } from 'lucide-react';
import Badges from '../../common/Badges';
import Dropdown from '../../common/Dropdown';
import Table from '../../common/Table';

const RequestTable = ({ requests, onStatusUpdate }) => {
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

    const actionMenuOptions = (request) => {
        const options = [
            {
                label: 'View Details',
                icon: <Eye className="h-4 w-4 mr-2" />,
                onClick: () => console.log('View details:', request.id)
            }
        ];

        // Only show approve/reject for pending requests
        if (request.status === 'pending') {
            options.push(
                {
                    label: 'Approve',
                    icon: <CheckCircle className="h-4 w-4 mr-2 text-green-600" />,
                    onClick: () => onStatusUpdate(request, 'approve'),
                    className: 'text-green-600 hover:text-green-700'
                },
                {
                    label: 'Reject',
                    icon: <XCircle className="h-4 w-4 mr-2 text-red-600" />,
                    onClick: () => onStatusUpdate(request, 'reject'),
                    className: 'text-red-600 hover:text-red-700'
                }
            );
        }

        return options;
    };

    return (
        <Table
            headers={['Item', 'Quantity', 'Urgency', 'Status', 'Requested By', 'Requested Date', 'Actions']}
            className="rounded-lg"
        >
            {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                            <div className="text-sm font-medium text-gray-900">
                                {request.SupplierItem?.Product?.name || request.SupplierItem?.name || 'Unknown Item'}
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
                            {new Date(request.created_at).toLocaleDateString()}
                        </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Dropdown
                            options={actionMenuOptions(request)}
                            value={null}
                            onChange={() => { }}
                            buttonClassName="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            renderSelected={() => <MoreVertical className="h-4 w-4" />}
                            menuClassName="w-48"
                        />
                    </td>
                </tr>
            ))}
        </Table>
    );
};

export default RequestTable;