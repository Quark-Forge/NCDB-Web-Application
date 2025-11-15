import { useState } from 'react';
import { useGetPaymentTransactionsQuery, useGetPaymentStatsQuery } from '../../../slices/paymentApiSlice';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import PaymentStats from '../../../components/admin/payments/PaymentStats';
import PaymentFilters from '../../../components/admin/payments/PaymentFilters';
import TransactionsTable from '../../../components/admin/payments/TransactionsTable';
import Pagination from '../../../components/common/Pagination';

const Payments = () => {
    const [filters, setFilters] = useState({
        range: '90d',
        payment_status: '',
        payment_method: '',
        search: '',
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    });

    const { data: payments, isLoading, isError } = useGetPaymentTransactionsQuery({
        ...filters,
        ...pagination,
    });

    const { data: stats, isLoading: statsLoading } = useGetPaymentStatsQuery({ range: filters.range });

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
    };

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <div className="text-red-500 p-4">Error loading payments</div>;

    return (
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-2 sm:px-0">Payment Management</h1>

            {/* Common stacked layout for both mobile and desktop */}
            <div className="space-y-4">
                {/* Payment Stats at the top */}
                <div className="bg-white rounded-lg shadow p-4">
                    <PaymentStats data={stats} isLoading={statsLoading} />
                </div>

                {/* Filters section */}
                <div className="bg-white rounded-lg shadow p-4">
                    <PaymentFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                </div>

                {/* Table with pagination */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <TransactionsTable
                            payments={payments?.data || []}
                            totalPayments={payments?.meta.total || 0}
                        />
                    </div>
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={Math.ceil(payments?.meta.total / pagination.limit) || 1}
                        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                        onLimitChange={(limit) => setPagination(prev => ({ ...prev, limit }))}
                    />
                </div>
            </div>
        </div>
    );
};

export default Payments;