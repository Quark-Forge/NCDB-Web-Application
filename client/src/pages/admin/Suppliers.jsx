import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useGetAllSuppliersQuery,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation
} from "../../slices/suppliersApiSlice";
import { Search, RefreshCw, Plus, X } from 'lucide-react';
import { useState } from 'react';
import SuppliersList from "../../components/admin/suppliers/SuppliersList";
import AddSupplier from "../../components/admin/suppliers/AddSupplier";
import EditSupplier from "../../components/admin/suppliers/EditSupplier";

const Suppliers = () => {
  const { data: suppliersData, isLoading, error, refetch } = useGetAllSuppliersQuery();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    email: '',
    address: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      contact_number: '',
      email: '',
      address: ''
    });
    setEditingSupplier(null);
  };


  const suppliers = suppliersData?.data || [];

  if (error) {
    toast.error(error?.data?.message || error.error);
  }

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_number?.includes(searchTerm)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_number: supplier.contact_number || '',
      email: supplier.email || '',
      address: supplier.address || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateSupplier({
        id: editingSupplier.id,
        ...formData
      }).unwrap();
      toast.success('Supplier updated successfully!');
      setShowEditModal(false);
      resetForm();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Error updating supplier');
    }
  };

  const handleDelete = async (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(supplierId).unwrap();
        toast.success('Supplier deleted successfully!');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Error deleting supplier');
      }
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    resetForm();
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-col space-y-4 md:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Supplier Management</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">Manage product suppliers</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refetch}
              className="flex items-center px-3 py-1.5 md:px-4 md:py-2 bg-white border border-gray-200 rounded-lg text-xs md:text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-3 md:p-4 rounded-lg md:rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search suppliers..."
                className="block w-full pl-10 pr-3 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm md:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Supplier
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <SuppliersList
            isLoading={isLoading}
            filteredSuppliers={filteredSuppliers}
            searchTerm={searchTerm}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        </div>

        {/* Create Supplier Modal */}
        {showCreateModal && (
          <AddSupplier
            closeModals={closeModals}
            setShowCreateModal={setShowCreateModal}
            handleInputChange={handleInputChange}
            formData={formData}
            refetch={refetch}
          />
        )}

        {/* Edit Supplier Modal */}
        <EditSupplier
          showEditModal={showEditModal}
          closeModals={closeModals}
          formData={formData}
          handleInputChange={handleInputChange}
          handleUpdate={handleUpdate}
          isUpdating={isUpdating}
        />
      </div>
    </div>
  );
};

export default Suppliers;
