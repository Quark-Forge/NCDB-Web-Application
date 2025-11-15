// components/orders/OrderDetails.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AlertCircle } from 'lucide-react';
import { usePrint } from '../../../hooks/usePrint';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { useGetOrderDetailsQuery, useUpdateOrderStatusMutation } from '../../../slices/ordersApiSlice';
import { useShippingLabel } from '../../../hooks/useShippingLabel';
import OrderHeader from '../../../components/admin/orders/OrderHeader';
import OrderSummary from '../../../components/admin/orders/OrderSummary';
import CustomerInfo from '../../../components/admin/orders/CustomerInfo';
import OrderItems from '../../../components/admin/orders/OrderItems';
import OrderSummaryCard from '../../../components/admin/orders/OrderSummaryCard';
import PaymentInfo from '../../../components/admin/orders/PaymentInfo';
import OrderActions from '../../../components/admin/orders/OrderActions';
import ShippingLabelModal from '../../../components/admin/orders/ShippingLabelModal';
import ErrorStates from '../../../components/admin/orders/ErrorStates';
import PrintInvoice from '../../../components/admin/orders/PrintInvoice';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('');
    const [imageErrors, setImageErrors] = useState({});
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [shippingData, setShippingData] = useState({
        packageType: 'package',
        weight: '1',
        notes: ''
    });

    // Fetch order details
    const { data, isLoading, error, refetch } = useGetOrderDetailsQuery(orderId);
    const order = data?.data || {};

    // Print hook
    const { printRef, handlePrint } = usePrint();

    // Update order status
    const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

    // Shipping label hook
    const { createShippingLabel, previewShippingLabel, isCreatingLabel } = useShippingLabel();

    useEffect(() => {
        if (order.status) setStatus(order.status);
    }, [order]);

    const handleStatusUpdate = async () => {
        try {
            await updateOrder({ id: orderId, status }).unwrap();
            toast.success('Order status updated');
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to update order status');
        }
    };

    const handleImageError = (itemId) => {
        setImageErrors(prev => ({ ...prev, [itemId]: true }));
    };

    const handleCreateShippingLabel = async () => {
        const result = await createShippingLabel(order, shippingData);

        if (result.success) {
            try {
                await updateOrder({ id: orderId, status: 'shipped' }).unwrap();
                setStatus('shipped');
                toast.success('Order status updated to shipped');
                refetch();
            } catch (err) {
                console.error('Failed to update order status:', err);
            }

            setShowShippingModal(false);
        }
    };

    const handlePreviewShippingLabel = () => {
        previewShippingLabel(order, shippingData);
    };

    const handlePrintInvoice = () => {
        if (!order || !order.id) {
            toast.error('No order data available for printing');
            return;
        }
        handlePrint();
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Error state
    if (error) {
        return <ErrorStates error={error} onRefetch={refetch} onNavigate={() => navigate('/admin/orders')} />;
    }

    // Check if order data is available
    if (!order || !order.id) {
        return (
            <div className="max-w-2xl mx-auto mt-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-yellow-800 mb-2">No Order Data</h2>
                    <p className="text-yellow-600 mb-4">
                        Unable to load order information.
                    </p>
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="container mx-auto px-4 py-6 space-y-6">
                <OrderHeader
                    order={order}
                    onBack={() => navigate(-1)}
                    onPrint={handlePrintInvoice}
                />

                <OrderSummary
                    order={order}
                    status={status}
                    onStatusChange={(e) => setStatus(e.target.value)}
                    onStatusUpdate={handleStatusUpdate}
                    isUpdating={isUpdating}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column (Customer + Items) */}
                    <div className="lg:col-span-2 space-y-6">
                        <CustomerInfo order={order} />
                        <OrderItems
                            order={order}
                            imageErrors={imageErrors}
                            onImageError={handleImageError}
                        />
                    </div>

                    {/* Right column (Payment + Actions) */}
                    <div className="space-y-6">
                        <OrderSummaryCard order={order} />
                        <PaymentInfo payment={order.payment} />
                        <OrderActions onCreateShippingLabel={() => setShowShippingModal(true)} />
                    </div>
                </div>

                <ShippingLabelModal
                    isOpen={showShippingModal}
                    onClose={() => setShowShippingModal(false)}
                    shippingData={shippingData}
                    onShippingDataChange={setShippingData}
                    onCreateLabel={handleCreateShippingLabel}
                    onPreviewLabel={handlePreviewShippingLabel}
                    isCreating={isCreatingLabel}
                />
            </div>

            {/* Print content - positioned off-screen but visible to the print hook */}
            <div
                ref={printRef}
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px',
                    width: '210mm', // A4 width
                    minHeight: '297mm', // A4 height
                    padding: '20mm',
                    backgroundColor: 'white',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                }}
            >
                <PrintInvoice order={order} />
            </div>
        </>
    );
};

export default OrderDetails;