import { useState } from 'react';
import {
  useCancelSupplierItemRequestMutation,
  useDeleteSupplierItemRequestMutation,
  useGetSupplierItemRequestsQuery,
} from '../../../slices/PurchaseApiSlice';
import PurchaseHeader from '../../../components/admin/purchase/PurchaseHeader';
import PurchaseFilters from '../../../components/admin/purchase/PurchaseFilters';
import PurchaseTable from '../../../components/admin/purchase/PurchaseTable';
import PurchaseModals from '../../../components/admin/purchase/PurchaseModals';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import ProductRequestForm from '../../../components/admin/purchase/ProductRequestForm';

const Purchases = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, request: null });
  const [cancelModal, setCancelModal] = useState({ isOpen: false, request: null });
  const [showRequestForm, setShowRequestForm] = useState(false);

  const { data, error, isLoading, refetch } = useGetSupplierItemRequestsQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    limit
  });

  const [cancelRequest] = useCancelSupplierItemRequestMutation();
  const [deleteRequest] = useDeleteSupplierItemRequestMutation();

  const handleCancel = async () => {
    try {
      await cancelRequest(cancelModal.request.id).unwrap();
      setCancelModal({ isOpen: false, request: null });
      refetch();
    } catch (error) {
      console.error('Failed to cancel request:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRequest(deleteModal.request.id).unwrap();
      setDeleteModal({ isOpen: false, request: null });
      refetch();
    } catch (error) {
      console.error('Failed to delete request:', error);
    }
  };

  const handleRequestSuccess = () => {
    setShowRequestForm(false);
    refetch();
  };

  const handleViewDetails = (request) => {
    console.log('View details:', request);
    // Implement view details modal or navigation
  };

  const handleEditRequest = (request) => {
    console.log('Edit request:', request);
    // Implement edit functionality
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
        <PurchaseHeader />

        <PurchaseFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onNewRequest={() => setShowRequestForm(true)}
        />

        <PurchaseTable
          data={data}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onCancelRequest={setCancelModal}
          onDeleteRequest={setDeleteModal}
          onEditRequest={handleEditRequest}
          onViewDetails={handleViewDetails}
        />

        <PurchaseModals
          cancelModal={cancelModal}
          deleteModal={deleteModal}
          onCloseCancel={() => setCancelModal({ isOpen: false, request: null })}
          onCloseDelete={() => setDeleteModal({ isOpen: false, request: null })}
          onConfirmCancel={handleCancel}
          onConfirmDelete={handleDelete}
        />

        {showRequestForm && (
          <ProductRequestForm
            onClose={() => setShowRequestForm(false)}
            onSuccess={handleRequestSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default Purchases;