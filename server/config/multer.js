import multer from 'multer';

// Use memory storage (no local files)
const memoryStorage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Check file type
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        if (file.size > maxSize) {
            return cb(new Error('File size must be less than 5MB'), false);
        }
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Create upload instances with memory storage
export const productUpload = multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export const profileUpload = multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export default {
    productUpload,
    profileUpload
};