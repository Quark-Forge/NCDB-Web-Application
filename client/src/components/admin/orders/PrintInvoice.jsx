// components/admin/orders/PrintInvoice.jsx
const PrintInvoice = ({ order }) => {
    return (
        <div className="invoice-container">
            {/* Header */}
            <div className="invoice-header" style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#333' }}>INVOICE</h1>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#666' }}>Order #{order.order_number}</h2>
                <p style={{ margin: '5px 0', color: '#666' }}>
                    Date: {new Date(order.createdAt).toLocaleDateString('en-LK', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            {/* Customer Information */}
            <div className="customer-section" style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '15px' }}>
                    Customer Information
                </h3>
                <p style={{ margin: '5px 0' }}><strong>Name:</strong> {order.shipping_name}</p>
                <p style={{ margin: '5px 0' }}><strong>Phone:</strong> {order.shipping_phone}</p>
                <p style={{ margin: '5px 0' }}>
                    <strong>Address:</strong> {order.address_line1}
                    {order.address_line2 ? ', ' + order.address_line2 : ''}, {order.city}, {order.state} {order.postal_code}
                </p>
                {order.customer?.email && (
                    <p style={{ margin: '5px 0' }}><strong>Email:</strong> {order.customer.email}</p>
                )}
            </div>

            {/* Order Items */}
            <div className="items-section" style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '15px' }}>
                    Order Items
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '15px 0', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Product</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Price</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Quantity</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item, index) => (
                            <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                    <div>
                                        <strong>{item.Product?.name}</strong>
                                        {item.Product?.sku && (
                                            <div style={{ fontSize: '12px', color: '#666' }}>SKU: {item.Product.sku}</div>
                                        )}
                                    </div>
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>LKR {item.price}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{item.quantity}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: 'bold' }}>
                                    LKR {(item.price * item.quantity).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Order Summary */}
            <div className="summary-section" style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#333', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '15px' }}>
                    Order Summary
                </h3>
                <table style={{ width: '300px', marginLeft: 'auto', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: '8px 12px', borderBottom: '1px solid #ddd' }}><strong>Subtotal:</strong></td>
                            <td style={{ padding: '8px 12px', borderBottom: '1px solid #ddd' }}>LKR {order.subtotal || 0}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px 12px', borderBottom: '1px solid #ddd' }}><strong>Shipping:</strong></td>
                            <td style={{ padding: '8px 12px', borderBottom: '1px solid #ddd' }}>LKR {order.shipping_cost || 0}</td>
                        </tr>
                        <tr style={{ borderTop: '2px solid #333' }}>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}><strong>Total:</strong></td>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}><strong>LKR {order.final_total || 0}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Payment Information */}
            {order.payment && (
                <div className="payment-section" style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
                    <h3 style={{ color: '#333', marginBottom: '15px' }}>Payment Information</h3>
                    <p style={{ margin: '5px 0' }}><strong>Status:</strong> {order.payment.payment_status}</p>
                    {order.payment.payment_method && (
                        <p style={{ margin: '5px 0' }}><strong>Method:</strong> {order.payment.payment_method}</p>
                    )}
                    {order.payment.amount && (
                        <p style={{ margin: '5px 0' }}><strong>Amount Paid:</strong> LKR {order.payment.amount}</p>
                    )}
                    {order.payment.transaction_id && (
                        <p style={{ margin: '5px 0' }}><strong>Transaction ID:</strong> {order.payment.transaction_id}</p>
                    )}
                    {order.payment.payment_date && (
                        <p style={{ margin: '5px 0' }}>
                            <strong>Payment Date:</strong> {new Date(order.payment.payment_date).toLocaleDateString('en-LK')}
                        </p>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="invoice-footer" style={{ marginTop: '40px', textAlign: 'center', color: '#666', fontStyle: 'italic', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
                <p style={{ margin: '5px 0' }}>Thank you for your business!</p>
                <p style={{ margin: '5px 0', fontSize: '12px' }}>
                    Invoice generated on: {new Date().toLocaleDateString('en-LK')}
                </p>
            </div>
        </div>
    );
};

export default PrintInvoice;