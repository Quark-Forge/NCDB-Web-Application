import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../common/Card';
import Table from '../../common/Table';
import Badges from '../../common/Badges';
import ExportPrintBar from '../../common/ExportPrintBar';
import { useExport } from '../../../hooks/useExport';
import { usePrint } from '../../../hooks/usePrint';
import { FiEye, FiPrinter } from 'react-icons/fi';

const PaymentTable = ({ payments = [], totalPayments = 0 }) => {
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

    const getStatusLabel = (status) => {
        const statusLabels = {
            pending: 'Pending',
            paid: 'Paid',
            failed: 'Failed',
            refunded: 'Refunded',
            partially_refunded: 'Partially Refunded'
        };
        return statusLabels[status] || status;
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

    // CSV Export Configuration
    const exportHeaders = [
        { key: 'transaction_id', label: 'Transaction ID' },
        { key: 'order_number', label: 'Order ID' },
        { key: 'date', label: 'Date' },
        { key: 'customer_name', label: 'Customer' },
        { key: 'amount', label: 'Amount' },
        { key: 'payment_status', label: 'Status' },
        { key: 'payment_method', label: 'Payment Method' },
        { key: 'order_status', label: 'Order Status' }
    ];

    const handleExport = () => {
        // Prepare data for export
        const exportData = payments.map(payment => ({
            transaction_id: payment.transaction_id,
            order_number: payment.order_number,
            date: payment.date,
            customer_name: payment.customer_name,
            amount: payment.amount,
            payment_status: getStatusLabel(payment.payment_status),
            payment_method: getMethodLabel(payment.payment_method),
            order_status: payment.order_status
        }));

        exportToCSV(exportData, exportHeaders, 'payments', {
            dateFields: ['date']
        });
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
                                    <Badges variant={statusVariant[payment.payment_status] || 'default'}>
                                        {getStatusLabel(payment.payment_status)}
                                    </Badges>
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
                                  <tr><th>Status:</th><td>${getStatusLabel(payment.payment_status)}</td></tr>
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
                                        <td className="border border-gray-300 px-4 py-2">{getStatusLabel(payment.payment_status)}</td>
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