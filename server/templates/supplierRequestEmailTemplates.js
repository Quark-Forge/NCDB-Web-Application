// templates/supplierRequestEmailTemplates.js

export const supplierRequestNotificationTemplate = (request, supplier) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Item Request - NCDB Mart</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
        .container { background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; }
        .content { padding: 30px; }
        .request-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Item Request! 📦</h1>
            <p>You have received a new purchase request</p>
        </div>
        <div class="content">
            <div class="request-info">
                <h3>Request Details</h3>
                <p><strong>Request ID:</strong> #${request.id}</p>
                <p><strong>Product:</strong> ${request.SupplierItem?.Product?.name || 'Unknown Product'}</p>
                <p><strong>Quantity:</strong> ${request.quantity}</p>
                <p><strong>Urgency:</strong> ${request.urgency}</p>
                <p><strong>Requested By:</strong> ${request.User?.name || 'Unknown User'}</p>
                ${request.notes_from_requester ? `<p><strong>Notes:</strong> ${request.notes_from_requester}</p>` : ''}
            </div>
            
            <p>Please log in to your supplier dashboard to review and respond to this request.</p>
            
            <p>Thank you for being a valued supplier with NCDB Mart!</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} NCDB Mart. All rights reserved.</p>
            <p>Need help? Contact our support team at ncdbmart@gmail.com</p>
        </div>
    </div>
</body>
</html>
`;

export const requestStatusUpdateTemplate = (request, user) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Request Status Updated - NCDB Mart</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
        .container { background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; }
        .content { padding: 30px; }
        .status-info { background: #e7f3ff; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Request Status Updated</h1>
            <p>Your item request status has been updated</p>
        </div>
        <div class="content">
            <div class="status-info">
                <h3>Request #${request.id}</h3>
                <p><strong>Status:</strong> ${request.status.toUpperCase()}</p>
                <p><strong>Product:</strong> ${request.SupplierItem?.Product?.name || 'Unknown Product'}</p>
                <p><strong>Quantity:</strong> ${request.quantity}</p>
            </div>
            
            <p>You can check the latest status in your account dashboard.</p>
            
            <p>Thank you for using NCDB Mart!</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} NCDB Mart. All rights reserved.</p>
            <p>Need help? Contact our support team at ncdbmart@gmail.com</p>
        </div>
    </div>
</body>
</html>
`;

export const requestApprovedTemplate = (request, user) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Request Approved - NCDB Mart</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
        .container { background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { text-align: center; background: linear-gradient(135deg, #00b894 0%, #00a085 100%); color: white; padding: 30px 20px; }
        .content { padding: 30px; }
        .approved-info { background: #e8f5e8; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Request Approved! ✅</h1>
            <p>Your item request has been approved</p>
        </div>
        <div class="content">
            <div class="approved-info">
                <h3>Request #${request.id}</h3>
                <p><strong>Product:</strong> ${request.SupplierItem?.Product?.name || 'Unknown Product'}</p>
                <p><strong>Quantity:</strong> ${request.quantity}</p>
                <p><strong>Supplier Quote:</strong> LKR ${parseFloat(request.supplier_quote).toFixed(2)}</p>
                ${request.notes_from_supplier ? `<p><strong>Supplier Notes:</strong> ${request.notes_from_supplier}</p>` : ''}
            </div>
            
            <p>The supplier has approved your request and provided a quote. The items will be processed soon.</p>
            
            <p>Thank you for using NCDB Mart!</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} NCDB Mart. All rights reserved.</p>
            <p>Need help? Contact our support team at ncdbmart@gmail.com</p>
        </div>
    </div>
</body>
</html>
`;

export const requestRejectedTemplate = (request, user) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Request Rejected - NCDB Mart</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
        .container { background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { text-align: center; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px 20px; }
        .content { padding: 30px; }
        .rejected-info { background: #ffeaea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Request Rejected</h1>
            <p>Your item request has been rejected</p>
        </div>
        <div class="content">
            <div class="rejected-info">
                <h3>Request #${request.id}</h3>
                <p><strong>Product:</strong> ${request.SupplierItem?.Product?.name || 'Unknown Product'}</p>
                <p><strong>Quantity:</strong> ${request.quantity}</p>
                <p><strong>Reason:</strong> ${request.rejection_reason}</p>
            </div>
            
            <p>We apologize for any inconvenience. You may want to try requesting from another supplier or contact our support team for assistance.</p>
            
            <p>Thank you for using NCDB Mart!</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} NCDB Mart. All rights reserved.</p>
            <p>Need help? Contact our support team at ncdbmart@gmail.com</p>
        </div>
    </div>
</body>
</html>
`;

export const requestCancelledTemplate = (request, user) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Request Cancelled - NCDB Mart</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
        .container { background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { text-align: center; background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%); color: white; padding: 30px 20px; }
        .content { padding: 30px; }
        .cancelled-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Request Cancelled</h1>
            <p>Item request has been cancelled</p>
        </div>
        <div class="content">
            <div class="cancelled-info">
                <h3>Request #${request.id}</h3>
                <p><strong>Product:</strong> ${request.SupplierItem?.Product?.name || 'Unknown Product'}</p>
                <p><strong>Quantity:</strong> ${request.quantity}</p>
                <p><strong>Status:</strong> CANCELLED</p>
            </div>
            
            <p>This request has been cancelled. If this was unexpected, please contact our support team.</p>
            
            <p>Thank you for using NCDB Mart!</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} NCDB Mart. All rights reserved.</p>
            <p>Need help? Contact our support team at ncdbmart@gmail.com</p>
        </div>
    </div>
</body>
</html>
`;