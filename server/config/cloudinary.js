import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME || 'dkpfn87t4',
    api_key: process.env.CLOUDINARY_API_KEY || '577268929389942',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'Ehmu70oDD2sDhaE6ZtnRWeHfXFM',
    secure: true
});

export default cloudinary;