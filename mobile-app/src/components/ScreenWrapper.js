import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { useResponsive } from '../hooks/useResponsive';
import { AndroidUtils } from '../utils/androidUtils';

export default function ScreenWrapper({ children, style }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { getSafeAreaPadding, isAndroid } = useResponsive();

  useEffect(() => {
    // Set status bar style for Android
    if (isAndroid) {
      StatusBar.setBarStyle('light-content', true);
      StatusBar.setBackgroundColor(Colors.crackzoneBlack, true);
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, isAndroid]);

  const safeAreaPadding = getSafeAreaPadding();

  return (
    <SafeAreaView 
      style={[styles.container, style]}
      edges={['top', 'left', 'right']} // Let bottom be handled by tab navigator
    >
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        <Animated.View style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            paddingTop: isAndroid ? 0 : safeAreaPadding.top,
          }
        ]}>
          {children}
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});