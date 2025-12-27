import React, { useState, useEffect } from 'react';
import { X, Upload, Check, AlertCircle, Loader, QrCode, CreditCard, Building2 } from 'lucide-react';
import { walletAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5000/api';

const ManualPaymentModal = ({ isOpen, onClose, amount, onSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState(1); // 1: Select method, 2: Show QR/Details, 3: Upload screenshot
  const [manualMethods, setManualMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchManualMethods();
    }
  }, [isOpen]);

  const fetchManualMethods = async () => {
    try {
      console.log('Fetching manual payment methods...');
      const response = await walletAPI.getManualPaymentMethods();
      console.log('Manual methods response:', response);
      console.log('Response data:', response.data);
      console.log('Methods array:', response.data?.methods);
      
      // Handle axios response structure - response.data contains the actual data
      const methods = response.data?.methods || response.methods || [];
      console.log('Setting methods:', methods);
      
      // Debug each method's QR code
      methods.forEach(method => {
        console.log(`Method ${method.name}:`, {
          id: method.id,
          displayName: method.displayName,
          hasQR: !!method.qrCodeUrl,
          qrUrl: method.qrCodeUrl
        });
      });
      
      setManualMethods(methods);
    } catch (err) {
      console.error('Error fetching manual methods:', err);
      setError('Failed to load payment methods');
    }
  };

  const handleMethodSelect = (method) => {
    console.log('Selected method:', method);
    setSelectedMethod(method);
    setStep(2);
  };

  const handleScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setScreenshot(file);
      const reader = new FileReader();
      reader.onload = (e) => setScreenshotPreview(e.target.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const uploadScreenshot = async (file) => {
    try {
      console.log('Starting screenshot upload...', file.name, file.size);
      
      const formData = new FormData();
      formData.append('screenshot', file);

      const authToken = localStorage.getItem('authToken');
      console.log('Auth token available:', !!authToken);
      console.log('Auth token length:', authToken?.length);

      const response = await fetch(`${API_BASE_URL}/uploads/payment-screenshot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      console.log('Upload response status:', response.status);
      console.log('Upload response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload screenshot: ' + error.message);
    }
  };

  const handleSubmit = async () => {
    if (!screenshot) {
      setError('Please upload a payment screenshot');
      return;
    }

    if (!isAuthenticated) {
      setError('Please login to submit payment');
      return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('Authentication token missing. Please login again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Starting manual payment submission...');
      console.log('User authenticated:', isAuthenticated);
      console.log('User:', user);
      console.log('Selected method:', selectedMethod);
      console.log('Amount:', amount);
      console.log('Transaction ref:', transactionRef);
      
      // Upload screenshot
      console.log('Uploading screenshot...');
      const screenshotUrl = await uploadScreenshot(screenshot);
      console.log('Screenshot uploaded successfully:', screenshotUrl);

      // Submit manual payment request
      console.log('Submitting payment request...');
      const paymentData = {
        paymentMethodId: selectedMethod.id,
        amount: parseFloat(amount),
        screenshotUrl,
        transactionReference: transactionRef
      };
      console.log('Payment data:', paymentData);
      
      const response = await walletAPI.submitManualPayment(paymentData);
      console.log('Payment submission successful:', response);
      console.log('Response data:', response.data);

      // Show success message
      const transactionId = response.data?.paymentRequest?.transactionId || response.paymentRequest?.transactionId || 'N/A';
      alert(`✅ Payment submitted successfully!\n\nAmount: ₹${amount}\nTransaction ID: ${transactionId}\n\nYou'll receive a notification once the payment is verified by admin (usually within 24 hours).`);
      
      onSuccess(response.data || response);
      onClose();
      resetModal();
    } catch (err) {
      console.error('Manual payment submission error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Failed to submit payment';
      
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.error || 'Invalid payment data';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedMethod(null);
    setScreenshot(null);
    setScreenshotPreview('');
    setTransactionRef('');
    setError('');
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  const getMethodIcon = (methodName) => {
    switch (methodName) {
      case 'esewa':
      case 'khalti':
        return QrCode;
      case 'bank':
        return Building2;
      default:
        return CreditCard;
    }
  };

  if (!isOpen) return null;

  // Show login message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-crackzone-gray/95 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 w-full max-w-md">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-crackzone-yellow mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
            <p className="text-gray-300 mb-6">Please login to submit manual payments</p>
            <button
              onClick={onClose}
              className="bg-crackzone-yellow text-crackzone-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-crackzone-gray/95 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Manual Payment</h2>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Step 1: Select Payment Method */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-gray-300 mb-2">Amount to Add</p>
              <p className="text-3xl font-bold text-crackzone-yellow">₹{amount}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-300 mb-3">Select Payment Method</p>
              <div className="space-y-2">
                {(manualMethods || []).length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">No payment methods available</p>
                    <p className="text-sm text-gray-500">Please contact support</p>
                  </div>
                ) : (
                  (manualMethods || []).map(method => {
                    const Icon = getMethodIcon(method.name);
                    return (
                      <button
                        key={method.id}
                        onClick={() => handleMethodSelect(method)}
                        className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-600 hover:border-crackzone-yellow/50 transition-colors text-left"
                      >
                        <Icon className="w-6 h-6 text-crackzone-yellow" />
                        <div>
                          <p className="text-white font-medium">{method.displayName}</p>
                          <p className="text-xs text-gray-400">
                            {method.name === 'bank' ? 'Bank Transfer' : 'Digital Wallet'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Show QR Code or Account Details */}
        {step === 2 && selectedMethod && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-gray-300 mb-2">Pay ₹{amount} to</p>
              <p className="text-xl font-bold text-crackzone-yellow">{selectedMethod.displayName}</p>
            </div>

            {/* Debug log */}
            {console.log('🔍 Selected method for QR display:', selectedMethod)}

            {selectedMethod.qrCodeUrl ? (
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <img 
                    src={selectedMethod.qrCodeUrl} 
                    alt={`${selectedMethod.displayName} QR Code`}
                    className="w-48 h-48 object-contain"
                    onLoad={() => console.log('✅ QR code loaded successfully:', selectedMethod.qrCodeUrl)}
                    onError={(e) => {
                      console.error('❌ QR code failed to load:', selectedMethod.qrCodeUrl, e);
                    }}
                  />
                </div>
                <p className="text-sm text-gray-400">Scan this QR code to make payment</p>
              </div>
            ) : (
              <div className="bg-crackzone-black/30 border border-gray-600 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-300 mb-2">Account Details</p>
                {selectedMethod.accountDetails && Object.entries(selectedMethod.accountDetails).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1">
                    <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-crackzone-yellow/10 border border-crackzone-yellow/30 rounded-lg p-4">
              <p className="text-sm text-crackzone-yellow font-medium mb-2">Instructions:</p>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Make payment of exactly ₹{amount}</li>
                <li>• Take a screenshot of the successful transaction</li>
                <li>• Upload the screenshot in the next step</li>
                <li>• Your wallet will be credited after admin verification</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-crackzone-yellow text-crackzone-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Upload Screenshot */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-gray-300 mb-2">Upload Payment Screenshot</p>
              <p className="text-lg font-bold text-crackzone-yellow">₹{amount} to {selectedMethod?.displayName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Transaction Reference (Optional)
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="Enter transaction ID or reference number"
                className="w-full px-3 py-2 bg-crackzone-black/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-crackzone-yellow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Screenshot *
              </label>
              <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-crackzone-yellow/50 transition-colors">
                {screenshotPreview ? (
                  <div className="space-y-3">
                    <img 
                      src={screenshotPreview} 
                      alt="Payment screenshot" 
                      className="max-w-full h-32 object-contain mx-auto rounded"
                    />
                    <p className="text-sm text-green-400 flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      Screenshot uploaded
                    </p>
                    <button
                      onClick={() => {
                        setScreenshot(null);
                        setScreenshotPreview('');
                      }}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      Change screenshot
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 mb-2">Click to upload screenshot</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-gray-600/20 rounded-lg p-4">
              <p className="text-xs text-gray-400">
                • Make sure the screenshot clearly shows the payment amount and transaction details<br/>
                • Verification usually takes 2-24 hours<br/>
                • You'll receive a notification once verified
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!screenshot || loading}
                className="flex-1 bg-crackzone-yellow text-crackzone-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
                Submit Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualPaymentModal;