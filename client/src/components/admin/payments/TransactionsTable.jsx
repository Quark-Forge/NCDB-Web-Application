import { Search } from 'lucide-react';
import Card from '../../common/Card';
import Table from '../../common/Table';
import Pagination from '../../common/Pagination';
import TransactionRow from './TransactionRow';

const TransactionsTable = ({
    transactions,
    currentPage,
    totalPages,
    onPageChange,
    onViewDetails,
    onRefund,
    onDelete,
    formatDate,
    formatCurrency,
    getStatusVariant,
    itemsPerPage
}) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = transactions.slice(startIndex, startIndex + itemsPerPage);

    return (
        <Card>
            <Table
                headers={['Transaction', 'Customer', 'Date', 'Amount', 'Fees', 'Net', 'Status', 'Method', 'Actions']}
                className="rounded-lg"
            >
                {paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map((transaction) => (
                        <TransactionRow
                            key={transaction.id}
                            transaction={transaction}
                            onViewDetails={onViewDetails}
                            onRefund={onRefund}
                            onDelete={onDelete}
                            formatDate={formatDate}
                            formatCurrency={formatCurrency}
                            getStatusVariant={getStatusVariant}
                        />
                    ))
                ) : (
                    <tr>
                        <td colSpan="9" className="px-4 py-8 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                                <Search className="h-12 w-12 mb-2" />
                                <p className="text-lg font-medium">No transactions found</p>
                                <p className="text-sm">Try adjusting your search or filter criteria</p>
                            </div>
                        </td>
                    </tr>
                )}
            </Table>

            {transactions.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    className="border-t border-gray-200"
                />
            )}
        </Card>
    );
};

export default TransactionsTable;