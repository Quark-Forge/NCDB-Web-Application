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
import supplierItemRoutes from './routes/supplierItemRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

app.use('./uploads', express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/suppliers', supplierRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/products', productRoute);
app.use('/api/supplier-items', supplierItemRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/inventory', inventoryRoutes);


app.get('/', (req, res) => res.send('server is ready'));

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`server is listining on port ${port}`));