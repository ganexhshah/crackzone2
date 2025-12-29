// Centralized API configuration
import { getCorrectApiUrl } from '../utils/debug';

export const getApiConfig = () => {
  const apiUrl = getCorrectApiUrl();
  
  return {
    API_BASE_URL: apiUrl,
    GOOGLE_AUTH_URL: `${apiUrl}/auth/google`,
    GOOGLE_AUTH_MOBILE_URL: `${apiUrl}/auth/google/mobile`,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD
  };
};

export const { API_BASE_URL, GOOGLE_AUTH_URL, GOOGLE_AUTH_MOBILE_URL } = getApiConfig();