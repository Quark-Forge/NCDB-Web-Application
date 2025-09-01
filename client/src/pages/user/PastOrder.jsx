import React, { useState } from "react";

const sampleOrders = [
  {
    id: "123",
    status: "Pending",
    orderDate: "2025-08-25",
    estimatedDelivery: "2025-08-30",
    items: [
      {
        productName: "Cotton T-shirt",
        quantity: 2,
        price: 1000,
        image: "https://via.placeholder.com/100?text=T-shirt",
      },
      {
        productName: "Slim Fit Jeans",
        quantity: 1,
        price: 2500,
        image: "https://via.placeholder.com/100?text=Jeans",
      },
    ],
  },
  {
    id: "456",
    status: "Shipped",
    orderDate: "2025-08-20",
    estimatedDelivery: "2025-08-28",
    items: [
      {
        productName: "Running Shoes",
        quantity: 1,
        price: 2000,
        image: "https://via.placeholder.com/100?text=Shoes",
      },
    ],
  },
  {
    id: "789",
    status: "Delivered",
    orderDate: "2025-08-15",
    estimatedDelivery: "2025-08-22",
    items: [
      {
        productName: "Smart Watch",
        quantity: 1,
        price: 3000,
        image: "https://via.placeholder.com/100?text=Watch",
      },
    ],
  },
];

function OrderCard({ order, onCancelOrder }) {
  // Status color mapping
  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Shipped: "bg-blue-100 text-blue-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  // Calculate order total
  const orderTotal = order.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    onCancelOrder(order.id);
    setShowCancelConfirm(false);
  };

  const cancelCancel = () => {
    setShowCancelConfirm(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5 transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          <h3 className="font-semibold text-gray-800">Order # {order.id}</h3>
          <p className="text-sm text-gray-500">Placed on {formatDate(order.orderDate)}</p>
        </div>
        <span
          className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {order.items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
          >
            <img
              src={item.image}
              alt={item.productName}
              className="w-16 h-16 object-cover rounded-md"
            />

            <div className="flex-1">
              <h4 className="font-medium text-gray-800">
                {item.productName}
              </h4>
              <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
              <p className="font-medium text-gray-800">
                ₹{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t border-gray-100">
        <div className="text-sm">
          {order.status !== "Delivered" && order.status !== "Cancelled" ? (
            <p className="text-gray-600">
              Estimated Delivery:{" "}
              <span className="font-medium text-gray-800">
                {formatDate(order.estimatedDelivery)}
              </span>
            </p>
          ) : order.status === "Delivered" ? (
            <p className="text-green-600 font-medium">Delivered on {formatDate(order.estimatedDelivery)}</p>
          ) : null}

          <p className="text-lg font-bold text-gray-900 mt-1">
            Order Total: ₹{orderTotal.toLocaleString()}
          </p>
        </div>

        {order.status === "Pending" && (
          <div className="relative">
            <button
              onClick={handleCancelClick}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium border border-red-200 hover:bg-red-50 transition-colors"
            >
              Cancel Order
            </button>

            {showCancelConfirm && (
              <div className="absolute top-full right-0 mt-2 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-10 w-64">
                <p className="text-gray-800 font-medium mb-2">Cancel this order?</p>
                <p className="text-gray-600 text-sm mb-3">This action cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={confirmCancel}
                    className="flex-1 bg-red-600 text-white py-1.5 text-sm rounded-md font-medium hover:bg-red-700"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={cancelCancel}
                    className="flex-1 bg-gray-200 text-gray-800 py-1.5 text-sm rounded-md font-medium hover:bg-gray-300"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {order.status === "Delivered" && (
          <div className="flex gap-2">
            <button className="bg-white text-[#155dfc] px-4 py-2 rounded-lg font-medium border border-[#155dfc] hover:bg-blue-50 transition-colors">
              Buy Again
            </button>
            <button className="bg-[#155dfc] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Rate Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PastOrders() {
  const [orders, setOrders] = useState(sampleOrders);

  // Group orders by status
  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const shippedOrders = orders.filter((o) => o.status === "Shipped");
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled");

  const handleCancelOrder = (orderId) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: "Cancelled" } : order
    ));
  };

  const statusSections = [
    { title: "Pending Orders", orders: pendingOrders, status: "Pending" },
    { title: "Shipped Orders", orders: shippedOrders, status: "Shipped" },
    { title: "Delivered Orders", orders: deliveredOrders, status: "Delivered" },
    { title: "Cancelled Orders", orders: cancelledOrders, status: "Cancelled" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">View and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No orders yet</h3>
            <p className="mt-2 text-gray-500">Your orders will appear here once you make a purchase.</p>
            <button className="mt-4 bg-[#155dfc] text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {statusSections.map((section) =>
              section.orders.length > 0 && (
                <div key={section.status}>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    {section.title} ({section.orders.length})
                  </h2>
                  <div className="space-y-5">
                    {section.orders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onCancelOrder={handleCancelOrder}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PastOrders;