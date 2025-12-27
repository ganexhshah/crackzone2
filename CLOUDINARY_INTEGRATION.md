# Cloudinary Integration for Manual Payments

This document explains the Cloudinary integration for handling payment QR codes and payment screenshots in the CrackZone platform.

## Setup

### Environment Variables
The following environment variables have been added to `backend/.env`:

```env
# Cloudinary Configuration
CLOUDINARY_URL=cloudinary://599248742338215:JhcB8hQy4eg196gPY27n6lAjoIM@do67kredn
CLOUDINARY_CLOUD_NAME=do67kredn
CLOUDINARY_API_KEY=599248742338215
CLOUDINARY_API_SECRET=JhcB8hQy4eg196gPY27n6lAjoIM
```

### Dependencies
The following packages have been installed:
- `cloudinary` - Cloudinary SDK for Node.js
- `multer` - Middleware for handling multipart/form-data
- `multer-storage-cloudinary` - Cloudinary storage engine for multer

## Features

### 1. Payment Screenshot Upload
**Endpoint:** `POST /api/uploads/payment-screenshot`
- **Authentication:** Required (user token)
- **File field:** `screenshot`
- **File limits:** 5MB max, images only
- **Storage:** `crackzone/payments` folder in Cloudinary
- **Auto-optimization:** Images are resized to max 1000x1000px with auto quality

### 2. QR Code Upload (Admin Only)
**Endpoint:** `POST /api/uploads/qr-code`
- **Authentication:** Required (admin token)
- **File field:** `qrCode`
- **File limits:** 5MB max, images only
- **Storage:** `crackzone/payments` folder in Cloudinary

### 3. Image Deletion
**Endpoint:** `DELETE /api/uploads/image/:publicId`
- **Authentication:** Required (user token)
- **Purpose:** Delete images from Cloudinary using public_id

## Frontend Integration

### Manual Payment Modal
The `ManualPaymentModal` component now uploads screenshots directly to Cloudinary:
- Users can upload payment screenshots
- Images are automatically uploaded to Cloudinary
- Cloudinary URLs are stored in the database

### Admin Payment Method Settings
The `PaymentMethodSettings` component allows admins to:
- Upload QR codes for payment methods
- Images are stored in Cloudinary
- QR codes are displayed to users during payment

## File Structure

```
backend/
├── config/
│   └── cloudinary.js          # Cloudinary configuration
├── routes/
│   └── uploads.js             # Upload routes
└── test-cloudinary.js         # Connection test script

frontend/
├── src/
│   ├── components/
│   │   ├── ManualPaymentModal.jsx    # Updated with Cloudinary upload
│   │   └── TestImageUpload.jsx       # Test component
│   └── admin/
│       └── PaymentMethodSettings.jsx # Updated with QR upload
```

## Testing

### Backend Test
Run the Cloudinary connection test:
```bash
cd backend
node test-cloudinary.js
```

### Frontend Test
Use the `TestImageUpload` component to verify upload functionality.

## Security Features

1. **File Type Validation:** Only image files are accepted
2. **File Size Limits:** 5MB maximum file size
3. **Authentication:** All uploads require valid tokens
4. **Folder Organization:** Files are organized in `crackzone/payments` folder
5. **Auto-optimization:** Images are automatically optimized for web

## Usage Flow

### For Users (Payment Screenshots):
1. User selects manual payment method
2. User makes payment via QR code or account details
3. User uploads payment screenshot
4. Screenshot is uploaded to Cloudinary
5. Cloudinary URL is stored with payment request
6. Admin can view screenshot during verification

### For Admins (QR Codes):
1. Admin goes to Payment Method Settings
2. Admin clicks "Edit" on a payment method
3. Admin uploads QR code image
4. QR code is uploaded to Cloudinary
5. Cloudinary URL is stored in payment method
6. Users see QR code during payment process

## Error Handling

- File size validation (5MB limit)
- File type validation (images only)
- Network error handling
- Authentication error handling
- Cloudinary API error handling

## Benefits

1. **Scalability:** Cloudinary handles image storage and optimization
2. **Performance:** Images are served from Cloudinary's CDN
3. **Reliability:** Professional image hosting service
4. **Optimization:** Automatic image compression and format optimization
5. **Security:** Secure image storage with access controls