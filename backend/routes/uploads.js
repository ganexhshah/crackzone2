const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { upload, cloudinary } = require('../config/cloudinary');
const { authenticateToken } = require('../middleware/auth');

// Admin token verification middleware (consistent with admin.js)
const verifyAdminToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Upload payment screenshot
router.post('/payment-screenshot', authenticateToken, upload.single('screenshot'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      success: true,
      url: req.file.path,
      public_id: req.file.filename,
      message: 'Screenshot uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload screenshot' });
  }
});

// Upload QR code for payment methods (Admin only)
router.post('/qr-code', verifyAdminToken, upload.single('qrCode'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      success: true,
      url: req.file.path,
      public_id: req.file.filename,
      message: 'QR code uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload QR code' });
  }
});

// Delete image from Cloudinary
router.delete('/image/:publicId', authenticateToken, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({ success: true, message: 'Image deleted successfully' });
    } else {
      res.status(400).json({ error: 'Failed to delete image' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;