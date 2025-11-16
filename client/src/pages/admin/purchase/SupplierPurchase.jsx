import { useState } from 'react';
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    Package,
    User,
    DollarSign
} from 'lucide-react';
import {
    useGetMySupplierItemRequestsQuery,
    useUpdateSupplierItemRequestStatusMutation
} from '../../../slices/PurchaseApiSlice';
import Badges from '../../../components/common/Badges';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Dropdown from '../../../components/common/Dropdown';
import ErrorMessage from '../../../components/common/ErrorMessage';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Pagination from '../../../components/common/Pagination';
import Table from '../../../components/common/Table';
import StatusUpdateModal from '../../../components/supplier/requests/StatusUpdateModal';

const SupplierPurchases = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusUpdateModal, setStatusUpdateModal] = useState({ isOpen: false, request: null, action: '' });

    const { data, error, isLoading, refetch } = useGetMySupplierItemRequestsQuery({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        limit,
        search: searchTerm || undefined
    });

    const [updateStatus] = useUpdateSupplierItemRequestStatusMutation();

    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

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

    const handleStatusUpdate = async (requestId, status, data) => {
        try {
            await updateStatus({
                id: requestId,
                status,
                ...data
            }).unwrap();
            setStatusUpdateModal({ isOpen: false, request: null, action: '' });
            refetch();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const actionMenuOptions = (request) => {
        const options = [
            {
                label: 'View Details',
                icon: <Eye className="h-4 w-4 mr-2" />,
                onClick: () => console.log('View:', request.id)
            }
        ];

        if (request.status === 'pending') {
            options.push(
                {
                    label: 'Approve',
                    icon: <CheckCircle className="h-4 w-4 mr-2 text-green-600" />,
                    onClick: () => setStatusUpdateModal({ isOpen: true, request, action: 'approve' }),
                    className: 'text-green-600 hover:text-green-700'
                },
                {
                    label: 'Reject',
                    icon: <XCircle className="h-4 w-4 mr-2 text-red-600" />,
                    onClick: () => setStatusUpdateModal({ isOpen: true, request, action: 'reject' }),
                    className: 'text-red-600 hover:text-red-700'
                }
            );
        }

        return options;
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
            <ErrorMessage
                message="Failed to load purchase requests"
                onRetry={refetch}
                buttonText="Retry"
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Purchase Requests</h1>
                    <p className="text-gray-600 mt-2">Manage and respond to purchase requests from customers</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card className="p-6 bg-white">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {data?.stats?.pending || 0}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {data?.stats?.approved || 0}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {data?.stats?.rejected || 0}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white">
                        <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Package className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {data?.stats?.total || 0}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters and Actions */}
                <Card className="p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search requests..."
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Status Filter */}
                            <Dropdown
                                options={statusOptions}
                                value={statusFilter}
                                onChange={setStatusFilter}
                                buttonClassName="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                renderSelected={(option) => (
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        {option.label}
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </Card>

                {/* Requests Table */}
                <Card>
                    <Table
                        headers={['Item', 'Quantity', 'Urgency', 'Status', 'Requested By', 'Requested Date', 'Actions']}
                        className="rounded-lg"
                    >
                        {data?.data?.map((request) => (
                            <tr key={request.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {request.SupplierItem?.Product?.name || request.SupplierItem?.name || 'Unknown Item'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {request.notes_from_requester?.substring(0, 50)}
                                            {request.notes_from_requester?.length > 50 && '...'}
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
                                        buttonClassName="p-2 hover:bg-gray-100 rounded-lg"
                                        renderSelected={() => <MoreVertical className="h-4 w-4" />}
                                        menuClassName="w-48"
                                    />
                                </td>
                            </tr>
                        ))}
                    </Table>

                    {/* Empty State */}
                    {data?.data?.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <Package className="h-12 w-12 mx-auto" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                            <p className="text-gray-500">
                                {statusFilter !== 'all'
                                    ? `No ${statusFilter} requests match your search.`
                                    : 'You don\'t have any purchase requests yet.'
                                }
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {data?.data?.length > 0 && (
                        <div className="border-t border-gray-200">
                            <Pagination
                                currentPage={page}
                                totalPages={Math.ceil(data.count / limit)}
                                onPageChange={setPage}
                                className="bg-white"
                            />
                        </div>
                    )}
                </Card>
            </div>

            {/* Status Update Modal */}
            <StatusUpdateModal
                isOpen={statusUpdateModal.isOpen}
                onClose={() => setStatusUpdateModal({ isOpen: false, request: null, action: '' })}
                request={statusUpdateModal.request}
                action={statusUpdateModal.action}
                onConfirm={handleStatusUpdate}
            />
        </div>
    );
};

export default SupplierPurchases;