import React, { useState, useEffect } from 'react';
import { Upload, Save, Eye, EyeOff, Loader, Check, X } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { adminAPI } from '../services/adminAPI';

const PaymentMethodSettings = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [qrPreview, setQrPreview] = useState('');

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getManualPaymentMethods();
      setMethods(response.methods);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQrUpload = (e, methodId) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('File size must be less than 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setMethods(methods.map(method => 
          method.id === methodId 
            ? { ...method, qrCodeUrl: base64 }
            : method
        ));
        setQrPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMethod = async (method) => {
    try {
      setSaving(true);
      await adminAPI.updateManualPaymentMethod(method.id, {
        displayName: method.displayName,
        qrCodeUrl: method.qrCodeUrl,
        accountDetails: method.accountDetails,
        isActive: method.isActive
      });
      
      setEditingMethod(null);
      alert('Payment method updated successfully!');
    } catch (error) {
      console.error('Failed to update payment method:', error);
      alert('Failed to update payment method');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (methodId, field, value) => {
    setMethods(methods.map(method => 
      method.id === methodId 
        ? { ...method, [field]: value }
        : method
    ));
  };

  const handleAccountDetailChange = (methodId, key, value) => {
    setMethods(methods.map(method => 
      method.id === methodId 
        ? { 
            ...method, 
            accountDetails: { 
              ...method.accountDetails, 
              [key]: value 
            }
          }
        : method
    ));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Method Settings</h1>
          <p className="text-gray-600">Configure QR codes and account details for manual payments</p>
        </div>

        <div className="space-y-6">
          {methods.map((method) => (
            <div key={method.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">{method.displayName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    method.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {method.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFieldChange(method.id, 'isActive', !method.isActive)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      method.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {method.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => setEditingMethod(editingMethod === method.id ? null : method.id)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200"
                  >
                    {editingMethod === method.id ? 'Cancel' : 'Edit'}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* QR Code Section */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">QR Code</h4>
                  <div className="space-y-3">
                    {method.qrCodeUrl ? (
                      <div className="relative">
                        <img
                          src={method.qrCodeUrl}
                          alt={`${method.displayName} QR Code`}
                          className="w-48 h-48 object-contain border border-gray-200 rounded-lg"
                        />
                        {editingMethod === method.id && (
                          <button
                            onClick={() => handleFieldChange(method.id, 'qrCodeUrl', null)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No QR code uploaded</p>
                        </div>
                      </div>
                    )}
                    
                    {editingMethod === method.id && (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleQrUpload(e, method.id)}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Details Section */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Account Details</h4>
                  <div className="space-y-3">
                    {method.accountDetails && Object.entries(method.accountDetails).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        {editingMethod === method.id ? (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleAccountDetailChange(method.id, key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                            {value}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {editingMethod === method.id && (
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setEditingMethod(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveMethod(method)}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload QR codes for eSewa and Khalti payment methods</li>
            <li>• Update account details for bank transfers</li>
            <li>• Disable payment methods that are temporarily unavailable</li>
            <li>• QR codes should be clear and scannable</li>
            <li>• Test payment methods before enabling them</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PaymentMethodSettings;