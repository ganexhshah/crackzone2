// Debug utility to check environment variables
export const debugEnv = () => {
  console.log('=== Environment Debug ===');
  console.log('NODE_ENV:', import.meta.env.NODE_ENV);
  console.log('MODE:', import.meta.env.MODE);
  console.log('DEV:', import.meta.env.DEV);
  console.log('PROD:', import.meta.env.PROD);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('hostname:', window.location.hostname);
  console.log('All env vars:', import.meta.env);
  console.log('========================');
};

// Get the correct API URL - HARDCODED FOR PRODUCTION FIX
export const getCorrectApiUrl = () => {
  console.log('Getting API URL...');
  console.log('Current hostname:', window.location.hostname);
  
  // HARDCODE: If we're on any production domain, use production API
  if (window.location.hostname.includes('vercel.app') || 
      window.location.hostname.includes('netlify.app') ||
      !window.location.hostname.includes('localhost')) {
    console.log('Using PRODUCTION API URL');
    return 'https://crackzone2.onrender.com/api';
  }
  
  console.log('Using DEVELOPMENT API URL');
  return 'http://localhost:5000/api';
};

export const getGoogleAuthUrl = () => {
  const url = `${getCorrectApiUrl()}/auth/google`;
  console.log('Google Auth URL:', url);
  return url;
};