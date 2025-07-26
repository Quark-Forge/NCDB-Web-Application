import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { 
  useGetAllCategoriesQuery, 
  useCreateCategoryMutation, 
  useUpdateCategoryMutation, 
  useDeleteCategoryMutation 
} from "../../slices/categoryApiSlice";
import { Pencil, Trash2, Search, Frown, Loader2, RefreshCw, Plus, X } from 'lucide-react';
import { useState } from 'react';

const Categories = () => {
  const { data: categoriesData, isLoading, error, refetch } = useGetAllCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

  const categories = categoriesData?.data || [];
  
  if (error) {
    toast.error(error?.data?.message || error.error);
  }

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
    setEditingCategory(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCategory(formData).unwrap();
      toast.success('Category created successfully!');
      setShowCreateModal(false);
      resetForm();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Error creating category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateCategory({ 
        id: editingCategory.id, 
        ...formData 
      }).unwrap();
      toast.success('Category updated successfully!');
      setShowEditModal(false);
      resetForm();
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Error updating category');
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(categoryId).unwrap();
        toast.success('Category deleted successfully!');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Error deleting category');
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
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Category Management</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">Manage product categories</p>
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
                placeholder="Search categories..."
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
              Create Category
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-8 md:p-12">
              <Loader2 className="h-6 w-6 md:h-8 md:w-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center">
              <Frown className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-700">No categories found</h3>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                {searchTerm ? "Try a different search term" : "No categories available"}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className="md:hidden space-y-3 p-3">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                          {category.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                          <p className="text-xs text-gray-500">{category.description || 'No description'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-end">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(category)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id)}
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
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                              {category.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{category.name}</div>
                              <div className="text-sm text-gray-500">ID: {category.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {category.description || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button 
                              onClick={() => handleEdit(category)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                            >
                              <Pencil size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(category.id)}
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

        {/* Create Category Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg md:rounded-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Create New Category</h2>
                  <button
                    onClick={closeModals}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Enter category name"
                    />
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
                      placeholder="Enter category description"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active Category
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={closeModals}
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
                      {isCreating ? 'Creating...' : 'Create Category'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg md:rounded-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Edit Category</h2>
                  <button
                    onClick={closeModals}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Enter category name"
                    />
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
                      placeholder="Enter category description"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active Category
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {isUpdating ? 'Updating...' : 'Update Category'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
