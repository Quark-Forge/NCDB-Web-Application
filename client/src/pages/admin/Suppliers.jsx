import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useGetAllSuppliersQuery,
  useDeleteSupplierMutation,
} from "../../slices/suppliersApiSlice";
import { Search, RefreshCw, Plus, Users } from 'lucide-react';
import { useState, useMemo } from 'react';
import SuppliersList from "../../components/admin/suppliers/SuppliersList";
import AddSupplier from "../../components/admin/suppliers/AddSupplier";
import DeleteConfirmation from "../../components/common/DeleteConfirmation";
import Pagination from "../../components/common/Pagination";
import { useSelector } from 'react-redux';

const Suppliers = () => {
  const { data: suppliersData, isLoading, error, refetch } = useGetAllSuppliersQuery();
  const [deleteSupplier] = useDeleteSupplierMutation();

  // Get user info from Redux store or your state management
  const { userInfo } = useSelector((state) => state.auth);
  
  // Check if current user is admin
  const isAdmin = userInfo?.user_role === 'Admin';
  

  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    email: '',
    address: '',
    password: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const resetForm = () => {
    setFormData({
      name: '',
      contact_number: '',
      email: '',
      address: '',
      password: ''
    });
  };

  const suppliers = suppliersData?.data || [];

  if (error) {
    toast.error(error?.data?.message || error.error);
  }

  const filteredSuppliers = useMemo(() =>
    suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_number?.includes(searchTerm)
    ), [suppliers, searchTerm]
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async (supplierId) => {
    setSupplierToDelete(supplierId);
    setShowDeleteModal(true);
  };

  const onConfirmDelete = async () => {
    try {
      await deleteSupplier(supplierToDelete).unwrap();
      toast.success('Supplier deleted successfully!');
      setShowDeleteModal(false);
      setSupplierToDelete(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Error deleting supplier');
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Stats calculation
  const totalSuppliers = suppliers.length;
  const suppliersWithAccounts = suppliers.filter(s => s.user).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-col space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Supplier Management</h1>
            <p className="text-gray-600 mt-1">Add and manage supplier accounts</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refetch}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search suppliers by name, email, or contact number..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            
            {/* Only show Add Supplier button for admin */}
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </button>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Supplier Management</h3>
              <div className="mt-1 text-sm text-blue-700">
                <p>• Suppliers can manage their own profile information through their user accounts</p>
                <p>• Admin can use "Add Supplier" button to create new supplier accounts</p>
                <p>• Suppliers will receive login credentials to access their accounts</p>
                {/* Show admin-specific message */}
                {isAdmin && (
                  <p className="font-medium">• You have admin privileges to add and manage suppliers</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <SuppliersList
            isLoading={isLoading}
            filteredSuppliers={paginatedSuppliers}
            searchTerm={searchTerm}
            handleDelete={handleDelete}
            isAdmin={isAdmin} // Pass isAdmin prop to control delete actions too
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-4"
          />
        )}

        {/* Modals - Only show create modal for admin */}
        {isAdmin && showCreateModal && (
          <AddSupplier
            closeModals={closeModals}
            setShowCreateModal={setShowCreateModal}
            handleInputChange={handleInputChange}
            formData={formData}
            refetch={refetch}
            resetForm={resetForm}
          />
        )}

        {showDeleteModal && isAdmin && (
          <DeleteConfirmation
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={onConfirmDelete}
            title="Deactivate Supplier"
            description="Are you sure you want to deactivate this supplier."
            confirmText="Deactivate Supplier"
          />
        )}
      </div>
    </div>
  );
};

export default Suppliers;