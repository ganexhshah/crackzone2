import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthFromGoogle } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const profileComplete = searchParams.get('profileComplete') === 'true';
      const error = searchParams.get('error');

      if (error) {
        navigate('/login?error=Google authentication failed');
        return;
      }

      if (token) {
        // Set auth token and user data
        await setAuthFromGoogle(token);
        
        // Redirect based on profile completion status
        if (profileComplete) {
          navigate('/dashboard');
        } else {
          navigate('/complete-profile');
        }
      } else {
        navigate('/login?error=Authentication failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuthFromGoogle]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crackzone-yellow mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing authentication...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;