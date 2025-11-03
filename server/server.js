import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import './config/db.js';
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

const port = process.env.PORT || 8080;
const app = express();

const allowedOrigins = [
    "http://localhost:3000",
    "https://ncdb-mart.vercel.app",
    "https://trains-production.up.railway.app",
];

// Define clean CORS options
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
};

// Apply CORS globally
app.use(cors(corsOptions));

// Handle preflight automatically
app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
        res.sendStatus(200);
    } else {
        next();
    }
});

// Core middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});

// Initialize DB if production
if (process.env.NODE_ENV === 'production') {
    setupDatabase()
        .then(() => console.log('Production DB setup complete'))
        .catch((err) => console.error('Production DB setup failed:', err));
}

// Routes
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

// Test route
app.get('/api/test-server', (req, res) => {
    res.json({
        message: 'Server is working from Railway!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        origin: req.headers.origin,
    });
});

app.get('/', (req, res) => res.send('Server is ready 🚀'));

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Allowed origins:`, allowedOrigins);
});
