import { useState, useEffect } from 'react';
import {
  Package,
  RefreshCw,
} from 'lucide-react';
import {
  useGetMySupplierItemRequestsQuery,
  useUpdateSupplierItemRequestStatusMutation
} from '../../slices/PurchaseApiSlice';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import StatusUpdateModal from '../../components/supplier/requests/StatusUpdateModal';
import RequestFilters from '../../components/supplier/requests/RequestFilters';
import RequestStats from '../../components/supplier/requests/RequestStats';
import RequestTable from '../../components/supplier/requests/RequestTable';
import ExportPrintBar from '../../components/common/ExportPrintBar';
import { useExport } from '../../hooks/useExport';
import { usePrint } from '../../hooks/usePrint';
import { toast } from 'react-toastify';

const Requests = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusUpdateModal, setStatusUpdateModal] = useState({
    isOpen: false,
    request: null,
    action: ''
  });

  const { exportToCSV, isExporting } = useExport();
  const { printRef, handlePrint } = usePrint();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data,
    error,
    isLoading,
    refetch
  } = useGetMySupplierItemRequestsQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    limit,
    search: debouncedSearchTerm || undefined
  });

  const [updateStatus] = useUpdateSupplierItemRequestStatusMutation();

  const handleStatusUpdate = async (requestId, status, updateData) => {
    try {
      await updateStatus({
        id: requestId,
        status,
        ...updateData
      }).unwrap();
      setStatusUpdateModal({ isOpen: false, request: null, action: '' });
      refetch();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleExport = () => {
    const exportHeaders = [
      { key: 'id', label: 'Request ID' },
      { key: 'product_name', label: 'Product Name' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'urgency', label: 'Urgency' },
      { key: 'status', label: 'Status' },
      { key: 'requester_name', label: 'Requested By' },
      { key: 'created_at', label: 'Requested Date' },
      { key: 'notes_from_requester', label: 'Requester Notes' },
      { key: 'supplier_quote', label: 'Your Quote' },
      { key: 'notes_from_supplier', label: 'Your Notes' },
      { key: 'rejection_reason', label: 'Rejection Reason' }
    ];

    const exportData = data?.data?.map(request => ({
      id: request.id,
      product_name: request.product_name || request.SupplierItem?.Product?.name || 'Unknown Item',
      quantity: request.quantity,
      urgency: request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1),
      status: request.status.charAt(0).toUpperCase() + request.status.slice(1),
      requester_name: request.User?.name || 'Unknown',
      created_at: request.created_at || request.createdAt,
      notes_from_requester: request.notes_from_requester || 'N/A',
      supplier_quote: request.supplier_quote ? `LKR ${parseFloat(request.supplier_quote).toLocaleString()}` : 'Not quoted',
      notes_from_supplier: request.notes_from_supplier || 'N/A',
      rejection_reason: request.rejection_reason || 'N/A'
    })) || [];

    exportToCSV(exportData, exportHeaders, 'supplier_requests', {
      dateFields: ['created_at']
    });
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Requests refreshed successfully!');
  };

  const handleViewDetails = (request) => {
    console.log('View details:', request);
    // Navigate to request details page
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading purchase requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage
          message={error.data?.message || 'Failed to load purchase requests'}
          onRetry={refetch}
          buttonText="Try Again"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Purchase Requests</h1>
              <p className="text-gray-600 mt-2">
                Manage and respond to purchase requests from customers
              </p>
            </div>
            <div className="flex gap-3">
              <ExportPrintBar
                onExport={handleExport}
                onPrint={handlePrint}
                isExporting={isExporting}
                exportDisabled={!data?.data?.length}
                printDisabled={!data?.data?.length}
                exportLabel="Export CSV"
                printLabel="Print Report"
              />
              <Button
                variant="secondary"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <RequestStats stats={data?.stats} />

        {/* Filters */}
        <RequestFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Requests Table */}
        <Card>
          <RequestTable
            requests={data?.data || []}
            onStatusUpdate={(request, action) =>
              setStatusUpdateModal({ isOpen: true, request, action })
            }
            onViewDetails={handleViewDetails}
            onPrintSingle={(request) => {
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
                      .supplier-info { background-color: #f0f9ff; padding: 15px; border-radius: 5px; }
                    </style>
                  </head>
                  <body>
                    <div class="header">
                      <h1>Purchase Request - Supplier Copy</h1>
                      <p>Request ID: ${request.id}</p>
                      <p>Generated on ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <div class="supplier-info">
                      <h3>Supplier Information</h3>
                      <p><strong>Your Response Required:</strong> ${request.status === 'pending' ? 'Yes' : 'Completed'}</p>
                    </div>
                    
                    <div class="section">
                      <h3>Request Details</h3>
                      <table>
                        <tr><th>Request ID:</th><td>${request.id}</td></tr>
                        <tr><th>Product:</th><td>${request.product_name || request.SupplierItem?.Product?.name || 'Unknown Product'}</td></tr>
                        <tr><th>Quantity:</th><td>${request.quantity}</td></tr>
                        <tr><th>Urgency:</th><td>${request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}</td></tr>
                        <tr><th>Current Status:</th><td class="status-${request.status}">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</td></tr>
                        <tr><th>Requested Date:</th><td>${new Date(request.created_at || request.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</td></tr>
                      </table>
                    </div>

                    <div class="section">
                      <h3>Customer Information</h3>
                      <table>
                        <tr><th>Requested By:</th><td>${request.User?.name || 'Unknown'}</td></tr>
                        <tr><th>Customer Email:</th><td>${request.User?.email || 'N/A'}</td></tr>
                      </table>
                    </div>

                    <div class="section">
                      <h3>Notes & Quotes</h3>
                      <table>
                        <tr><th>Customer Notes:</th><td>${request.notes_from_requester || 'No notes provided'}</td></tr>
                        <tr><th>Your Quote:</th><td>${request.supplier_quote ? `LKR ${parseFloat(request.supplier_quote).toLocaleString()}` : 'Not provided yet'}</td></tr>
                        <tr><th>Your Notes:</th><td>${request.notes_from_supplier || 'No notes provided'}</td></tr>
                        ${request.rejection_reason ? `<tr><th>Rejection Reason:</th><td>${request.rejection_reason}</td></tr>` : ''}
                      </table>
                    </div>
                  </body>
                </html>
              `);
              printWindow.document.close();
              printWindow.print();
            }}
          />

          {/* Empty State */}
          {(!data?.data || data.data.length === 0) && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Package className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No requests found
              </h3>
              <p className="text-gray-500 mb-4">
                {statusFilter !== 'all' || debouncedSearchTerm
                  ? 'No requests match your current filters.'
                  : "You don't have any purchase requests yet."
                }
              </p>
              {(statusFilter !== 'all' || debouncedSearchTerm) && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Pagination */}
        {data?.data?.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil((data?.count || 0) / limit)}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={statusUpdateModal.isOpen}
        onClose={() => setStatusUpdateModal({ isOpen: false, request: null, action: '' })}
        request={statusUpdateModal.request}
        action={statusUpdateModal.action}
        onConfirm={handleStatusUpdate}
      />

      {/* Hidden printable content for bulk printing */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <div className="p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Supplier Purchase Requests Report</h1>
              <p className="text-gray-600">
                Generated on {new Date().toLocaleDateString()} | Total: {data?.count || 0} requests
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800">Supplier Information</h3>
                <p className="text-blue-700">This report contains all purchase requests assigned to you.</p>
              </div>
            </div>

            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Request ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Product</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Urgency</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Requested By</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Requested Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Your Quote</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((request) => (
                  <tr key={request.id}>
                    <td className="border border-gray-300 px-4 py-2">{request.id}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {request.product_name || request.SupplierItem?.Product?.name || 'Unknown Product'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{request.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{request.status}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {request.User?.name || 'Unknown'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(request.created_at || request.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {request.supplier_quote ? `LKR ${parseFloat(request.supplier_quote).toLocaleString()}` : 'Not quoted'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p>Total Requests: {data?.count || 0}</p>
              <p>Pending: {data?.stats?.pending || 0}</p>
              <p>Approved: {data?.stats?.approved || 0}</p>
              <p>Rejected: {data?.stats?.rejected || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requests;