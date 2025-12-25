import { Platform, StatusBar, Dimensions } from 'react-native';

export const AndroidUtils = {
  // Get status bar height for Android
  getStatusBarHeight: () => {
    return Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;
  },

  // Check if device has software navigation buttons
  hasSoftwareNavigation: () => {
    if (Platform.OS !== 'android') return false;
    
    const { height, width } = Dimensions.get('window');
    const screenHeight = Dimensions.get('screen').height;
    const screenWidth = Dimensions.get('screen').width;
    
    // If screen dimensions are different from window dimensions,
    // it likely has software navigation
    return screenHeight !== height || screenWidth !== width;
  },

  // Get navigation bar height for Android
  getNavigationBarHeight: () => {
    if (Platform.OS !== 'android') return 0;
    
    const { height } = Dimensions.get('window');
    const screenHeight = Dimensions.get('screen').height;
    
    return screenHeight - height;
  },

  // Get safe area insets for Android
  getSafeAreaInsets: () => {
    const statusBarHeight = AndroidUtils.getStatusBarHeight();
    const navigationBarHeight = AndroidUtils.getNavigationBarHeight();
    
    return {
      top: statusBarHeight,
      bottom: navigationBarHeight,
      left: 0,
      right: 0,
    };
  },

  // Check if device is in landscape mode
  isLandscape: () => {
    const { width, height } = Dimensions.get('window');
    return width > height;
  },

  // Get device density category
  getDensityCategory: () => {
    const { width } = Dimensions.get('window');
    
    if (width <= 320) return 'ldpi';      // Low density
    if (width <= 480) return 'mdpi';      // Medium density
    if (width <= 720) return 'hdpi';      // High density
    if (width <= 1080) return 'xhdpi';    // Extra high density
    if (width <= 1440) return 'xxhdpi';   // Extra extra high density
    return 'xxxhdpi';                     // Extra extra extra high density
  },

  // Get responsive multiplier based on density
  getDensityMultiplier: () => {
    const category = AndroidUtils.getDensityCategory();
    
    switch (category) {
      case 'ldpi': return 0.75;
      case 'mdpi': return 1.0;
      case 'hdpi': return 1.15;
      case 'xhdpi': return 1.3;
      case 'xxhdpi': return 1.5;
      case 'xxxhdpi': return 1.75;
      default: return 1.0;
    }
  },

  // Check if device is a tablet
  isTablet: () => {
    const { width, height } = Dimensions.get('window');
    const aspectRatio = Math.max(width, height) / Math.min(width, height);
    
    // Tablets typically have aspect ratios closer to 4:3 or 16:10
    // Phones typically have aspect ratios of 16:9 or higher
    return aspectRatio < 1.6 && Math.min(width, height) >= 600;
  },

  // Get optimal touch target size
  getTouchTargetSize: () => {
    const densityMultiplier = AndroidUtils.getDensityMultiplier();
    return Math.max(48 * densityMultiplier, 48); // Minimum 48dp as per Android guidelines
  },

  // Get optimal font scaling
  getFontScale: () => {
    const densityMultiplier = AndroidUtils.getDensityMultiplier();
    
    // Adjust font scaling based on density
    if (densityMultiplier <= 0.75) return 0.9;
    if (densityMultiplier >= 1.5) return 1.1;
    return 1.0;
  },

  // Check if device supports gesture navigation
  hasGestureNavigation: () => {
    if (Platform.OS !== 'android') return false;
    
    // This is a heuristic - devices with very small navigation bar heights
    // likely use gesture navigation
    const navBarHeight = AndroidUtils.getNavigationBarHeight();
    return navBarHeight > 0 && navBarHeight < 48;
  },

  // Get optimal spacing for Android
  getOptimalSpacing: (baseSpacing) => {
    const densityMultiplier = AndroidUtils.getDensityMultiplier();
    const isTablet = AndroidUtils.isTablet();
    
    let spacing = baseSpacing * densityMultiplier;
    
    // Increase spacing on tablets
    if (isTablet) {
      spacing *= 1.2;
    }
    
    return Math.round(spacing);
  },

  // Get optimal border radius for Android
  getOptimalBorderRadius: (baseBorderRadius) => {
    const densityMultiplier = AndroidUtils.getDensityMultiplier();
    return Math.round(baseBorderRadius * densityMultiplier);
  },
};