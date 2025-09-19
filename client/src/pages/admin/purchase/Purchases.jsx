import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  Search,
  AlertCircle,
  Loader2,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Download
} from 'lucide-react';
import {
  useCancelSupplierItemRequestMutation,
  useDeleteSupplierItemRequestMutation,
  useGetSupplierItemRequestsQuery,
  useCreateSupplierItemRequestMutation
} from '../../../slices/PurchaseApiSlice';
import { useGetSupplierItemsQuery } from '../../../slices/supplierItemsApiSlice';
import Badges from '../../../components/common/Badges';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import DeleteConfirmation from '../../../components/common/DeleteConfirmation';
import Dropdown from '../../../components/common/Dropdown';
import ErrorMessage from '../../../components/common/ErrorMessage';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Pagination from '../../../components/common/Pagination';
import Table from '../../../components/common/Table';

const ProductRequestForm = ({ onClose, onSuccess }) => {
  const [createRequest, { isLoading: isCreating, error: createError }] = useCreateSupplierItemRequestMutation();

  const [formData, setFormData] = useState({
    supplier_item_id: '',
    quantity: 1,
    urgency: 'medium',
    notes_from_requester: ''
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch supplier items with search functionality
  const {
    data: supplierItemsData,
    isLoading: isLoadingItems,
    error: itemsError,
    refetch: refetchItems
  } = useGetSupplierItemsQuery();

  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    if (supplierItemsData?.data?.supplierItems) {
      if (searchTerm.length > 2) {
        const results = supplierItemsData.data.supplierItems.filter(item =>
          item.Product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.Supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.supplier_sku?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredItems(results);
      } else {
        setFilteredItems([]);
      }
    }
  }, [searchTerm, supplierItemsData]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setShowSearchResults(term.length > 2);
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setFormData(prev => ({
      ...prev,
      supplier_item_id: item.id
    }));
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = formData.quantity + change;
    if (newQuantity >= 1) {
      setFormData(prev => ({
        ...prev,
        quantity: newQuantity
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem) {
      alert('Please select an item');
      return;
    }

    try {
      await createRequest({
        ...formData,
        supplier_id: selectedItem.supplier_id
      }).unwrap();

      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error('Failed to create request:', err);
    }
  };

  const formatPrice = (price) => {
    return `LKR ${parseFloat(price).toFixed(2)}`;
  };

  const getStockStatus = (stockLevel) => {
    if (stockLevel <= 10) return { variant: 'danger', text: 'Low Stock' };
    if (stockLevel <= 25) return { variant: 'warning', text: 'Moderate Stock' };
    return { variant: 'success', text: 'Good Stock' };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in fade-in-90 zoom-in-90">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Request New Item</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isCreating}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {createError && (
            <ErrorMessage
              message={createError.data?.message || 'Failed to create request'}
              className="mb-4"
            />
          )}

          {/* Item Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Item *
            </label>

            {selectedItem ? (
              <Card className="p-4 border-green-200 bg-green-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900">{selectedItem.Product?.name}</h4>
                    <p className="text-sm text-green-700">{selectedItem.Supplier?.name}</p>
                    <p className="text-sm text-green-600 mt-1">{selectedItem.description}</p>
                    <div className="flex items-center mt-2 space-x-4 text-xs">
                      <span className="text-gray-600">SKU: {selectedItem.supplier_sku}</span>
                      <span className="text-gray-600">Price: {formatPrice(selectedItem.price)}</span>
                      <Badges
                        variant={getStockStatus(selectedItem.stock_level).variant}
                        size="sm"
                      >
                        Stock: {selectedItem.stock_level}
                      </Badges>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItem(null);
                      setFormData(prev => ({ ...prev, supplier_item_id: '' }));
                    }}
                    className="text-green-600 hover:text-green-800 ml-2"
                    disabled={isCreating}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search for items by name, supplier, or description..."
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchTerm.length > 2 && setShowSearchResults(true)}
                    disabled={isLoadingItems}
                  />
                  {isLoadingItems && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  )}
                </div>

                {itemsError && (
                  <div className="mt-2 text-sm text-red-600">
                    Failed to load items. <button onClick={refetchItems} className="text-blue-600 hover:underline">Retry</button>
                  </div>
                )}

                {showSearchResults && (
                  <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-auto shadow-lg">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSelectItem(item)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{item.Product?.name}</div>
                              <div className="text-sm text-gray-600">{item.Supplier?.name}</div>
                              <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {formatPrice(item.price)}
                              </div>
                              <Badges
                                variant={getStockStatus(item.stock_level).variant}
                                size="sm"
                                className="mt-1"
                              >
                                {item.stock_level} in stock
                              </Badges>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            SKU: {item.supplier_sku} • Lead time: {item.lead_time_days} days
                          </div>
                        </button>
                      ))
                    ) : searchTerm.length > 2 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Search className="h-6 w-6 mx-auto mb-2" />
                        <p>No items found matching "{searchTerm}"</p>
                      </div>
                    ) : null}
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <div className="flex items-center max-w-xs">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formData.quantity <= 1 || isCreating}
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                className="w-20 px-4 py-2 border-y border-gray-300 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                disabled={isCreating}
              />
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isCreating}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {selectedItem && (
              <p className="text-sm text-gray-500 mt-2">
                Available stock: {selectedItem.stock_level} units
                {formData.quantity > selectedItem.stock_level && (
                  <span className="text-orange-600 ml-2">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    Requesting more than available stock
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['low', 'medium', 'high'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, urgency: level }))}
                  className={`p-3 border rounded-lg text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${formData.urgency === level
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  disabled={isCreating}
                >
                  <div className="font-medium capitalize">{level}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {level === 'low' && 'Within 2 weeks'}
                    {level === 'medium' && 'Within 1 week'}
                    {level === 'high' && 'Within 48 hours'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes_from_requester"
              value={formData.notes_from_requester}
              onChange={handleInputChange}
              rows={4}
              placeholder="Add any special instructions, delivery requirements, or specific quality expectations..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:opacity-50"
              disabled={isCreating}
            />
          </div>

          {/* Form Summary */}
          {selectedItem && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Request Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Item:</span>
                  <span className="font-medium ml-2">{selectedItem.Product?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Supplier:</span>
                  <span className="font-medium ml-2">{selectedItem.Supplier?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium ml-2">{formData.quantity}</span>
                </div>
                <div>
                  <span className="text-gray-600">Urgency:</span>
                  <span className="font-medium ml-2 capitalize">{formData.urgency}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isCreating || !selectedItem}
            >
              {isCreating ? (
                <>
                  <LoadingSpinner size="sm" color="light" className="mr-2" />
                  Creating Request...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
      cancelled: { variant: 'neutral', icon: <AlertCircle className="h-3 w-3 mr-1" /> }
    };

    const { variant, icon } = variants[status] || { variant: 'neutral', icon: null };

    return (
      <Badges variant={variant} size="sm">
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badges>
    );
  };

  const handleCancel = async () => {
    try {
      await cancelRequest(cancelModal.request.id).unwrap();
      setCancelModal({ isOpen: false, request: null });
    } catch (error) {
      console.error('Failed to cancel request:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRequest(deleteModal.request.id).unwrap();
      setDeleteModal({ isOpen: false, request: null });
    } catch (error) {
      console.error('Failed to delete request:', error);
    }
  };

  const handleRequestSuccess = () => {
    setShowRequestForm(false);
    refetch(); // Refresh the requests list
  };

  const actionMenuOptions = (request) => [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: () => console.log('View:', request.id)
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4 mr-2" />,
      onClick: () => console.log('Edit:', request.id),
      disabled: request.status !== 'pending'
    },
    {
      label: 'Cancel',
      icon: <XCircle className="h-4 w-4 mr-2" />,
      onClick: () => setCancelModal({ isOpen: true, request }),
      disabled: request.status !== 'pending'
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4 mr-2 text-red-600" />,
      onClick: () => setDeleteModal({ isOpen: true, request }),
      className: 'text-red-600 hover:text-red-700'
    }
  ];

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
          <p className="text-gray-600 mt-2">Manage and track your supplier item requests</p>
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="secondary" size="md">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowRequestForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
          </div>
        </Card>

        {/* Requests Table */}
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
                      {request.SupplierItem?.name || 'Unknown Item'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.notes_from_requester?.substring(0, 50)}
                      {request.notes_from_requester?.length > 50 && '...'}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {request.SupplierItem?.Supplier?.company_name || 'Unknown Supplier'}
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
                  {new Date(request.created_at).toLocaleDateString()}
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
                <Filter className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-500">
                {statusFilter !== 'all'
                  ? `No ${statusFilter} requests match your search.`
                  : 'Get started by creating your first purchase request.'
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

      {/* Cancel Confirmation Modal */}
      <DeleteConfirmation
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, request: null })}
        onConfirm={handleCancel}
        title="Cancel Request"
        description="Are you sure you want to cancel this request?"
        itemName={cancelModal.request?.SupplierItem?.name}
        confirmText="Cancel Request"
        cancelText="Keep Request"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, request: null })}
        onConfirm={handleDelete}
        title="Delete Request"
        description="Are you sure you want to delete this request? This action cannot be undone."
        itemName={deleteModal.request?.SupplierItem?.name}
        confirmText="Delete Request"
        cancelText="Keep Request"
      />

      {/* Product Request Form Modal */}
      {showRequestForm && (
        <ProductRequestForm
          onClose={() => setShowRequestForm(false)}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};

export default Purchases;