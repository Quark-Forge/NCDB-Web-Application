
export const verificationEmailTemplate = (verifyUrl) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
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
        .button {
            display: block;
            width: 200px;
            margin: 30px auto;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 25px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .link-backup {
            word-break: break-all;
            background: #eee;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to NCDB Mart! 🛍️</h1>
        </div>
        <div class="content">
            <h2>Hello there!</h2>
            <p>Thank you for registering with NCDB Mart. We're excited to have you on board!</p>
            <p>To complete your registration and start shopping, please verify your email address by clicking the button below:</p>
            
            <a href="${verifyUrl}" class="button" target="_blank">
                Verify Email Address
            </a>
            
            <div class="warning">
                <strong>Important:</strong> This verification link will expire in 24 hours for security reasons.
            </div>
            
            <p>If the button above doesn't work, copy and paste this link into your browser:</p>
            <p class="link-backup">${verifyUrl}</p>
            
            <p>If you didn't create an account with NCDB Mart, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} NCDB Mart. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;

export const passwordResetTemplate = (resetUrl, userName = 'there') => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
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
        .button {
            display: block;
            width: 200px;
            margin: 30px auto;
            padding: 12px 24px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 25px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .link-backup {
            word-break: break-all;
            background: #eee;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>We received a request to reset your password for your NCDB Mart account.</p>
            <p>Click the button below to reset your password:</p>
            
            <a href="${resetUrl}" class="button" target="_blank">
                Reset Password
            </a>
            
            <div class="warning">
                <strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.
            </div>
            
            <p>If the button above doesn't work, copy and paste this link into your browser:</p>
            <p class="link-backup">${resetUrl}</p>
            
            <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} NCDB Mart. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;

export const welcomeEmailTemplate = (userName) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to NCDB Mart!</title>
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
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
        .feature {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #00b894;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to NCDB Mart! 🎉</h1>
        </div>
        <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
            
            <p>Get ready to explore amazing features:</p>
            
            <div class="feature">
                <strong>🛍️ Shop with Confidence</strong>
                <p>Browse through thousands of products with secure payment options.</p>
            </div>
            
            <div class="feature">
                <strong>🚚 Fast Delivery</strong>
                <p>Get your orders delivered quickly to your doorstep.</p>
            </div>

            <p>Happy shopping!<br>The NCDB Mart Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} NCDB Mart. All rights reserved.</p>
            <p>Need help? Contact our support team at support@ncdbmart.com</p>
        </div>
    </div>
</body>
</html>
`;

export const supplierCredentialsTemplate = (supplierName, email, password, loginUrl) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to NCDB Mart - Supplier Account</title>
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
        .button {
            display: block;
            width: 200px;
            margin: 30px auto;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 25px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
        .credentials {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .credential-item {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 5px;
            border-left: 4px solid #667eea;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .feature {
            background: #e7f3ff;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #1890ff;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to NCDB Mart! 🏪</h1>
            <p>Supplier Account Created</p>
        </div>
        <div class="content">
            <h2>Hello ${supplierName}!</h2>
            <p>Your supplier account has been successfully created on NCDB Mart. You can now access your supplier dashboard.</p>
            
            <div class="credentials">
                <h3 style="text-align: center; margin-top: 0;">Your Login Credentials</h3>
                <div class="credential-item">
                    <strong>Email:</strong> ${email}
                </div>
                <div class="credential-item">
                    <strong>Password:</strong> ${password}
                </div>
            </div>

            <a href="${loginUrl}" class="button" target="_blank">
                Login
            </a>

            <div class="warning">
                <strong>Important Security Notice:</strong>
                <p>• Please change your password after first login</p>
                <p>• Keep your credentials secure and do not share them</p>
                <p>• If you didn't request this account, please contact support immediately</p>
            </div>

            <p>If you have any questions or need assistance, please contact our support team.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} NCDB Mart. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;
