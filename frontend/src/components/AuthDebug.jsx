import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug = () => {
  const { user, isAuthenticated } = useAuth();
  
  const authToken = localStorage.getItem('authToken');
  const userFromStorage = localStorage.getItem('user');

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <div className="space-y-1">
        <div>
          <strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>User from Context:</strong> {user ? user.username || user.email : 'None'}
        </div>
        <div>
          <strong>Auth Token:</strong> {authToken ? `${authToken.substring(0, 20)}...` : 'None'}
        </div>
        <div>
          <strong>User from Storage:</strong> {userFromStorage ? 'Present' : 'None'}
        </div>
        <div>
          <strong>Token Length:</strong> {authToken ? authToken.length : 0}
        </div>
      </div>
      <button 
        onClick={() => {
          console.log('Auth Debug Info:');
          console.log('- isAuthenticated:', isAuthenticated);
          console.log('- user:', user);
          console.log('- authToken:', authToken);
          console.log('- userFromStorage:', userFromStorage);
        }}
        className="mt-2 bg-blue-500 px-2 py-1 rounded text-xs"
      >
        Log to Console
      </button>
    </div>
  );
};

export default AuthDebug;