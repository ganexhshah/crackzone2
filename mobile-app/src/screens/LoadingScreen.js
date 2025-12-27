import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

const { width } = Dimensions.get('window');

export default function LoadingScreen() {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Continuous rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    // Dots animation
    const dotsAnimation = Animated.loop(
      Animated.stagger(200, 
        dotsAnim.map(dot => 
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        )
      )
    );

    // Start animations
    pulseAnimation.start();
    rotateAnimation.start();
    
    // Delay dots animation
    setTimeout(() => {
      dotsAnimation.start();
    }, 500);

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
      dotsAnimation.stop();
    };
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray, Colors.crackzoneBlack]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated background elements */}
        <View style={styles.backgroundElements}>
          <Animated.View 
            style={[
              styles.backgroundCircle,
              styles.circle1,
              {
                transform: [{ rotate: rotateInterpolate }],
                opacity: 0.3,
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.backgroundCircle,
              styles.circle2,
              {
                transform: [{ rotate: rotateInterpolate }],
                opacity: 0.3,
              }
            ]} 
          />
        </View>

        <View style={styles.content}>
          {/* Logo Section */}
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { scale: pulseAnim }
                ],
              }
            ]}
          >
            {/* Main logo */}
            <View style={styles.logoWrapper}>
              <Text style={styles.logoText}>CrackZone</Text>
              <View style={styles.logoUnderline} />
            </View>
          </Animated.View>

          {/* Loading indicator */}
          <View style={styles.loadingContainer}>
            <Animated.View 
              style={[
                styles.spinner,
                {
                  transform: [{ rotate: rotateInterpolate }],
                }
              ]}
            >
              <View style={styles.spinnerInner} />
            </Animated.View>
            
            {/* Loading text with animated dots */}
            <View style={styles.loadingTextContainer}>
              <Text style={styles.loadingText}>Loading</Text>
              <View style={styles.dotsContainer}>
                {dotsAnim.map((dot, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        opacity: dot,
                        transform: [{
                          translateY: dot.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -10],
                          })
                        }]
                      }
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Subtitle */}
          <Animated.Text 
            style={[
              styles.subtitle,
              {
                opacity: logoOpacity,
              }
            ]}
          >
            Gaming Tournament Platform
          </Animated.Text>
        </View>

        {/* Bottom decoration */}
        <View style={styles.bottomDecoration}>
          <View style={styles.decorationLine} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.crackzoneBlack,
  },
  gradient: {
    flex: 1,
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: Colors.crackzoneYellow + '30',
  },
  circle1: {
    width: width * 1.5,
    height: width * 1.5,
    top: -width * 0.5,
    left: -width * 0.25,
  },
  circle2: {
    width: width * 1.2,
    height: width * 1.2,
    bottom: -width * 0.4,
    right: -width * 0.1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl * 2,
  },
  logoWrapper: {
    alignItems: 'center',
    zIndex: 1,
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: Colors.crackzoneYellow,
    textShadowColor: Colors.crackzoneYellow + '80',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 2,
  },
  logoUnderline: {
    width: 120,
    height: 4,
    backgroundColor: Colors.crackzoneYellow,
    marginTop: Layout.spacing.sm,
    borderRadius: 2,
    shadowColor: Colors.crackzoneYellow,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  spinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: Colors.crackzoneYellow,
    borderRightColor: Colors.crackzoneYellow + '60',
    marginBottom: Layout.spacing.lg,
  },
  spinnerInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: 'transparent',
    borderBottomColor: Colors.crackzoneYellow + '40',
    borderLeftColor: Colors.crackzoneYellow + '40',
    margin: 4,
  },
  loadingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600',
    letterSpacing: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: Layout.spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.crackzoneYellow,
    marginHorizontal: 2,
    shadowColor: Colors.crackzoneYellow,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 3,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: Layout.spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  decorationLine: {
    width: 100,
    height: 2,
    backgroundColor: Colors.crackzoneYellow + '60',
    borderRadius: 1,
  },
});