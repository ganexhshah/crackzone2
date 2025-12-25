import { Dimensions, Platform, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');
const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

// Device categorization for better Android support
const getDeviceCategory = () => {
  if (width < 320) return 'extraSmall';
  if (width < 375) return 'small';
  if (width < 414) return 'medium';
  if (width < 480) return 'large';
  if (width < 768) return 'extraLarge';
  if (width < 1024) return 'tablet';
  return 'largeTablet';
};

const deviceCategory = getDeviceCategory();

// Responsive multipliers based on device category
const getMultiplier = () => {
  switch (deviceCategory) {
    case 'extraSmall': return 0.7;
    case 'small': return 0.8;
    case 'medium': return 1.0;
    case 'large': return 1.1;
    case 'extraLarge': return 1.15;
    case 'tablet': return 1.3;
    case 'largeTablet': return 1.5;
    default: return 1.0;
  }
};

const multiplier = getMultiplier();

export const Layout = {
  window: {
    width,
    height,
  },
  
  // Device information
  deviceCategory,
  statusBarHeight,
  multiplier,
  
  // Device type detection
  isExtraSmallDevice: deviceCategory === 'extraSmall',
  isSmallDevice: deviceCategory === 'small',
  isMediumDevice: deviceCategory === 'medium',
  isLargeDevice: deviceCategory === 'large',
  isExtraLargeDevice: deviceCategory === 'extraLarge',
  isTablet: deviceCategory === 'tablet',
  isLargeTablet: deviceCategory === 'largeTablet',
  
  // Platform detection
  isAndroid: Platform.OS === 'android',
  isIOS: Platform.OS === 'ios',
  
  // Responsive spacing based on device category
  spacing: {
    xs: Math.round(4 * multiplier),
    sm: Math.round(8 * multiplier),
    md: Math.round(16 * multiplier),
    lg: Math.round(24 * multiplier),
    xl: Math.round(32 * multiplier),
    xxl: Math.round(40 * multiplier),
  },
  
  // Responsive border radius
  borderRadius: {
    xs: Math.round(4 * multiplier),
    sm: Math.round(8 * multiplier),
    md: Math.round(12 * multiplier),
    lg: Math.round(16 * multiplier),
    xl: Math.round(24 * multiplier),
  },
  
  // Responsive font sizes
  fontSize: {
    xs: Math.round(12 * multiplier),
    sm: Math.round(14 * multiplier),
    md: Math.round(16 * multiplier),
    lg: Math.round(18 * multiplier),
    xl: Math.round(20 * multiplier),
    xxl: Math.round(24 * multiplier),
    xxxl: Math.round(28 * multiplier),
  },
  
  // Safe area padding with Android considerations
  safeArea: {
    top: Platform.OS === 'android' ? statusBarHeight : 44,
    bottom: Platform.OS === 'android' ? Math.round(16 * multiplier) : 34,
    left: 0,
    right: 0,
  },
  
  // Component heights
  heights: {
    button: Math.round((deviceCategory === 'extraSmall' ? 40 : deviceCategory === 'small' ? 44 : 48) * multiplier),
    input: Math.round((deviceCategory === 'extraSmall' ? 36 : deviceCategory === 'small' ? 40 : 44) * multiplier),
    tabBar: Math.round((deviceCategory === 'extraSmall' ? 65 : deviceCategory === 'small' ? 70 : 75) * multiplier),
    header: Math.round(56 * multiplier),
  },
  
  // Icon sizes
  iconSizes: {
    xs: Math.round(16 * multiplier),
    sm: Math.round(20 * multiplier),
    md: Math.round(24 * multiplier),
    lg: Math.round(28 * multiplier),
    xl: Math.round(32 * multiplier),
  },
  
  // Container padding
  containerPadding: Math.round(16 * multiplier),
  
  // Minimum touch target size (Android accessibility guidelines)
  minTouchTarget: 48,
  
  // Screen breakpoints
  breakpoints: {
    extraSmall: 320,
    small: 375,
    medium: 414,
    large: 480,
    extraLarge: 768,
    tablet: 1024,
  },
};