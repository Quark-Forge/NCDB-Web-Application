import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDeleteUserMutation, useGetAllUsersQuery } from "../../slices/usersApiSlice";
import { Search, Frown, Loader2, RefreshCw, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import UserCard from "../../components/admin/users/UserCard";
import DeleteConfirmation from "../../components/common/DeleteConfirmation";
import Pagination from "../../components/common/Pagination";

const Users = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(2); // Number of users per page
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const { data: usersData, isLoading, error, refetch } = useGetAllUsersQuery({ ...pagination });
  const [deleteUser] = useDeleteUserMutation();



  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userId, setUserId] = useState();

  const users = usersData?.data || [];
  const totalPages = usersData?.totalPages || 1;
  const totalUsers = usersData?.totalCount || 0;

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || error.error);
    }
  }, [error]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.role_name && user.role_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const deleteHandle = ({ userID }) => {
    setUserId(userID);
    setShowDeleteModal(true);
  }

  const onConfirm = async () => {
    try {
      await deleteUser(userId).unwrap();
      toast.success('User deactivated successfully!');
      setShowDeleteModal(false);
      setUserId(null);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Error deactivating user');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-col space-y-4 md:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              Showing {(page - 1) * limit + 1}-{Math.min(page * limit, totalUsers)} of {totalUsers} users
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                refetch();
                setPagination(1, 10);
              }}
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
                placeholder="Search users..."
                className="block w-full pl-10 pr-3 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm md:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-8 md:p-12">
              <Loader2 className="h-6 w-6 md:h-8 md:w-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center">
              <Frown className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-700">No users found</h3>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                {searchTerm ? "Try a different search term" : "No users available"}
              </p>
            </div>
          ) : (
            <>
              <UserCard
                filteredUsers={filteredUsers}
                refetch={refetch}
                deleteHandle={deleteHandle}
              />

              {/* Pagination Controls */}
              <Pagination
                currentPage={pagination.page}
                totalPages={totalPages}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
              />
            </>
          )}
        </div>

        {/* Edit User Modal */}
        {showDeleteModal && (
          <DeleteConfirmation
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={onConfirm}
          />
        )}
      </div>
    </div>
  )
}

export default Users;