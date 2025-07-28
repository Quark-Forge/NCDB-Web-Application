import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGetProductsQuery, useCreateProductMutation, useDeleteProductMutation } from "../../slices/productsApiSlice";
import { useGetCategoriesQuery } from "../../slices/categoryApiSlice";
import { useGetAllSuppliersQuery } from "../../slices/suppliersApiSlice";
import { Pencil, Trash2, Search, Frown, Loader2, ChevronDown, Filter, RefreshCw, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const Products = () => {
  const { data: productsData, isLoading, error, refetch } = useGetProductsQuery({});
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: suppliersData } = useGetAllSuppliersQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    discount_price: '',
    quantity_per_unit: '',
    quantity: '',
    unit_symbol: '',
    category_id: '',
    supplier_id: '',
    image_url: ''
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await createProduct({
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        quantity_per_unit: parseFloat(formData.quantity_per_unit),
        quantity: parseInt(formData.quantity),
        unit_symbol: formData.unit_symbol,
        category_id: formData.category_id,
        supplier_id: formData.supplier_id,
        image_url: formData.image_url || null
      }).unwrap();
      
      toast.success('Product created successfully!');
      setShowCreateModal(false);
      setFormData({
        name: '',
        sku: '',
        description: '',
        price: '',
        discount_price: '',
        quantity_per_unit: '',
        quantity: '',
        unit_symbol: '',
        category_id: '',
        supplier_id: '',
        image_url: ''
      });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Error creating product');
    }
  };

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
            <>
              {/* Mobile Cards View */}
              <div className="md:hidden space-y-3 p-3">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                          <p className="text-xs text-gray-500">${product.price}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                        {product.category?.name || 'No Category'}
                      </span>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">ID: {product.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${product.price}</div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-xs text-gray-500 line-through">${product.originalPrice}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                            {product.category?.name || 'No Category'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.inStock ? `${product.stockCount || 0} in stock` : 'Out of stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors">
                              <Pencil size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Create Product Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg md:rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Create New Product</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU *
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter product SKU"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier *
                      </label>
                      <select
                        name="supplier_id"
                        value={formData.supplier_id}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="">Select a supplier</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        step="0.01"
                        min="0"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Price
                      </label>
                      <input
                        type="number"
                        name="discount_price"
                        value={formData.discount_price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity per Unit *
                      </label>
                      <input
                        type="number"
                        name="quantity_per_unit"
                        value={formData.quantity_per_unit}
                        onChange={handleInputChange}
                        required
                        step="0.01"
                        min="0"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="1.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Symbol *
                      </label>
                      <input
                        type="text"
                        name="unit_symbol"
                        value={formData.unit_symbol}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="kg, ltr, pcs, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {isCreating ? 'Creating...' : 'Create Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products;