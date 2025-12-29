// Simple, direct URL configuration
const PRODUCTION_API_URL = 'https://crackzone2.onrender.com/api';
const DEVELOPMENT_API_URL = 'http://localhost:5000/api';

// Simple check: if hostname is localhost, use dev, otherwise use prod
export const getApiUrl = () => {
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  const url = isLocalhost ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;
  console.log(`🔗 API URL: ${url} (hostname: ${window.location.hostname})`);
  return url;
};

export const getGoogleOAuthUrl = () => {
  const url = `${getApiUrl()}/auth/google`;
  console.log(`🔗 Google OAuth URL: ${url}`);
  return url;
};