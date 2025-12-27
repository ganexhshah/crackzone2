import React, { useState, useEffect } from 'react';
import { walletAPI } from '../services/api';

const TestQRDisplay = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getManualPaymentMethods();
      console.log('API Response:', response);
      setMethods(response.data?.methods || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">QR Code Display Test</h2>
      
      <div className="grid gap-6">
        {methods.map(method => (
          <div key={method.id} className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">{method.displayName}</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* QR Code Section */}
              <div>
                <h4 className="font-medium mb-2">QR Code:</h4>
                {method.qrCodeUrl ? (
                  <div className="space-y-2">
                    <div className="bg-white p-4 rounded border inline-block">
                      <img 
                        src={method.qrCodeUrl} 
                        alt={`${method.displayName} QR Code`}
                        className="w-48 h-48 object-contain"
                        onLoad={() => console.log(`✅ QR loaded for ${method.name}`)}
                        onError={(e) => {
                          console.error(`❌ QR failed to load for ${method.name}:`, e);
                          e.target.style.border = '2px solid red';
                        }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 break-all">
                      <strong>URL:</strong> {method.qrCodeUrl}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No QR code available</div>
                )}
              </div>
              
              {/* Account Details Section */}
              <div>
                <h4 className="font-medium mb-2">Account Details:</h4>
                {method.accountDetails ? (
                  <div className="space-y-1">
                    {Object.entries(method.accountDetails).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No account details</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={fetchMethods}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh Data
      </button>
    </div>
  );
};

export default TestQRDisplay;