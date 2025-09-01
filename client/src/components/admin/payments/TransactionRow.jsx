import { MoreVertical } from 'lucide-react';
import Dropdown from '../../common/Dropdown';
import Badges from '../../common/Badges';

const TransactionRow = ({
    transaction,
    onViewDetails,
    onRefund,
    onDelete,
    formatDate,
    formatCurrency,
    getStatusVariant
}) => {
    const actionOptions = [
        {
            value: 'view',
            label: 'View Details',
            action: () => onViewDetails(transaction)
        },
        {
            value: 'refund',
            label: 'Process Refund',
            action: () => onRefund(transaction),
            disabled: transaction.status !== 'completed'
        },
        {
            value: 'delete',
            label: 'Void Transaction',
            action: () => onDelete(transaction),
            disabled: !['pending', 'failed'].includes(transaction.status)
        }
    ];

    return (
        <tr key={transaction.id}>
            <td className="px-4 py-3 whitespace-nowrap">
                <div>
                    <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                    <div className="text-sm text-gray-500">Order: {transaction.orderId}</div>
                </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm text-gray-900">{transaction.customer}</div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatDate(transaction.date)}</div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm text-gray-500">{formatCurrency(transaction.fees)}</div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm font-medium text-green-600">{formatCurrency(transaction.net)}</div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <Badges variant={getStatusVariant(transaction.status)}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </Badges>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                    {transaction.paymentMethod === 'credit_card' ? `Card ****${transaction.cardLast4}` :
                        transaction.paymentMethod === 'paypal' ? 'PayPal' :
                            transaction.paymentMethod === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}
                </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <Dropdown
                    options={actionOptions}
                    value="actions"
                    onChange={(value) => {
                        const option = actionOptions.find(opt => opt.value === value);
                        if (option && option.action) option.action();
                    }}
                    buttonClassName="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-gray-400 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                    renderSelected={() => <MoreVertical className="h-4 w-4" />}
                />
            </td>
        </tr>
    );
};

export default TransactionRow;