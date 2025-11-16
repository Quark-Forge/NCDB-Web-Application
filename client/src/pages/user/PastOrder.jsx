import React, { useState, useMemo } from "react";
import { useGetMyOrdersQuery, useCancelUserOrderMutation } from "../../slices/ordersApiSlice";
import { useAddToCartMutation } from "../../slices/cartApiSlice";
import {
  Copy,
  ShoppingCart,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Check,
  XCircle,
  Ban
} from "lucide-react";
import { toast } from "react-toastify";
import DeleteConfirmation from "../../components/common/DeleteConfirmation";

function OrderCard({ order }) {
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelUserOrderMutation();
  const [addedItems, setAddedItems] = useState(new Set());
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const orderTotal = parseFloat(order.total_amount) || 0;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <Package className="w-4 h-4" />;
      case 'processing': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'confirmed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'processing': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Check if order can be cancelled (only before shipping)
  const canCancelOrder = () => {
    const cancellableStatuses = ['pending', 'confirmed']; // Only these statuses can be cancelled
    return cancellableStatuses.includes(order.status);
  };

  const handleCancelOrder = async () => {
    if (!canCancelOrder()) {
      toast.error('This order cannot be cancelled as it has already been shipped.');
      return;
    }

    setShowCancelConfirmation(true);
  };

  const confirmCancelOrder = async () => {
    try {
      await cancelOrder(order.id).unwrap();
      toast.success('Order cancelled successfully!');
      setShowCancelConfirmation(false);
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.data?.message || 'Failed to cancel order. Please try again.');
    }
  };

  const handleAddToCart = async (item) => {
    try {
      const cartData = {
        product_id: item.product_id,
        supplier_id: item.supplier_id,
        quantity: item.quantity || 1
      };

      await addToCart(cartData).unwrap();

      // Add to added items set
      setAddedItems(prev => new Set(prev).add(`${item.product_id}-${item.supplier_id}`));

      toast.success(`${item.Product?.name || 'Product'} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const isItemAdded = (item) => {
    return addedItems.has(`${item.product_id}-${item.supplier_id}`);
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.order_number);
    toast.info('Order ID copied to clipboard!');
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm hover:shadow-md transition-shadow">
        {/* Order Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="text-sm font-medium capitalize">
                {order.status}
              </span>
            </div>
            <span className="text-sm text-gray-500">•</span>
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(order.order_date || order.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyOrderId}
              className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span className="text-sm">Copy ID</span>
            </button>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4 mb-4">
          {order.OrderItems?.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <img
                src={item.Product?.base_image_url || '../../images/product.png'}
                alt={item.Product?.name || "Product"}
                className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                  {item.Product?.name || "Unknown Product"}
                </h4>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Qty: {item.quantity}</span>
                  <span>•</span>
                  <span>LKR {parseFloat(item.price).toLocaleString()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 text-sm">
                  LKR {(parseFloat(item.price) * (item.quantity || 0)).toLocaleString()}
                </p>
                {/* Only show Add to Cart button for non-cancelled orders */}
                {order.status !== 'cancelled' && (
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={isAddingToCart || isItemAdded(item)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs mt-2 transition-colors ${isItemAdded(item)
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {isAddingToCart ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : isItemAdded(item) ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <ShoppingCart className="w-3 h-3" />
                    )}
                    <span>
                      {isItemAdded(item) ? 'Added' : 'Add to Cart'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div>
            <p className="text-lg font-bold text-gray-900">
              LKR {orderTotal.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Order #{order.order_number}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Show cancelled badge for cancelled orders */}
            {order.status === 'cancelled' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Order Cancelled</span>
              </div>
            )}

            {/* Cancel Order Button - Only show for cancellable orders */}
            {canCancelOrder() && (
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {isCancelling ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Ban className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      <DeleteConfirmation
        isOpen={showCancelConfirmation}
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={confirmCancelOrder}
        title="Cancel Order"
        description="Are you sure you want to cancel order"
        itemName={`#${order.order_number}`}
        confirmText="Cancel Order"
        cancelText="Keep Order"
        isLoading={isCancelling}
      />
    </>
  );
}

// PastOrders component remains the same as before
function PastOrders() {
  const { data: ordersData, isLoading, error, refetch } = useGetMyOrdersQuery();
  const [activeTab, setActiveTab] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  const orders = ordersData?.data || [];

  // Filter orders by time
  const timeFilteredOrders = useMemo(() => {
    if (!orders.length) return [];

    const now = new Date();
    let filterDate = new Date();

    switch (timeFilter) {
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
      default:
        return orders;
    }

    return orders.filter(order => {
      const orderDate = new Date(order.order_date || order.createdAt);
      return orderDate >= filterDate;
    });
  }, [orders, timeFilter]);

  // Filter orders by status tab
  const filteredOrders = useMemo(() => {
    if (activeTab === "all") {
      return timeFilteredOrders;
    }
    return timeFilteredOrders.filter(order => order.status === activeTab);
  }, [timeFilteredOrders, activeTab]);

  const tabs = [
    { id: "all", label: "All Orders", icon: <Package className="w-4 h-4" />, count: orders.length },
    { id: "pending", label: "To Pay", icon: <Clock className="w-4 h-4" />, count: orders.filter(o => o.status === "pending").length },
    { id: "confirmed", label: "To Ship", icon: <Package className="w-4 h-4" />, count: orders.filter(o => o.status === "confirmed").length },
    { id: "processing", label: "Shipped", icon: <Truck className="w-4 h-4" />, count: orders.filter(o => o.status === "processing").length },
    { id: "delivered", label: "Completed", icon: <CheckCircle className="w-4 h-4" />, count: orders.filter(o => o.status === "delivered").length },
    { id: "cancelled", label: "Cancelled", icon: <XCircle className="w-4 h-4" />, count: orders.filter(o => o.status === "cancelled").length },
  ];

  const timeFilters = [
    { id: "all", label: "All Time" },
    { id: "year", label: "Last Year" },
    { id: "month", label: "This Month" },
    { id: "week", label: "This Week" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
              Order History
            </h1>
            <p className="text-gray-600 mt-2">Your purchase journey</p>
          </div>

          {/* Tabs Skeleton */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl border border-gray-200 animate-pulse min-w-max">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-5 bg-gray-200 rounded w-20"></div>
                <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
              </div>
            ))}
          </div>

          {/* Orders Skeleton */}
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load orders</h2>
            <p className="text-gray-600 mb-6">There was an issue fetching your order history</p>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
            Order History
          </h1>
          <p className="text-gray-600 mt-2">Your purchase journey</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all duration-200 min-w-max ${activeTab === tab.id
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100"
                : "bg-white text-gray-700 border-gray-200 hover:border-blue-200 hover:shadow-md"
                }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-xs font-medium ${activeTab === tab.id
                    ? "bg-white text-blue-600"
                    : "bg-blue-100 text-blue-600"
                    }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Time Filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {timeFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setTimeFilter(filter.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${timeFilter === filter.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
                : "bg-white text-gray-600 border border-gray-200 hover:border-blue-200"
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Results Info */}
        <div className="mb-6 text-sm text-gray-600">
          Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          {timeFilter !== "all" && ` from ${timeFilters.find(f => f.id === timeFilter)?.label.toLowerCase()}`}
          {activeTab !== "all" && ` • ${tabs.find(t => t.id === activeTab)?.label}`}
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === "all" ? "No orders found" : `No ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}`}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {activeTab === "all"
                ? timeFilter === "all"
                  ? "Start shopping to see your orders here"
                  : "No orders found for the selected time period"
                : `You don't have any ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()} orders${timeFilter !== "all" ? ` from ${timeFilters.find(f => f.id === timeFilter)?.label.toLowerCase()}` : ''
                }`
              }
            </p>
            <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
              <ShoppingCart className="w-4 h-4" />
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PastOrders;