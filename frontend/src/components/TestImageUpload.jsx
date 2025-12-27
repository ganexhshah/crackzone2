import React, { useState } from 'react';
import { Upload, Check, X, Loader } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const TestImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('screenshot', file);

      const response = await fetch(`${API_BASE_URL}/uploads/payment-screenshot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadedUrl(data.url);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Test Cloudinary Upload</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {uploadedUrl ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            <span>Upload successful!</span>
          </div>
          <img 
            src={uploadedUrl} 
            alt="Uploaded" 
            className="w-full h-48 object-cover rounded border"
          />
          <div className="text-sm text-gray-600 break-all">
            URL: {uploadedUrl}
          </div>
          <button
            onClick={() => {
              setUploadedUrl('');
              setError('');
            }}
            className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
          >
            Upload Another
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="w-6 h-6 animate-spin text-blue-500" />
                <span>Uploading...</span>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Click to upload image</p>
                <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TestImageUpload;