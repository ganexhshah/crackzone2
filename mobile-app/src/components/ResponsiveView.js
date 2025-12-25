import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { Layout } from '../constants/Layout';

export default function ResponsiveView({ 
  children, 
  style, 
  padding = true, 
  horizontal = true, 
  vertical = true,
  ...props 
}) {
  const { getContainerPadding } = useResponsive();
  
  const containerPadding = getContainerPadding();
  
  const responsiveStyle = {
    paddingHorizontal: horizontal && padding ? containerPadding : 0,
    paddingVertical: vertical && padding ? containerPadding * 0.5 : 0,
  };

  return (
    <View style={[responsiveStyle, style]} {...props}>
      {children}
    </View>
  );
}

// Responsive Text component
export function ResponsiveText({ 
  children, 
  size = 'md', 
  style, 
  ...props 
}) {
  const { getFontSize } = useResponsive();
  
  const baseFontSize = Layout.fontSize[size] || Layout.fontSize.md;
  const responsiveFontSize = getFontSize(baseFontSize);
  
  return (
    <Text style={[{ fontSize: responsiveFontSize }, style]} {...props}>
      {children}
    </Text>
  );
}

// Responsive TouchableOpacity
export function ResponsiveTouchable({ 
  children, 
  style, 
  minHeight = true,
  ...props 
}) {
  const { getButtonHeight } = useResponsive();
  
  const buttonHeight = getButtonHeight();
  
  const responsiveStyle = {
    minHeight: minHeight ? Math.max(buttonHeight, Layout.minTouchTarget) : undefined,
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <TouchableOpacity style={[responsiveStyle, style]} {...props}>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Add any default styles here
});