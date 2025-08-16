// pages/admin/Categories.jsx
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useGetAllCategoriesQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} from "../../slices/categoryApiSlice";
import { Search, RefreshCw, Plus } from 'lucide-react';
import { useState } from 'react';
import CategoriesList from "../../components/admin/categories/CategoriesList";
import AddCategory from "../../components/admin/categories/AddCategory";
import EditCategory from "../../components/admin/categories/EditCategory";
import DeleteConfirmation from "../../components/common/DeleteConfirmation";
import { useSelector } from "react-redux";

const allowedRoles = ['Admin', 'Inventory Manager'];

const Categories = () => {
  const { data: categoriesData, isLoading, error, refetch } = useGetAllCategoriesQuery();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
    setEditingCategory(null);
  };

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
    setCategoryToDelete(categoryId);
    setShowDeleteModal(true);
  };

  const onConfirmDelete = async () => {
    try {
      await deleteCategory(categoryToDelete).unwrap();
      toast.success('Category deleted successfully!');
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Error deleting category');
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
            {
              allowedRoles.includes(userInfo.user_role) &&
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Category
              </button>
            }
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <CategoriesList
            isLoading={isLoading}
            filteredCategories={filteredCategories}
            searchTerm={searchTerm}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        </div>

        {/* Create Category Modal */}
        {
          allowedRoles.includes(userInfo.user_role) &&
          (showCreateModal && (
            <AddCategory
              closeModals={closeModals}
              setShowCreateModal={setShowCreateModal}
              handleInputChange={handleInputChange}
              formData={formData}
              refetch={refetch}
            />
          ))
        }


        {/* Edit Category Modal */}
        {
          allowedRoles.includes(userInfo.user_role) &&
          <EditCategory
            showEditModal={showEditModal}
            closeModals={closeModals}
            handleInputChange={handleInputChange}
            handleUpdate={handleUpdate}
            formData={formData}
            isUpdating={isUpdating}
          />
        }

        {showDeleteModal && (
          <DeleteConfirmation
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={onConfirmDelete}
            title="Delete Category"
            description="Are you sure you want to delete this category? This action cannot be undone."
            confirmText="Delete Category"
          />
        )}

      </div>
    </div>
  );
};

export default Categories;