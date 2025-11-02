import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import { testConnection } from './config/db.js';
import { setupDatabase } from './db/init-db.js';

// Routes
import userRoutes from './routes/userRoutes.js';
import supplierRoute from './routes/supplierRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import categoryRoute from './routes/categoryRoutes.js';
import productRoute from './routes/productRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import supplierItemRoutes from './routes/supplierItemRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import addressRoutes from './routes/AddressRoutes.js';
import shippingCostRoutes from './routes/shippingCostRoutes.js';
import wishListRoutes from './routes/wishListRoutes.js';
import supplierItemsRequestRoutes from './routes/supplierItemsRequestRoutes.js';
import testRoute from './routes/testRoute.js';

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

const allowedOrigins = [
    'http://localhost:3000',
    'https://ncdb-mart.vercel.app',
    'https://trains-production.up.railway.app'
];

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Additional CORS headers
app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    next();
});

// Health check route (no DB dependency)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test server route (no DB dependency)
app.get('/api/test-server', (req, res) => {
    res.json({
        message: 'Server is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        origin: req.headers.origin
    });
});

// Database-dependent routes
const initializeApp = async () => {
    try {
        // Test database connection
        console.log('Testing database connection...');
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.warn('Starting server without database connection');
            console.log('Some features may not work until database is available');
        } else {
            // Setup database if connected
            if (process.env.NODE_ENV === 'production') {
                try {
                    await setupDatabase();
                    console.log('Production database setup completed');
                } catch (setupError) {
                    console.error('Database setup failed:', setupError.message);
                    console.log('Continuing without database setup...');
                }
            }
        }

        // Mount routes (they should handle DB errors gracefully)
        app.use('/api/users', userRoutes);
        app.use('/api/roles', roleRoutes);
        app.use('/api/suppliers', supplierRoute);
        app.use('/api/categories', categoryRoute);
        app.use('/api/products', productRoute);
        app.use('/api/upload', uploadRoutes);
        app.use('/api/supplier-items', supplierItemRoutes);
        app.use('/api/carts', cartRoutes);
        app.use('/api/orders', orderRoutes);
        app.use('/api/shipping-addresses', addressRoutes);
        app.use('/api/shipping-costs', shippingCostRoutes);
        app.use('/api/wishlist', wishListRoutes);
        app.use('/api/supplier-item-requests', supplierItemsRequestRoutes);
        app.use('/api/test', testRoute);

        // Root route
        app.get('/', (req, res) => {
            res.send(`
                <html>
                    <head>
                        <title>NCDB Mart Server</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 40px; }
                            .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
                            .success { background: #d4edda; color: #155724; }
                            .warning { background: #fff3cd; color: #856404; }
                            .error { background: #f8d7da; color: #721c24; }
                        </style>
                    </head>
                    <body>
                        <h1>NCDB Mart Server</h1>
                        <div class="status success">Server is running on port ${port}</div>
                        <div class="status ${dbConnected ? 'success' : 'warning'}">
                            Database: ${dbConnected ? 'Connected' : 'Disconnected'}
                        </div>
                        <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
                        <p>Check <a href="/health">/health</a> for server status</p>
                        <p>Check <a href="/api/test-server">/api/test-server</a> for API test</p>
                    </body>
                </html>
            `);
        });

        // Error handling middleware
        app.use(notFound);
        app.use(errorHandler);

        // Start server
        app.listen(port, '0.0.0.0', () => {
            console.log(`
    Server started successfully!
    Port: ${port}
    Environment: ${process.env.NODE_ENV || 'development'}
    Database: ${dbConnected ? 'Connected' : 'Disconnected'}
    Allowed origins: ${allowedOrigins.join(', ')}
            `);
        });

    } catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    }
};

// Start the application
initializeApp();