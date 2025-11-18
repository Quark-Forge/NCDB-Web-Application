import { useState } from 'react';
import { useGetOrderStatsQuery } from '../../slices/ordersApiSlice';
import { useGetLowStockItemsQuery } from '../../slices/supplierItemsApiSlice';
import { FiRefreshCw } from 'react-icons/fi';
import StatsGrid from '../../components/admin/dashboard/StatsGrid';
import SalesChart from '../../components/admin/dashboard/SalesChart';
import RecentOrdersTable from '../../components/admin/dashboard/RecentOrdersTable';
import OrderStatusChart from '../../components/admin/dashboard/OrderStatusChart';
import TopProducts from '../../components/admin/dashboard/TopProducts';
import LowStockAlert from '../../components/admin/dashboard/LowStockAlert';

const Dashboard = () => {
  const [dateRange, setDateRange] = useState('30d');
  const { data, error, isLoading, refetch } = useGetOrderStatsQuery({ range: dateRange });
  const { data: lowStockData } = useGetLowStockItemsQuery({ threshold: 10, page: 1, limit: 5 });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <FiRefreshCw className="animate-spin text-3xl text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const stats = data?.data || {};
  const lowStockItems = lowStockData?.data || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-600">Real-time insights into your store performance</p>
        </div>
        <div className="flex gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All</option>
          </select>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <StatsGrid stats={stats} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart - 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Revenue Trend ({dateRange === '7d' ? 'Last 7 Days' : dateRange === '30d' ? 'Last 30 Days' : dateRange === '90d' ? 'Last 90 Days' : 'All Time'})
          </h2>
          <SalesChart salesData={stats.sales_trend || []} />
        </div>

        {/* Order Status Chart - 1 col */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Order Status Distribution</h2>
          <OrderStatusChart statusData={stats.status_distribution || []} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders - 2 cols */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
          </div>
          <RecentOrdersTable />
        </div>

        {/* Right Sidebar - 1 col */}
        <div className="space-y-6">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-800">Top Selling Products</h3>
            </div>
            <TopProducts topProducts={stats.top_selling_products} />
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-800">Low Stock Alert</h3>
            </div>
            <LowStockAlert
              lowStockItems={lowStockItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;