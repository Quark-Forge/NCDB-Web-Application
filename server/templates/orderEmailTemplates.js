// templates/orderEmailTemplates.js

export const orderConfirmationTemplate = (order, user, additionalData = {}) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmed - NCDB Mart</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            text-align: center;
            background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
            color: white;
            padding: 30px 20px;
        }
        .content {
            padding: 30px;
        }
        .order-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .order-item {
            border-bottom: 1px solid #eee;
            padding: 15px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .order-item:last-child {
            border-bottom: none;
        }
        .item-details {
            flex: 1;
        }
        .item-price {
            text-align: right;
            min-width: 100px;
        }
        .total-section {
            background: #e8f5e8;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            background: #00b894;
            color: white;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmed! 🎉</h1>
            <p>Thank you for your purchase, ${user.name}!</p>
        </div>
        <div class="content">
            <div class="order-info">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> #${order.order_number}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                <div class="status-badge">${order.status.toUpperCase()}</div>
            </div>

            <h3>Order Items</h3>
            ${additionalData.items ? additionalData.items.map(item => `
                <div class="order-item">
                    <div class="item-details">
                        <strong>${item.Product.name}</strong>
                        <br>
                        <small>Qty: ${item.quantity} × LKR ${parseFloat(item.price).toFixed(2)}</small>
                    </div>
                    <div class="item-price">
                        LKR ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                </div>
            `).join('') : ''}

            <div class="total-section">
                <h3>Order Total: LKR ${parseFloat(order.total_amount).toFixed(2)}</h3>
                <p>Shipping: LKR ${parseFloat(additionalData.shippingCost || 0).toFixed(2)}</p>
                <p><strong>Final Total: LKR ${(parseFloat(order.total_amount) + parseFloat(additionalData.shippingCost || 0)).toFixed(2)}</strong></p>
            </div>

            <p>We're processing your order and will notify you when it ships. You can track your order status from your account dashboard.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} NCDB Mart. All rights reserved.</p>
            <p>Need help? Contact our support team at ncdbmart@gmail.com</p>
        </div>
    </div>
</body>
</html>
`;

export const orderStatusUpdateTemplate = (order, user, additionalData = {}) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Updated - NCDB Mart</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
        }
        .content {
            padding: 30px;
        }
        .status-update {
            background: #e7f3ff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .status-badge {
            display: inline-block;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            border-radius: 25px;
            font-weight: bold;
            font-size: 18px;
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Status Updated</h1>
            <p>Your order status has been updated</p>
        </div>
        <div class="content">
            <div class="status-update">
                <h3>Order #${order.order_number}</h3>
                <div class="status-badge">${order.status.toUpperCase()}</div>
                <p>Your order status has been updated from <strong>${additionalData.previousStatus}</strong> to <strong>${additionalData.newStatus}</strong>.</p>
            </div>
            
            <p>We'll continue to keep you updated on your order progress. You can always check the latest status in your account dashboard.</p>
            
            <p>Thank you for shopping with NCDB Mart!</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} NCDB Mart. All rights reserved.</p>
            <p>Need help? Contact our support team at support@ncdbmart.com</p>
        </div>
    </div>
</body>
</html>
`;

export const orderCancelledTemplate = (order, user, additionalData = {}) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Cancelled - NCDB Mart</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            text-align: center;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white;
            padding: 30px 20px;
        }
        .content {
            padding: 30px;
        }
        .cancellation-info {
            background: #ffeaea;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .status-badge {
            display: inline-block;
            padding: 10px 20px;
            background: #ff6b6b;
            color: white;
            border-radius: 25px;
            font-weight: bold;
            font-size: 18px;
            margin: 10px 0;
        }
        .refund-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Cancelled</h1>
            <p>Your order has been cancelled</p>
        </div>
        <div class="content">
            <div class="cancellation-info">
                <h3>Order #${order.order_number}</h3>
                <div class="status-badge">CANCELLED</div>
                <p>Your order has been successfully cancelled.</p>
            </div>
            
            <p>We hope to see you again soon at NCDB Mart!</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} NCDB Mart. All rights reserved.</p>
            <p>Need help? Contact our support team at ncdmart@gmail.com</p>
        </div>
    </div>
</body>
</html>
`;

export const orderShippedTemplate = (order, user, additionalData = {}) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Shipped - NCDB Mart</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            text-align: center;
            background: linear-gradient(135deg, #fd9644 0%, #f39c12 100%);
            color: white;
            padding: 30px 20px;
        }
        .content {
            padding: 30px;
        }
        .shipping-info {
            background: #fff3e0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .status-badge {
            display: inline-block;
            padding: 10px 20px;
            background: #fd9644;
            color: white;
            border-radius: 25px;
            font-weight: bold;
            font-size: 18px;
            margin: 10px 0;
        }
        .tracking-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Shipped! 🚚</h1>
            <p>Your order is on the way</p>
        </div>
        <div class="content">
            <div class="shipping-info">
                <h3>Order #${order.order_number}</h3>
                <div class="status-badge">SHIPPED</div>
                <p>Great news! Your order has been shipped and is on its way to you.</p>
            </div>
            
            <div class="tracking-info">
                <h4>Delivery Information</h4>
                <p>Your order should arrive within the estimated delivery timeframe.</p>
                <p>You can track your order status from your account dashboard.</p>
            </div>
            
            <p>Thank you for shopping with NCDB Mart!</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} NCDB Mart. All rights reserved.</p>
            <p>Need help? Contact our support team at ncdmart@gmail.com</p>
        </div>
    </div>
</body>
</html>
`;

export const orderDeliveredTemplate = (order, user, additionalData = {}) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Delivered - NCDB Mart</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            text-align: center;
            background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
            color: white;
            padding: 30px 20px;
        }
        .content {
            padding: 30px;
        }
        .delivery-info {
            background: #e8f5e8;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .status-badge {
            display: inline-block;
            padding: 10px 20px;
            background: #00b894;
            color: white;
            border-radius: 25px;
            font-weight: bold;
            font-size: 18px;
            margin: 10px 0;
        }
        .review-prompt {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            text-align: center;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Delivered! 🎊</h1>
            <p>Your order has been successfully delivered</p>
        </div>
        <div class="content">
            <div class="delivery-info">
                <h3>Order #${order.order_number}</h3>
                <div class="status-badge">DELIVERED</div>
                <p>Your order has been successfully delivered. We hope you're enjoying your purchase!</p>
            </div>
            
            <p>Thank you for choosing NCDB Mart. We look forward to serving you again!</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} NCDB Mart. All rights reserved.</p>
            <p>Need help? Contact our support team at ncdmart@gmail.com</p>
        </div>
    </div>
</body>
</html>
`;