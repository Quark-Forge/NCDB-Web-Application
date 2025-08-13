import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDeleteProductMutation, useGetProductsWithInactiveQuery } from "../../slices/productsApiSlice";
import { useGetCategoriesQuery } from "../../slices/categoryApiSlice";
import { useGetAllActiveSuppliersQuery } from "../../slices/suppliersApiSlice";
import { Search, RefreshCw, Plus } from 'lucide-react';
import { useState } from 'react';
import AddProduct from "../../components/admin/products/AddProduct";
import ProductsList from "../../components/admin/products/ProductsList";
import EditProduct from "../../components/admin/products/EditProduct";
import { useEffect } from "react";

const Products = () => {
  const { data: productsData, isLoading, error, refetch } = useGetProductsWithInactiveQuery({});
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: suppliersData } = useGetAllActiveSuppliersQuery();
  const [deleteSupplierItem] = useDeleteProductMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSupplierItem, setSelectedSupplierItem] = useState(null);

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];
  const suppliers = suppliersData?.data || [];

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || error.error);
    }
  }, [error]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.Category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product, supplierItem) => {
    setSelectedProduct(product);
    setSelectedSupplierItem(supplierItem);
    setShowEditModal(true);
  };

  const handleDelete = async (product_id, supplier_id) => {
    if (window.confirm('Are you sure you want to delete this product offering?')) {
      try {
        await deleteSupplierItem({
          product_id: product_id,
          supplier_id: supplier_id
        }).unwrap();
        toast.success('Product offering deleted successfully!');
        refetch();
      } catch (err) {
        console.error('Delete error:', err);
        toast.error(
          err?.data?.message ||
          'Error deleting product offering. Check console for details.'
        );
      }
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedProduct(null);
    setSelectedSupplierItem(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-col space-y-4 md:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Product Management</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">Manage all your products</p>
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
                placeholder="Search products..."
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
              New Product
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <ProductsList
            isLoading={isLoading}
            filteredProducts={filteredProducts}
            searchTerm={searchTerm}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        </div>

        {/* Create Product Modal */}
        {showCreateModal && (
          <AddProduct
            setShowCreateModal={setShowCreateModal}
            refetch={refetch}
            categories={categories}
            suppliers={suppliers}
          />
        )}

        {/* Edit Product Modal */}
        {showEditModal && (
          <EditProduct
            showEditModal={showEditModal}
            closeModals={closeModals}
            product={selectedProduct}
            supplierItem={selectedSupplierItem}
            categories={categories}
            suppliers={suppliers}
            refetch={refetch}
          />
        )}
      </div>
    </div>
  );
};

export default Products;