import React, { useState } from "react";

const sampleOrders = [
  {
    id: "123",
    status: "Pending",
    estimatedDelivery: "2025-08-30",
    items: [
      {
        productName: "T-shirt",
        quantity: 2,
        price: 1000,
        image: "https://via.placeholder.com/100",
      },
      {
        productName: "Jeans",
        quantity: 1,
        price: 2500,
        image: "https://via.placeholder.com/100",
      },
    ],
  },
  {
    id: "456",
    status: "Shipped",
    estimatedDelivery: "2025-08-28",
    items: [
      {
        productName: "Shoes",
        quantity: 1,
        price: 2000,
        image: "https://via.placeholder.com/100",
      },
    ],
  },
  {
    id: "789",
    status: "Delivered",
    estimatedDelivery: null,
    items: [
      {
        productName: "Watch",
        quantity: 1,
        price: 3000,
        image: "https://via.placeholder.com/100",
      },
    ],
  },
];

function OrderCard({ order }) {
  // Status color mapping
  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-700",
    Shipped: "bg-blue-100 text-blue-700",
    Delivered: "bg-green-100 text-green-700",
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">Order ID: {order.id}</h3>
        <span
          className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      <div className="space-y-4">
        {order.items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border rounded-lg p-3"
          >
            {/* Image */}
            <img
              src={item.image}
              alt={item.productName}
              className="w-20 h-20 object-cover rounded-lg"
            />

            {/* Item Info */}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">
                {item.productName}
              </h4>
              <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
              <p className="font-medium text-gray-800">
                Price: ₹{item.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Estimated Delivery or Cancel Button */}
      <div className="mt-4 flex justify-between items-center">
        {order.status !== "Delivered" && (
          <p className="text-sm text-gray-600">
            Estimated Delivery:{" "}
            <span className="font-medium text-gray-800">
              {order.estimatedDelivery}
            </span>
          </p>
        )}

        {order.status === "Pending" && (
          <button className="bg-[#155dfc] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}

function PastOrders() {
  // Group orders by status
  const pendingOrders = sampleOrders.filter((o) => o.status === "Pending");
  const shippedOrders = sampleOrders.filter((o) => o.status === "Shipped");
  const deliveredOrders = sampleOrders.filter((o) => o.status === "Delivered");

  return (
    <div className="bg-slate-100 min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-[#155dfc] mb-6">
          My Orders
        </h1>

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-[#155dfc] mb-4 border-b pb-2">
              Pending Orders
            </h2>
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Shipped Orders */}
        {shippedOrders.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-[#155dfc] mb-4 border-b pb-2">
              Shipped Orders
            </h2>
            <div className="space-y-4">
              {shippedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Delivered Orders */}
        {deliveredOrders.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-[#155dfc] mb-4 border-b pb-2">
              Delivered Orders
            </h2>
            <div className="space-y-4">
              {deliveredOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PastOrders;
