// Centralized API configuration
export const getApiConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  // Base URLs
  const DEVELOPMENT_API_URL = 'http://localhost:5000/api';
  const PRODUCTION_API_URL = 'https://crackzone2.onrender.com/api';
  
  // Determine the correct API URL
  let apiUrl;
  if (isProduction) {
    apiUrl = import.meta.env.VITE_API_URL || PRODUCTION_API_URL;
  } else {
    apiUrl = DEVELOPMENT_API_URL;
  }
  
  return {
    API_BASE_URL: apiUrl,
    GOOGLE_AUTH_URL: `${apiUrl}/auth/google`,
    GOOGLE_AUTH_MOBILE_URL: `${apiUrl}/auth/google/mobile`,
    isDevelopment,
    isProduction
  };
};

export const { API_BASE_URL, GOOGLE_AUTH_URL, GOOGLE_AUTH_MOBILE_URL } = getApiConfig();