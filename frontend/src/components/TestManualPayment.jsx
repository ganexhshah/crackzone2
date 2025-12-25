import React, { useState } from 'react';
import ManualPaymentModal from './ManualPaymentModal';

const TestManualPayment = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('1000');

  const handleSuccess = (response) => {
    console.log('Payment success:', response);
    alert('Payment submitted successfully!');
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Test Manual Payment</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Open Manual Payment Modal
        </button>

        <ManualPaymentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          amount={amount}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
};

export default TestManualPayment;