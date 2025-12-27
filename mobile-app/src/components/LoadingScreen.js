import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

export default function LoadingScreen({ message = 'Loading...' }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotsAnim = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  useEffect(() => {
    // Spinning animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    // Dots animation
    const dotsAnimation = Animated.loop(
      Animated.stagger(150, 
        dotsAnim.map(dot => 
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        )
      )
    );

    spinAnimation.start();
    pulseAnimation.start();
    dotsAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
      dotsAnimation.stop();
    };
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Animated spinner */}
          <Animated.View 
            style={[
              styles.spinnerContainer,
              {
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <Animated.View 
              style={[
                styles.spinner,
                {
                  transform: [{ rotate: spin }]
                }
              ]}
            >
              <View style={styles.spinnerInner} />
            </Animated.View>
          </Animated.View>

          {/* Loading text with animated dots */}
          <View style={styles.textContainer}>
            <Text style={styles.loadingText}>{message.replace('...', '')}</Text>
            <View style={styles.dotsContainer}>
              {dotsAnim.map((dot, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      opacity: dot,
                      transform: [{
                        scale: dot.interpolate({
                          inputRange: [0.3, 1],
                          outputRange: [0.5, 1],
                        })
                      }]
                    }
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerContainer: {
    marginBottom: Layout.spacing.xl,
  },
  spinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: Colors.crackzoneYellow,
    borderRightColor: Colors.crackzoneYellow + '60',
  },
  spinnerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    borderBottomColor: Colors.crackzoneYellow + '40',
    borderLeftColor: Colors.crackzoneYellow + '40',
    margin: 4,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: Layout.spacing.sm,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.crackzoneYellow,
    marginHorizontal: 1.5,
    shadowColor: Colors.crackzoneYellow,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 2,
  },
});