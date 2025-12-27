const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for payments
const paymentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'crackzone/payments',
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' },
      { quality: 'auto' }
    ]
  },
});

// Configure Cloudinary storage for profile pictures
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'crackzone/profiles',
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Square crop focused on face
      { quality: 'auto' }
    ]
  },
});

// Configure multer with Cloudinary storage for payments
const uploadPayment = multer({ 
  storage: paymentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Configure multer with Cloudinary storage for profile pictures
const uploadProfile = multer({ 
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

module.exports = {
  cloudinary,
  upload: uploadPayment, // Keep backward compatibility
  uploadPayment,
  uploadProfile
};