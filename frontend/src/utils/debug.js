// Debug utility to check environment variables
export const debugEnv = () => {
  console.log('=== Environment Debug ===');
  console.log('NODE_ENV:', import.meta.env.NODE_ENV);
  console.log('MODE:', import.meta.env.MODE);
  console.log('DEV:', import.meta.env.DEV);
  console.log('PROD:', import.meta.env.PROD);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('All env vars:', import.meta.env);
  console.log('========================');
};

// Get the correct API URL
export const getCorrectApiUrl = () => {
  // Force production URL if we're on Vercel
  if (window.location.hostname.includes('vercel.app')) {
    return 'https://crackzone2.onrender.com/api';
  }
  
  // Check if we're in production mode
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://crackzone2.onrender.com/api';
  }
  
  // Development
  return 'http://localhost:5000/api';
};

export const getGoogleAuthUrl = () => {
  return `${getCorrectApiUrl()}/auth/google`;
};