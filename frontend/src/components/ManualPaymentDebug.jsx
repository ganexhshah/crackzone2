import React, { useState } from 'react';
import { walletAPI } from '../services/api';

const ManualPaymentDebug = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:5000/api/test/test-auth', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const data = await response.json();
      setResults(prev => ({ ...prev, auth: { success: response.ok, data, status: response.status } }));
    } catch (error) {
      setResults(prev => ({ ...prev, auth: { success: false, error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  const testPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getManualPaymentMethods();
      setResults(prev => ({ ...prev, methods: { success: true, data: response.data } }));
    } catch (error) {
      setResults(prev => ({ ...prev, methods: { success: false, error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  const testUpload = async () => {
    try {
      setLoading(true);
      
      // Create a simple test image
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(0, 0, 100, 100);
      
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('screenshot', blob, 'test.png');
        
        const authToken = localStorage.getItem('authToken');
        
        const response = await fetch('http://localhost:5000/api/uploads/payment-screenshot', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: formData
        });
        
        const data = await response.json();
        setResults(prev => ({ ...prev, upload: { success: response.ok, data, status: response.status } }));
        setLoading(false);
      });
    } catch (error) {
      setResults(prev => ({ ...prev, upload: { success: false, error: error.message } }));
      setLoading(false);
    }
  };

  const testManualPayment = async () => {
    try {
      setLoading(true);
      
      const response = await walletAPI.submitManualPayment({
        paymentMethodId: 1,
        amount: 100,
        screenshotUrl: 'https://example.com/test.jpg',
        transactionReference: 'TEST123'
      });
      
      setResults(prev => ({ ...prev, payment: { success: true, data: response } }));
    } catch (error) {
      setResults(prev => ({ ...prev, payment: { success: false, error: error.message, response: error.response?.data } }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Manual Payment Debug</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Authentication Info</h3>
          <div className="text-sm space-y-1">
            <div>Auth Token: {localStorage.getItem('authToken') ? '✅ Present' : '❌ Missing'}</div>
            <div>User: {localStorage.getItem('user') ? '✅ Present' : '❌ Missing'}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={testAuth}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Auth
          </button>
          
          <button 
            onClick={testPaymentMethods}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test Payment Methods
          </button>
          
          <button 
            onClick={testUpload}
            disabled={loading}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            Test Upload
          </button>
          
          <button 
            onClick={testManualPayment}
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            Test Manual Payment
          </button>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Test Results</h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ManualPaymentDebug;