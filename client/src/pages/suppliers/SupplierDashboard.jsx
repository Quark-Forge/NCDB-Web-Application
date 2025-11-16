import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  Bell,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign
} from 'lucide-react';
import Badges from '../../components/common/Badges';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Dropdown from '../../components/common/Dropdown';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Table from '../../components/common/Table';
import { useGetMySupplierItemRequestsQuery } from '../../slices/PurchaseApiSlice';

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  });

  // Fetch supplier's requests
  const {
    data: requestsData,
    error: requestsError,
    isLoading: requestsLoading,
    refetch: refetchRequests
  } = useGetMySupplierItemRequestsQuery({
    status: statusFilter,
    limit: 5
  });

  // Fetch supplier items for inventory overview
  const {
    data: itemsData,
    error: itemsError,
    isLoading: itemsLoading
  } = useGetMySupplierItemRequestsQuery();

  useEffect(() => {
    if (requestsData?.data && itemsData?.data) {
      const requests = requestsData.data;
      const items = itemsData.data.supplierItems || [];

      // Calculate stats
      const totalRequests = requestsData.count || 0;
      const pending = requests.filter(req => req.status === 'pending').length;
      const approved = requests.filter(req => req.status === 'approved').length;
      const rejected = requests.filter(req => req.status === 'rejected').length;

      // Calculate revenue from approved requests
      const totalRevenue = requests
        .filter(req => req.status === 'approved' && req.supplier_quote)
        .reduce((sum, req) => sum + parseFloat(req.supplier_quote || 0), 0);

      setStats({
        totalRequests,
        pending,
        approved,
        rejected,
        totalRevenue,
        monthlyGrowth: 12.5 // Mock growth percentage
      });
    }
  }, [requestsData, itemsData]);

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

  const actionMenuOptions = (request) => [
    {
      label: 'View Details',
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: () => navigate(`/supplier/purchases`)
    },
    {
      label: 'Update Status',
      icon: <CheckCircle className="h-4 w-4 mr-2" />,
      onClick: () => navigate(`/supplier/purchases`),
      disabled: request.status !== 'pending'
    }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending Requests' },
    { value: 'approved', label: 'Approved Requests' },
    { value: 'rejected', label: 'Rejected Requests' },
    { value: 'all', label: 'All Requests' }
  ];

  if (requestsLoading || itemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (requestsError || itemsError) {
    return (
      <ErrorMessage
        message="Failed to load dashboard data"
        onRetry={() => {
          refetchRequests();
          // You might want to add refetch for items too
        }}
        buttonText="Retry"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supplier Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's your business overview</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <Dropdown
                options={[
                  { label: 'Profile', onClick: () => navigate('/supplier/profile') },
                  { label: 'Settings', onClick: () => navigate('/supplier/settings') },
                  { label: 'Logout', onClick: () => navigate('/logout') }
                ]}
                value={null}
                onChange={() => { }}
                buttonClassName="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                renderSelected={() => (
                  <>
                    <img
                      className="h-8 w-8 rounded-full"
                      src="../../images/user.png"
                      alt="Profile"
                    />
                    <Settings className="h-4 w-4 text-gray-400" />
                  </>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Requests */}
          <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{stats.monthlyGrowth}% this month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Pending Requests */}
          <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-500 mt-1">Awaiting response</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          {/* Approved Requests */}
          <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Active orders</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Total Revenue */}
          <Card className="p-6 bg-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  LKR {stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">From approved requests</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Requests - 2/3 width */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Purchase Requests</h2>
                  <div className="flex items-center space-x-4">
                    <Dropdown
                      options={statusOptions}
                      value={statusFilter}
                      onChange={setStatusFilter}
                      buttonClassName="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      renderSelected={(option) => (
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          {option.label}
                        </div>
                      )}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/supplier/purchases')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden">
                <Table
                  headers={['Item', 'Quantity', 'Urgency', 'Status', 'Requested', 'Actions']}
                  className="rounded-lg"
                >
                  {requestsData?.data?.map((request) => (
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

                {(!requestsData?.data || requestsData.data.length === 0) && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Package className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                    <p className="text-gray-500">
                      {statusFilter !== 'all'
                        ? `No ${statusFilter} requests at the moment.`
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
                  onClick={() => navigate('/supplier/purchases')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Manage Requests
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={() => navigate('/supplier/inventory')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  View Inventory
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={() => navigate('/supplier/profile')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </div>
            </Card>

            {/* Inventory Summary */}
            <Card>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Inventory Summary</h2>
              </div>
              <div className="p-6">
                {itemsData?.data?.supplierItems && itemsData.data.supplierItems.length > 0 ? (
                  <div className="space-y-4">
                    {itemsData.data.supplierItems.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {item.Product?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            SKU: {item.supplier_sku}
                          </div>
                        </div>
                        <Badges
                          variant={
                            item.stock_level <= 10 ? 'danger' :
                              item.stock_level <= 25 ? 'warning' : 'success'
                          }
                          size="sm"
                        >
                          {item.stock_level} in stock
                        </Badges>
                      </div>
                    ))}
                    {itemsData.data.supplierItems.length > 4 && (
                      <Button
                        variant="secondary"
                        className="w-full justify-center mt-2"
                        onClick={() => navigate('/supplier/inventory')}
                      >
                        View All Items ({itemsData.data.supplierItems.length})
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No inventory items found</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Performance</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <Badges variant="success" size="sm">94%</Badges>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Response Time</span>
                  <span className="text-sm font-medium">2.3 hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Satisfaction Score</span>
                  <Badges variant="success" size="sm">4.8/5</Badges>
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