import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Package,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  useGetMySupplierItemRequestsQuery,
  useUpdateSupplierItemRequestStatusMutation
} from '../../slices/PurchaseApiSlice';
import Badges from '../../components/common/Badges';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Dropdown from '../../components/common/Dropdown';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import Table from '../../components/common/Table';
import StatusUpdateModal from '../../components/supplier/requests/StatusUpdateModal';
import RequestFilters from '../../components/supplier/requests/RequestFilters';
import RequestStats from '../../components/supplier/requests/RequestStats';
import RequestTable from '../../components/supplier/requests/RequestTable';

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
    // Implement export functionality
    console.log('Exporting requests...');
  };

  const handleRefresh = () => {
    refetch();
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
              <Button
                variant="secondary"
                onClick={handleExport}
                disabled={!data?.data?.length}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
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
        <RequestTable
          requests={data?.data || []}
          onStatusUpdate={(request, action) =>
            setStatusUpdateModal({ isOpen: true, request, action })
          }
        />

        {/* Empty State */}
        {(!data?.data || data.data.length === 0) && (
          <Card className="text-center py-12">
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
          </Card>
        )}

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
    </div>
  );
};

export default Requests;