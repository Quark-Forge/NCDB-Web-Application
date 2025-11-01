import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
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

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://ncdb-mart.vercel.app',
        'https://trains-production.up.railway.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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