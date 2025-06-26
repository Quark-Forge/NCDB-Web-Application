import express from 'express';
import dotenv from 'dotenv';
import sequelize from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.get('/', (req, res) => res.send('server is ready'));

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`server is listining on port ${port}`));