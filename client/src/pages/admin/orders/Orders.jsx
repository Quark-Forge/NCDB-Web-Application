
import { useState } from 'react';
import { useGetAllOrdersQuery } from '../../../slices/ordersApiSlice';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import OrderStats from '../../../components/admin/orders/OrderStats';
import OrderFilters from '../../../components/admin/orders/OrderFilters';
import OrderTable from '../../../components/admin/orders/OrderTable';
import Pagination from '../../../components/common/Pagination';

const Order = () => {
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    product_id: '',
    supplier_id: '',
    searchQuery: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const { data: orders, isLoading, isError } = useGetAllOrdersQuery({
    ...filters,
    ...pagination,
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="text-red-500 p-4">Error loading orders</div>;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-2 sm:px-0">Order Management</h1>

      {/* Common stacked layout for both mobile and desktop */}
      <div className="space-y-4">
        {/* Order Stats at the top */}
        <div className="bg-white rounded-lg shadow p-4">
          <OrderStats />
        </div>

        {/* Filters section */}
        <div className="bg-white rounded-lg shadow p-4">
          <OrderFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Table with pagination */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <OrderTable
              orders={orders?.data || []}
              totalOrders={orders?.total || 0}
            />
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={Math.ceil(orders?.meta.total / pagination.limit) || 1}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            onLimitChange={(limit) => setPagination(prev => ({ ...prev, limit }))}
          />
        </div>
      </div>
    </div>
  );
};

export default Order;