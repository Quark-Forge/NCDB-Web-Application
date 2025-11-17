import { Eye, Pencil, Trash2, XCircle, Filter, RefreshCw } from 'lucide-react';
import Badges from '../../common/Badges';
import Card from '../../common/Card';
import Table from '../../common/Table';
import Pagination from '../../common/Pagination';
import { getStatusBadge } from '../../../utils/statusHelpers';

const PurchaseTable = ({
    data,
    page,
    limit,
    onPageChange,
    onCancelRequest,
    onDeleteRequest,
    onEditRequest,
    onViewDetails
}) => {

    const canEditDelete = true; // You can add role-based logic here similar to your reference

    return (
        <Card>
            <Table
                headers={['Item', 'Supplier', 'Quantity', 'Urgency', 'Status', 'Created', 'Actions']}
                className="rounded-lg"
            >
                {data?.data?.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                                <div className="text-sm font-medium text-gray-900">
                                    {request.SupplierItem?.Product?.name || 'Unknown Item'}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {request.notes_from_requester?.substring(0, 50)}
                                    {request.notes_from_requester?.length > 50 && '...'}
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                                {request.SupplierItem?.Supplier?.name || 'Unknown Supplier'}
                            </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {request.quantity}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            <Badges
                                variant={
                                    request.urgency === 'high' ? 'danger' :
                                        request.urgency === 'medium' ? 'warning' : 'neutral'
                                }
                                size="sm"
                            >
                                {request.urgency}
                            </Badges>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                            {getStatusBadge(request.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-3">
                                {/* View Details Button */}
                                <button
                                    onClick={() => onViewDetails?.(request)}
                                    className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-50 transition-colors"
                                    aria-label="View request details"
                                >
                                    <Eye size={18} />
                                </button>

                                {/* Edit Button - Only for pending requests */}
                                {canEditDelete && request.status === 'pending' && (
                                    <button
                                        onClick={() => onEditRequest?.(request)}
                                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                                        aria-label="Edit request"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                )}

                                {/* Cancel Button - Only for pending requests */}
                                {canEditDelete && request.status === 'pending' && (
                                    <button
                                        onClick={() => onCancelRequest({ isOpen: true, request })}
                                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50 transition-colors"
                                        aria-label="Cancel request"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                )}

                                {/* Restore Button - For cancelled requests */}
                                {canEditDelete && request.status === 'cancelled' && (
                                    <button
                                        onClick={() => console.log('Restore:', request.id)}
                                        className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors"
                                        aria-label="Restore request"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                )}

                                {/* Delete Button - For all requests except pending */}
                                {canEditDelete && request.status !== 'pending' && (
                                    <button
                                        onClick={() => onDeleteRequest({ isOpen: true, request })}
                                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                                        aria-label="Delete request"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </Table>

            {/* Empty State */}
            {data?.data?.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <Filter className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                    <p className="text-gray-500">
                        Get started by creating your first purchase request.
                    </p>
                </div>
            )}

            {/* Pagination */}
            {data?.data?.length > 0 && (
                <div className="border-t border-gray-200">
                    <Pagination
                        currentPage={page}
                        totalPages={Math.ceil(data.count / limit)}
                        onPageChange={onPageChange}
                        className="bg-white"
                    />
                </div>
            )}
        </Card>
    );
};

export default PurchaseTable;