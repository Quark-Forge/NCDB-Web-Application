import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import database connection
import './config/db.js';

// Import production setup
import { setupDatabase } from './db/init-db.js';

// Your routes imports...
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

// Use Railway's PORT environment variable
const port = process.env.PORT || 8080;
const app = express();

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://ncdb-mart.vercel.app',
        'https://trains-production.up.railway.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log(`   Origin: ${req.headers.origin}`);
    next();
});

// Run production database setup (async but don't block server start)
if (process.env.NODE_ENV === 'production') {
    setupDatabase().then(() => {
        console.log('Production database setup completed');
    }).catch(error => {
        console.error('Production database setup failed:', error);
    });
}

// Your routes
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

// Test route - add this to verify server is working
app.get('/api/test-server', (req, res) => {
    res.json({ 
        message: 'Server is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: port
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => res.send('server is ready'));

app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is listening on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`Backend URL: ${process.env.BACKEND_URL}`);
    console.log(`Database: ${process.env.NODE_ENV === 'production' ? 'Railway MySQL' : 'Local MySQL'}`);
});