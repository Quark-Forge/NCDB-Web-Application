import { useState } from 'react';
import {
  useCancelSupplierItemRequestMutation,
  useDeleteSupplierItemRequestMutation,
  useGetSupplierItemRequestsQuery,
  useUpdateSupplierItemRequestMutation,
} from '../../../slices/PurchaseApiSlice';
import PurchaseHeader from '../../../components/admin/purchase/PurchaseHeader';
import PurchaseFilters from '../../../components/admin/purchase/PurchaseFilters';
import PurchaseTable from '../../../components/admin/purchase/PurchaseTable';
import PurchaseModals from '../../../components/admin/purchase/PurchaseModals';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import ProductRequestForm from '../../../components/admin/purchase/ProductRequestForm';
import RequestDetailsModal from '../../../components/admin/purchase/RequestDetailsModal';
import EditRequestModal from '../../../components/admin/purchase/EditRequestModal';

const Purchases = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, request: null });
  const [cancelModal, setCancelModal] = useState({ isOpen: false, request: null });
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, request: null });
  const [editModal, setEditModal] = useState({ isOpen: false, request: null });

  const { data, error, isLoading, refetch } = useGetSupplierItemRequestsQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    limit,
    search: searchTerm || undefined
  });

  const [cancelRequest] = useCancelSupplierItemRequestMutation();
  const [deleteRequest] = useDeleteSupplierItemRequestMutation();
  const [updateRequest] = useUpdateSupplierItemRequestMutation();

  const handleCancel = async () => {
    try {
      await cancelRequest(cancelModal.request.id).unwrap();
      setCancelModal({ isOpen: false, request: null });
      refetch();
    } catch (error) {
      console.error('Failed to cancel request:', error);
      alert('Failed to cancel request. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRequest(deleteModal.request.id).unwrap();
      setDeleteModal({ isOpen: false, request: null });
      refetch();
    } catch (error) {
      console.error('Failed to delete request:', error);
      alert('Failed to delete request. Please try again.');
    }
  };

  const handleEditRequest = async (formData) => {
    try {
      await updateRequest({
        id: editModal.request.id,
        ...formData
      }).unwrap();
      setEditModal({ isOpen: false, request: null });
      refetch();
    } catch (error) {
      console.error('Failed to update request:', error);
      throw error; // Re-throw to handle in the modal
    }
  };

  const handleRequestSuccess = () => {
    setShowRequestForm(false);
    refetch();
  };

  const handleViewDetails = (request) => {
    setDetailsModal({ isOpen: true, request });
  };

  const handleEditClick = (request) => {
    setEditModal({ isOpen: true, request });
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
          onEditRequest={handleEditClick}
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

        {/* Request Details Modal */}
        <RequestDetailsModal
          isOpen={detailsModal.isOpen}
          request={detailsModal.request}
          onClose={() => setDetailsModal({ isOpen: false, request: null })}
        />

        {/* Edit Request Modal */}
        <EditRequestModal
          isOpen={editModal.isOpen}
          request={editModal.request}
          onClose={() => setEditModal({ isOpen: false, request: null })}
          onSave={handleEditRequest}
        />

        {/* New Request Form */}
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