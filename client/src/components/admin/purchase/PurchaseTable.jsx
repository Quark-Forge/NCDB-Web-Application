import { Eye, Pencil, Trash2, XCircle, Filter, Printer, Download } from 'lucide-react';
import Badges from '../../common/Badges';
import Card from '../../common/Card';
import Table from '../../common/Table';
import Pagination from '../../common/Pagination';
import ExportPrintBar from '../../common/ExportPrintBar';
import { getStatusBadge } from '../../../utils/statusHelpers';
import { useExport } from '../../../hooks/useExport';
import { usePrint } from '../../../hooks/usePrint';

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
    const { exportToCSV, isExporting } = useExport();
    const { printRef, handlePrint } = usePrint();

    const canEditDelete = true; // can add role-based logic here

    const canDeleteRequest = (request) => {
        // Only allow deletion for cancelled or pending requests
        return request.status === 'cancelled' || request.status === 'pending';
    };

    const canEditRequest = (request) => {
        // Only allow editing for pending requests
        return request.status === 'pending';
    };

    const canCancelRequest = (request) => {
        // Only allow cancellation for pending requests
        return request.status === 'pending';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return `LKR ${parseFloat(amount || 0).toLocaleString()}`;
    };

    const getUrgencyLabel = (urgency) => {
        const urgencyLabels = {
            high: 'High',
            medium: 'Medium',
            low: 'Low'
        };
        return urgencyLabels[urgency] || urgency;
    };

    const handleExport = () => {
        const exportHeaders = [
            { key: 'id', label: 'Request ID' },
            { key: 'product_name', label: 'Product Name' },
            { key: 'supplier_name', label: 'Supplier' },
            { key: 'quantity', label: 'Quantity' },
            { key: 'urgency', label: 'Urgency' },
            { key: 'status', label: 'Status' },
            { key: 'createdAt', label: 'Created Date' },
            { key: 'notes_from_requester', label: 'Requester Notes' },
            { key: 'supplier_quote', label: 'Supplier Quote' },
            { key: 'requester_name', label: 'Requester' }
        ];

        const exportData = data?.data?.map(request => ({
            id: request.id,
            product_name: request.SupplierItem?.Product?.name || 'Unknown Product',
            supplier_name: request.SupplierItem?.Supplier?.name || 'Unknown Supplier',
            quantity: request.quantity,
            urgency: getUrgencyLabel(request.urgency),
            status: request.status,
            createdAt: formatDate(request.createdAt),
            notes_from_requester: request.notes_from_requester || 'N/A',
            supplier_quote: request.supplier_quote ? formatCurrency(request.supplier_quote) : 'N/A',
            requester_name: request.User?.name || 'Unknown Requester'
        })) || [];

        exportToCSV(exportData, exportHeaders, 'purchase_requests', {
            dateFields: ['createdAt']
        });
    };

    const handleSinglePrint = (request) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Purchase Request #${request.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333; }
                        .section { margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #f5f5f5; font-weight: bold; }
                        .status-pending { color: #f59e0b; }
                        .status-approved { color: #10b981; }
                        .status-rejected { color: #ef4444; }
                        .status-cancelled { color: #6b7280; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Purchase Request Details</h1>
                        <p>Request ID: ${request.id}</p>
                        <p>Generated on ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <div class="section">
                        <h3>Basic Information</h3>
                        <table>
                            <tr><th>Request ID:</th><td>${request.id}</td></tr>
                            <tr><th>Product:</th><td>${request.SupplierItem?.Product?.name || 'Unknown Product'}</td></tr>
                            <tr><th>Supplier:</th><td>${request.SupplierItem?.Supplier?.name || 'Unknown Supplier'}</td></tr>
                            <tr><th>Quantity:</th><td>${request.quantity}</td></tr>
                            <tr><th>Urgency:</th><td>${getUrgencyLabel(request.urgency)}</td></tr>
                            <tr><th>Status:</th><td class="status-${request.status}">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</td></tr>
                            <tr><th>Created:</th><td>${formatDate(request.createdAt)}</td></tr>
                        </table>
                    </div>

                    <div class="section">
                        <h3>Financial Information</h3>
                        <table>
                            <tr><th>Supplier Quote:</th><td>${request.supplier_quote ? formatCurrency(request.supplier_quote) : 'Not provided'}</td></tr>
                        </table>
                    </div>

                    <div class="section">
                        <h3>Notes</h3>
                        <table>
                            <tr><th>Requester Notes:</th><td>${request.notes_from_requester || 'No notes provided'}</td></tr>
                            <tr><th>Supplier Notes:</th><td>${request.notes_from_supplier || 'No notes provided'}</td></tr>
                            ${request.rejection_reason ? `<tr><th>Rejection Reason:</th><td>${request.rejection_reason}</td></tr>` : ''}
                        </table>
                    </div>

                    <div class="section">
                        <h3>Contact Information</h3>
                        <table>
                            <tr><th>Requester:</th><td>${request.User?.name || 'Unknown'}</td></tr>
                            <tr><th>Requester Email:</th><td>${request.User?.email || 'N/A'}</td></tr>
                            <tr><th>Supplier Contact:</th><td>${request.SupplierItem?.Supplier?.email || 'N/A'}</td></tr>
                        </table>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <>
            <Card className="p-0">
                <div className="px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b">
                    <h2 className="text-sm font-semibold mb-2 sm:mb-0">
                        Purchase Requests ({data?.count || 0})
                    </h2>
                    <ExportPrintBar
                        onExport={handleExport}
                        onPrint={handlePrint}
                        isExporting={isExporting}
                        exportDisabled={!data?.data || data.data.length === 0}
                        printDisabled={!data?.data || data.data.length === 0}
                        exportLabel="Export CSV"
                        printLabel="Print Report"
                    />
                </div>

                <div className="relative overflow-x-auto">
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
                                    <div className="flex justify-end space-x-2">
                                        {/* View Details Button */}
                                        <button
                                            onClick={() => onViewDetails?.(request)}
                                            className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-50 transition-colors"
                                            aria-label="View request details"
                                        >
                                            <Eye size={16} />
                                        </button>

                                        {/* Print Single Button */}
                                        <button
                                            onClick={() => handleSinglePrint(request)}
                                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                                            aria-label="Print request"
                                        >
                                            <Printer size={16} />
                                        </button>

                                        {/* Edit Button - Only for pending requests */}
                                        {canEditDelete && canEditRequest(request) && (
                                            <button
                                                onClick={() => onEditRequest?.(request)}
                                                className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors"
                                                aria-label="Edit request"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        )}

                                        {/* Cancel Button - Only for pending requests */}
                                        {canEditDelete && canCancelRequest(request) && (
                                            <button
                                                onClick={() => onCancelRequest({ isOpen: true, request })}
                                                className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50 transition-colors"
                                                aria-label="Cancel request"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        )}

                                        {/* Delete Button - Only for cancelled or pending requests */}
                                        {canEditDelete && canDeleteRequest(request) && (
                                            <button
                                                onClick={() => onDeleteRequest({ isOpen: true, request })}
                                                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                                                aria-label="Delete request"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </Table>
                </div>

                {/* Empty State */}
                {(!data?.data || data.data.length === 0) && (
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

            {/* Hidden printable content for bulk printing */}
            <div style={{ display: 'none' }}>
                <div ref={printRef}>
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold">Purchase Requests Report</h1>
                            <p className="text-gray-600">
                                Generated on {new Date().toLocaleDateString()} | Total: {data?.count || 0} requests
                            </p>
                        </div>

                        <table className="min-w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2 text-left">Request ID</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Supplier</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Urgency</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Created Date</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Requester Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.data?.map((request) => (
                                    <tr key={request.id}>
                                        <td className="border border-gray-300 px-4 py-2">{request.id}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {request.SupplierItem?.Product?.name || 'Unknown Product'}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {request.SupplierItem?.Supplier?.name || 'Unknown Supplier'}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">{request.quantity}</td>
                                        <td className="border border-gray-300 px-4 py-2">{getUrgencyLabel(request.urgency)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{request.status}</td>
                                        <td className="border border-gray-300 px-4 py-2">{formatDate(request.createdAt)}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {request.notes_from_requester || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PurchaseTable;