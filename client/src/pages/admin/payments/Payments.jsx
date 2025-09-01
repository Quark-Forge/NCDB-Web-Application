import { useState, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import DeleteConfirmation from '../../../components/common/DeleteConfirmation';
import PaymentStats from '../../../components/admin/payments/PaymentStats';
import PaymentFilters from '../../../components/admin/payments/PaymentFilters';
import TransactionsTable from '../../../components/admin/payments/TransactionsTable';

const Payments = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const itemsPerPage = 10;

    // Mock data fetch
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            // Simulate API call
            setTimeout(() => {
                const mockData = [
                    {
                        id: 'trx_001',
                        orderId: 'ORD-12345',
                        customer: 'John Doe',
                        date: '2023-10-15T14:30:00Z',
                        amount: 129.99,
                        fees: 3.90,
                        net: 126.09,
                        status: 'completed',
                        paymentMethod: 'credit_card',
                        cardLast4: '4242',
                        gateway: 'stripe',
                        gatewayId: 'ch_1MabcDefGhiJklM'
                    },
                ];
                setTransactions(mockData);
                setFilteredTransactions(mockData);
                setIsLoading(false);
            }, 1000);
        };

        fetchData();
    }, []);

    // Filter transactions based on search and filters
    useEffect(() => {
        let result = transactions;

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(transaction =>
                transaction.orderId.toLowerCase().includes(term) ||
                transaction.customer.toLowerCase().includes(term) ||
                transaction.gatewayId.toLowerCase().includes(term)
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            result = result.filter(transaction => transaction.status === statusFilter);
        }

        // Apply payment method filter
        if (paymentMethodFilter !== 'all') {
            result = result.filter(transaction => transaction.paymentMethod === paymentMethodFilter);
        }

        setFilteredTransactions(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, statusFilter, paymentMethodFilter, transactions]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusFilterChange = (value) => {
        setStatusFilter(value);
    };

    const handlePaymentMethodFilterChange = (value) => {
        setPaymentMethodFilter(value);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleViewDetails = (transaction) => {
        alert(`Viewing details for transaction: ${transaction.id}`);
    };

    const handleRefund = (transaction) => {
        alert(`Initiating refund for transaction: ${transaction.id}`);
    };

    const handleDelete = (transaction) => {
        setSelectedTransaction(transaction);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedTransaction) {
            setTransactions(transactions.filter(t => t.id !== selectedTransaction.id));
            setDeleteModalOpen(false);
            setSelectedTransaction(null);
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'refunded': return 'info';
            case 'failed': return 'danger';
            case 'disputed': return 'danger';
            default: return 'neutral';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const stats = {
        totalRevenue: 825.73,
        successfulTransactions: 42,
        pendingIssues: 3
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="primary" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            <PaymentStats stats={stats} />

            <PaymentFilters
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                paymentMethodFilter={paymentMethodFilter}
                onPaymentMethodFilterChange={handlePaymentMethodFilterChange}
            />

            <TransactionsTable
                transactions={filteredTransactions}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onViewDetails={handleViewDetails}
                onRefund={handleRefund}
                onDelete={handleDelete}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                getStatusVariant={getStatusVariant}
                itemsPerPage={itemsPerPage}
            />

            <DeleteConfirmation
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Void Transaction"
                description="Are you sure you want to void this transaction? This action cannot be undone."
                itemName={selectedTransaction?.id}
                confirmText="Void Transaction"
            />
        </div>
    );
};

export default Payments;