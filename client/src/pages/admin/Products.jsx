import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGetProductsQuery, useDeleteProductMutation } from "../../slices/productsApiSlice";
import { useGetCategoriesQuery } from "../../slices/categoryApiSlice";
import { useGetAllSuppliersQuery } from "../../slices/suppliersApiSlice";
import { Search, Frown, Loader2, RefreshCw, Plus, X } from 'lucide-react';
import { useState } from 'react';
import AddProduct from "../../components/admin/products/AddProduct";
import ProductCard from "../../components/admin/products/ProductCard";

const Products = () => {
  const { data: productsData, isLoading, error, refetch } = useGetProductsQuery({});
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: suppliersData } = useGetAllSuppliersQuery();

  const [deleteProduct] = useDeleteProductMutation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);


  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];
  const suppliers = suppliersData?.data || [];
  
  if (error) {
    toast.error(error?.data?.message || error.error);
  }

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );





  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId).unwrap();
        toast.success('Product deleted successfully!');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Error deleting product');
      }
    }
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
              Create Product
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-8 md:p-12">
              <Loader2 className="h-6 w-6 md:h-8 md:w-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center">
              <Frown className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-700">No products found</h3>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                {searchTerm ? "Try a different search term" : "No products available"}
              </p>
            </div>
          ) : (
            <ProductCard 
              filteredProducts={filteredProducts}
              handleDelete={handleDelete}
            />
          )}
        </div>

        {/* Create Product Modal */}
        {showCreateModal && (
          <AddProduct 
            showCreateModal = {showCreateModal}
            setShowCreateModal = {setShowCreateModal}
            suppliers = {suppliers}
            categories = {categories}
            refetch = { refetch }

          />
        )}
      </div>
    </div>
  )
}

export default Products;