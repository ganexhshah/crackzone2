import { useState, useEffect } from 'react';
import { Dimensions, Platform, StatusBar } from 'react-native';

export const useResponsive = () => {
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const onChange = (result) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const { width, height } = screenData;
  
  // Get status bar height - different approach for iOS vs Android
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44; // iOS status bar is typically 44pt
  
  // Device categorization that works for both iOS and Android
  const deviceCategories = {
    extraSmall: width < 320,  // Very old devices
    small: width >= 320 && width < 375,  // iPhone SE, small Android
    medium: width >= 375 && width < 414,  // iPhone 12/13/14, standard phones
    large: width >= 414 && width < 480,   // iPhone 12/13/14 Plus, large phones
    extraLarge: width >= 480 && width < 768, // Phablets
    tablet: width >= 768 && width < 1024,    // iPad, small tablets
    largeTablet: width >= 1024,              // iPad Pro, large tablets
  };

  return {
    width,
    height,
    statusBarHeight,
    
    // Device type detection
    isExtraSmallDevice: deviceCategories.extraSmall,
    isSmallDevice: deviceCategories.small,
    isMediumDevice: deviceCategories.medium,
    isLargeDevice: deviceCategories.large,
    isExtraLargeDevice: deviceCategories.extraLarge,
    isTablet: deviceCategories.tablet,
    isLargeTablet: deviceCategories.largeTablet,
    
    // Orientation
    isLandscape: width > height,
    isPortrait: height > width,
    
    // Platform specific checks
    isAndroid: Platform.OS === 'android',
    isIOS: Platform.OS === 'ios',
    
    // Responsive values with better Android support
    getResponsiveValue: (extraSmall, small, medium, large, extraLarge, tablet, largeTablet) => {
      if (deviceCategories.largeTablet) return largeTablet || tablet || extraLarge || large || medium || small || extraSmall;
      if (deviceCategories.tablet) return tablet || extraLarge || large || medium || small || extraSmall;
      if (deviceCategories.extraLarge) return extraLarge || large || medium || small || extraSmall;
      if (deviceCategories.large) return large || medium || small || extraSmall;
      if (deviceCategories.medium) return medium || small || extraSmall;
      if (deviceCategories.small) return small || extraSmall;
      return extraSmall;
    },
    
    // Responsive spacing with Android considerations
    getSpacing: (base) => {
      if (deviceCategories.extraSmall) return Math.max(base * 0.6, 2);
      if (deviceCategories.small) return base * 0.75;
      if (deviceCategories.tablet || deviceCategories.largeTablet) return base * 1.25;
      if (deviceCategories.extraLarge) return base * 1.1;
      return base;
    },
    
    // Responsive font size with Android considerations
    getFontSize: (base) => {
      if (deviceCategories.extraSmall) return Math.max(base - 3, 10);
      if (deviceCategories.small) return Math.max(base - 2, 11);
      if (deviceCategories.tablet) return base + 2;
      if (deviceCategories.largeTablet) return base + 4;
      if (deviceCategories.extraLarge) return base + 1;
      return base;
    },
    
    // Get responsive padding for safe areas (iOS and Android)
    getSafeAreaPadding: () => ({
      top: Platform.OS === 'android' ? statusBarHeight : 44, // iOS notch area
      bottom: Platform.OS === 'android' ? 16 : 34, // iOS home indicator area
      left: 0,
      right: 0,
    }),
    
    // Get responsive container padding
    getContainerPadding: () => {
      const basePadding = 16;
      if (deviceCategories.extraSmall) return basePadding * 0.75;
      if (deviceCategories.small) return basePadding * 0.875;
      if (deviceCategories.tablet || deviceCategories.largeTablet) return basePadding * 1.5;
      return basePadding;
    },
    
    // Get responsive button height
    getButtonHeight: () => {
      if (deviceCategories.extraSmall) return 40;
      if (deviceCategories.small) return 44;
      if (deviceCategories.tablet || deviceCategories.largeTablet) return 52;
      return 48;
    },
    
    // Get responsive input height
    getInputHeight: () => {
      if (deviceCategories.extraSmall) return 36;
      if (deviceCategories.small) return 40;
      if (deviceCategories.tablet || deviceCategories.largeTablet) return 48;
      return 44;
    },
  };
};