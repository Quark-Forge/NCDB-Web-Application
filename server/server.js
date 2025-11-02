import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import { setupDatabase } from './db/init-db.js';

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
import wishListRoutes from './routes/wishListRoutes.js'
import supplierItemsRequestRoutes from './routes/supplierItemsRequestRoutes.js';
import testRoute from './routes/testRoute.js';

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

// Parse allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'];

const corsMethods = process.env.CORS_METHODS
    ? process.env.CORS_METHODS.split(',')
    : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

const corsHeaders = process.env.CORS_ALLOWED_HEADERS
    ? process.env.CORS_ALLOWED_HEADERS.split(',')
    : ['Content-Type', 'Authorization', 'X-Requested-With'];

// CORS configuration using environment variables
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
    methods: corsMethods,
    allowedHeaders: corsHeaders,
    credentials: process.env.CORS_CREDENTIALS === 'true',
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ADD THIS - Run production database setup before routes
if (process.env.NODE_ENV === 'production') {
    setupDatabase().then(() => {
        console.log('Production database setup completed');
    }).catch(error => {
        console.error('Production database setup failed:', error);
    });
}

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

app.get('/', (req, res) => res.send('server is ready'));

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`server is listining on port ${port}`));