import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Users,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import Badges from '../../components/common/Badges';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Dropdown from '../../components/common/Dropdown';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Table from '../../components/common/Table';
import { useGetMySupplierItemRequestsQuery, useGetRequestStatisticsQuery } from '../../slices/PurchaseApiSlice';

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalRevenue: 0
  });

  // Fetch statistics
  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
    refetch: refetchStats
  } = useGetRequestStatisticsQuery();

  // Fetch supplier's requests
  const {
    data: requestsData,
    error: requestsError,
    isLoading: requestsLoading,
    refetch: refetchRequests
  } = useGetMySupplierItemRequestsQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 5
  });

  // Update stats when data is fetched
  useEffect(() => {
    if (statsData?.data) {
      const backendStats = statsData.data;
      setStats({
        total: backendStats.total || 0,
        pending: backendStats.pending || 0,
        approved: backendStats.approved || 0,
        rejected: backendStats.rejected || 0,
        totalRevenue: backendStats.totalRevenue || 0
      });
    }
  }, [statsData]);

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'warning', icon: <Clock className="h-3 w-3 mr-1" /> },
      approved: { variant: 'success', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      rejected: { variant: 'danger', icon: <XCircle className="h-3 w-3 mr-1" /> },
      cancelled: { variant: 'neutral', icon: <Clock className="h-3 w-3 mr-1" /> }
    };

    const { variant, icon } = variants[status] || { variant: 'neutral', icon: null };

    return (
      <Badges variant={variant} size="sm">
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badges>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const variants = {
      high: 'danger',
      medium: 'warning',
      low: 'neutral'
    };

    return (
      <Badges variant={variants[urgency]} size="sm">
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      </Badges>
    );
  };

  const statusOptions = [
    { value: 'all', label: 'All Requests' },
    { value: 'pending', label: 'Pending Requests' },
    { value: 'approved', label: 'Approved Requests' },
    { value: 'rejected', label: 'Rejected Requests' }
  ];

  const handleRefetch = () => {
    refetchStats();
    refetchRequests();
  };

  // Filter requests based on search term
  const filteredRequests = requestsData?.data?.filter(request =>
    request.SupplierItem?.Product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.SupplierItem?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.notes_from_requester?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (statsLoading || requestsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (statsError || requestsError) {
    return (
      <ErrorMessage
        message="Failed to load dashboard data"
        onRetry={handleRefetch}
        buttonText="Retry"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Requests */}
          <Card className="p-6 bg-white hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">All time requests</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Pending Requests */}
          <Card className="p-6 bg-white hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting response</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          {/* Approved Requests */}
          <Card className="p-6 bg-white hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">Active orders</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Total Revenue */}
          <Card className="p-6 bg-white hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  LKR {stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">From approved requests</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Dropdown
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              buttonClassName="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2"
              renderSelected={(option) => (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {option?.label || 'Filter by Status'}
                </div>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Requests - 2/3 width */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Purchase Requests</h2>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/suppliers/requests')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </div>

              <div className="overflow-hidden">
                <Table
                  headers={['Item', 'Quantity', 'Urgency', 'Status', 'Requested', '']}
                  className="rounded-lg"
                >
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.SupplierItem?.Product?.name || request.SupplierItem?.name || 'Unknown Item'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.notes_from_requester?.substring(0, 30)}
                            {request.notes_from_requester?.length > 30 && '...'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.quantity}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getUrgencyBadge(request.urgency)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/suppliers/requests/${request.id}`)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="View Request Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </Table>

                {filteredRequests.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Package className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                    <p className="text-gray-500">
                      {statusFilter !== 'all' && searchTerm
                        ? `No ${statusFilter} requests matching "${searchTerm}"`
                        : statusFilter !== 'all'
                          ? `No ${statusFilter} requests at the moment.`
                          : searchTerm
                            ? `No requests matching "${searchTerm}"`
                            : "You don't have any purchase requests yet."
                      }
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions & Inventory - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-4">
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => navigate('/suppliers/requests')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Manage Requests
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={() => navigate('/suppliers/profile')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={handleRefetch}
                >
                  Refresh Data
                </Button>
              </div>
            </Card>

            {/* Status Summary */}
            <Card>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Status Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <Badges variant="warning">{stats.pending}</Badges>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Approved</span>
                  <Badges variant="success">{stats.approved}</Badges>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rejected</span>
                  <Badges variant="danger">{stats.rejected}</Badges>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">Total</span>
                    <span className="text-sm font-bold text-gray-900">{stats.total}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;