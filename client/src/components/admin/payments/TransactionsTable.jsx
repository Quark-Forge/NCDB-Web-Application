import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../common/Card';
import Table from '../../common/Table';
import Badges from '../../common/Badges';
import Dropdown from '../../common/Dropdown';
import ExportPrintBar from '../../common/ExportPrintBar';
import { useUpdatePaymentStatusMutation, useProcessRefundMutation } from '../../../slices/paymentApiSlice';
import { useExport } from '../../../hooks/useExport';
import { usePrint } from '../../../hooks/usePrint';
import { toast } from 'react-toastify';
import { FiEye, FiPrinter, FiRefreshCw, FiDollarSign } from 'react-icons/fi';

const PaymentTable = ({ payments = [], totalPayments = 0 }) => {
    const [updatePaymentStatus, { isLoading: isUpdating }] = useUpdatePaymentStatusMutation();
    const [processRefund, { isLoading: isRefunding }] = useProcessRefundMutation();
    const [updatingPaymentId, setUpdatingPaymentId] = useState(null);
    const [refundingPaymentId, setRefundingPaymentId] = useState(null);

    const { exportToCSV, isExporting } = useExport();
    const { printRef, handlePrint } = usePrint();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-LK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR'
        }).format(amount);
    };

    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' },
        { value: 'partially_refunded', label: 'Partially Refunded' }
    ];

    const statusVariant = {
        pending: 'warning',
        paid: 'success',
        failed: 'danger',
        refunded: 'info',
        partially_refunded: 'info'
    };

    const methodVariant = {
        cash_on_delivery: 'default',
        credit_card: 'primary',
        bank_transfer: 'info',
        paypal: 'secondary',
        digital_wallet: 'success'
    };

    const getMethodLabel = (method) => {
        const methods = {
            cash_on_delivery: 'Cash on Delivery',
            credit_card: 'Credit Card',
            bank_transfer: 'Bank Transfer',
            paypal: 'PayPal',
            digital_wallet: 'Digital Wallet'
        };
        return methods[method] || method;
    };

    const headers = [
        'Transaction ID',
        'Order ID',
        'Date',
        'Customer',
        'Amount',
        'Status',
        'Method',
        'Actions'
    ];

    const handleStatusChange = async (paymentId, newStatus) => {
        setUpdatingPaymentId(paymentId);
        try {
            await updatePaymentStatus({
                id: paymentId,
                payment_status: newStatus,
                notes: `Status updated to ${newStatus} by admin`
            }).unwrap();
            toast.success(`Payment status updated to ${newStatus}`);
        } catch (error) {
            console.error('Failed to update payment status:', error);
            toast.error(error.data?.message || 'Failed to update payment status');
        } finally {
            setUpdatingPaymentId(null);
        }
    };

    const handleRefund = async (payment) => {
        if (window.confirm(`Are you sure you want to refund ${formatCurrency(payment.amount)} for order ${payment.order_number}?`)) {
            setRefundingPaymentId(payment.id);
            try {
                await processRefund({
                    id: payment.id,
                    refund_amount: payment.amount,
                    reason: 'Admin initiated refund'
                }).unwrap();
                toast.success('Refund processed successfully!');
            } catch (error) {
                console.error('Refund error:', error);
                toast.error(error.data?.message || 'Failed to process refund');
            } finally {
                setRefundingPaymentId(null);
            }
        }
    };

    const handleExport = () => {
        const exportData = payments.map(payment => ({
            'Transaction ID': payment.transaction_id,
            'Order ID': payment.order_number,
            'Date': formatDate(payment.date),
            'Customer': payment.customer_name,
            'Amount': payment.amount,
            'Status': payment.payment_status,
            'Payment Method': getMethodLabel(payment.payment_method),
            'Order Status': payment.order_status
        }));

        exportToCSV(exportData, 'payments_export', 'payments');
    };

    return (
        <>
            <Card className="p-0">
                <div className="px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b">
                    <h2 className="text-sm font-semibold mb-2 sm:mb-0">Payments ({totalPayments})</h2>
                    <ExportPrintBar
                        onExport={handleExport}
                        onPrint={handlePrint}
                        isExporting={isExporting}
                        exportDisabled={payments.length === 0}
                        printDisabled={payments.length === 0}
                    />
                </div>

                <div className="relative overflow-x-auto">
                    <Table headers={headers}>
                        {payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                                    {payment.transaction_id}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    {payment.order_number ? (
                                        <Link
                                            to={`/admin/orders/${payment.order_id}`}
                                            className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                                        >
                                            #{payment.order_number}
                                        </Link>
                                    ) : (
                                        <span className="text-gray-500">N/A</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(payment.date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    {payment.customer_name || 'Unknown Customer'}
                                    {payment.customer_city && (
                                        <div className="text-xs text-gray-500">{payment.customer_city}</div>
                                    )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {formatCurrency(payment.amount)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {updatingPaymentId === payment.id && isUpdating ? (
                                            <span className="text-sm text-gray-500">Updating...</span>
                                        ) : (
                                            <Dropdown
                                                options={statusOptions}
                                                value={payment.payment_status}
                                                onChange={(value) => handleStatusChange(payment.id, value)}
                                                renderSelected={(selected) => (
                                                    <Badges variant={statusVariant[selected.value] || 'default'}>
                                                        {selected.label}
                                                    </Badges>
                                                )}
                                                buttonClassName="p-1 hover:bg-gray-100 rounded"
                                                menuClassName="min-w-[160px]"
                                                disabled={isUpdating}
                                            />
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <Badges variant={methodVariant[payment.payment_method] || 'default'}>
                                        {getMethodLabel(payment.payment_method)}
                                    </Badges>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-3">
                                        <Link
                                            to={`/admin/orders/${payment.order_id}`}
                                            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
                                            aria-label={`View order ${payment.order_number}`}
                                        >
                                            <FiEye size={16} />
                                        </Link>
                                        {payment.payment_status === 'paid' && (
                                            <button
                                                onClick={() => handleRefund(payment)}
                                                disabled={isRefunding && refundingPaymentId === payment.id}
                                                className="text-green-600 hover:text-green-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded px-1 disabled:opacity-50"
                                                aria-label={`Refund payment ${payment.transaction_id}`}
                                            >
                                                {isRefunding && refundingPaymentId === payment.id ? (
                                                    <FiRefreshCw size={16} className="animate-spin" />
                                                ) : (
                                                    <FiDollarSign size={16} />
                                                )}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                // Single payment print functionality
                                                const printWindow = window.open('', '_blank');
                                                printWindow.document.write(`
                          <html>
                            <head>
                              <title>Payment #${payment.transaction_id}</title>
                              <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                .header { text-align: center; margin-bottom: 30px; }
                                .section { margin-bottom: 20px; }
                                table { width: 100%; border-collapse: collapse; }
                                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                th { background-color: #f5f5f5; }
                              </style>
                            </head>
                            <body>
                              <div class="header">
                                <h1>Payment Receipt</h1>
                                <p>Transaction ID: ${payment.transaction_id}</p>
                                <p>Generated on ${new Date().toLocaleDateString()}</p>
                              </div>
                              <div class="section">
                                <h3>Payment Details</h3>
                                <table>
                                  <tr><th>Order ID:</th><td>${payment.order_number || 'N/A'}</td></tr>
                                  <tr><th>Date:</th><td>${formatDate(payment.date)}</td></tr>
                                  <tr><th>Customer:</th><td>${payment.customer_name || 'Unknown Customer'}</td></tr>
                                  <tr><th>Amount:</th><td>${formatCurrency(payment.amount)}</td></tr>
                                  <tr><th>Status:</th><td>${payment.payment_status}</td></tr>
                                  <tr><th>Method:</th><td>${getMethodLabel(payment.payment_method)}</td></tr>
                                </table>
                              </div>
                            </body>
                          </html>
                        `);
                                                printWindow.document.close();
                                                printWindow.print();
                                            }}
                                            className="text-gray-600 hover:text-gray-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded px-1"
                                            aria-label={`Print payment ${payment.transaction_id}`}
                                        >
                                            <FiPrinter size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </Table>
                </div>
            </Card>

            {/* Hidden printable content */}
            <div style={{ display: 'none' }}>
                <div ref={printRef}>
                    <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Payments Report</h1>
                        <p className="text-gray-600 mb-6">Generated on {new Date().toLocaleDateString()}</p>
                        <table className="min-w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2 text-left">Transaction ID</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Order ID</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Customer</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Method</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td className="border border-gray-300 px-4 py-2">{payment.transaction_id}</td>
                                        <td className="border border-gray-300 px-4 py-2">{payment.order_number || 'N/A'}</td>
                                        <td className="border border-gray-300 px-4 py-2">{formatDate(payment.date)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{payment.customer_name || 'Unknown Customer'}</td>
                                        <td className="border border-gray-300 px-4 py-2">{formatCurrency(payment.amount)}</td>
                                        <td className="border border-gray-300 px-4 py-2">{payment.payment_status}</td>
                                        <td className="border border-gray-300 px-4 py-2">{getMethodLabel(payment.payment_method)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentTable;