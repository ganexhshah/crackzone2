import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, login } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register({ username, email, password });
    setLoading(false);

    if (!result.success) {
      let errorMessage = result.error;
      
      // Provide more helpful error messages
      if (result.error === 'User already exists') {
        errorMessage = 'An account with this email or username already exists. Please try logging in instead.';
      }
      
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      
      // Create the Google OAuth URL for mobile
      const googleAuthUrl = 'http://192.168.18.13:5000/api/auth/google/mobile';
      
      // Open the Google OAuth flow
      const result = await WebBrowser.openAuthSessionAsync(
        googleAuthUrl,
        'exp://192.168.18.13:19000/--/auth/callback'
      );

      if (result.type === 'success') {
        // Extract token from the callback URL
        const url = result.url;
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const token = urlParams.get('token');
        const profileComplete = urlParams.get('profileComplete');
        const error = urlParams.get('error');

        if (error) {
          let errorMessage = 'Authentication failed';
          if (error === 'oauth_not_configured') {
            errorMessage = 'Google OAuth is not configured on the server';
          } else if (error === 'auth_failed') {
            errorMessage = 'Google authentication failed';
          }
          Alert.alert('Signup Failed', errorMessage);
          return;
        }

        if (token) {
          // Set the auth token and navigate
          const loginResult = await login({ token, isGoogleAuth: true });
          
          if (loginResult.success) {
            if (profileComplete === 'false') {
              // Navigate to complete profile if needed
              navigation.navigate('CompleteProfile');
            }
          } else {
            Alert.alert('Signup Failed', loginResult.error);
          }
        } else {
          Alert.alert('Signup Failed', 'Failed to authenticate with Google');
        }
      } else if (result.type === 'cancel') {
        // User cancelled the signup
        console.log('Google signup cancelled');
      }
    } catch (error) {
      console.error('Google signup error:', error);
      Alert.alert('Signup Failed', 'Failed to authenticate with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join the gaming community</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Google Signup Button */}
              <TouchableOpacity
                style={[styles.googleButton, googleLoading && styles.googleButtonDisabled]}
                onPress={handleGoogleSignup}
                disabled={googleLoading}
              >
                <View style={styles.googleButtonContent}>
                  <Ionicons name="logo-google" size={20} color={Colors.text} />
                  <Text style={styles.googleButtonText}>
                    {googleLoading ? 'Connecting...' : 'Continue with Google'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor={Colors.textMuted}
                  value={formData.username}
                  onChangeText={(value) => handleInputChange('username', value)}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={Colors.textMuted}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.textMuted}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor={Colors.textMuted}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.registerButtonText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginLinkText}>
                  Already have an account? <Text style={styles.loginLinkHighlight}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Layout.spacing.lg,
  },
  header: {
    marginTop: Layout.spacing.xl,
    marginBottom: Layout.spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    flex: 1,
  },
  googleButton: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Layout.spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Layout.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    fontSize: 14,
    paddingHorizontal: Layout.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: Layout.spacing.sm,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    paddingVertical: Layout.spacing.md,
  },
  eyeButton: {
    padding: Layout.spacing.sm,
  },
  registerButton: {
    backgroundColor: Colors.crackzoneYellow,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: Colors.crackzoneBlack,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
  },
  loginLinkText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  loginLinkHighlight: {
    color: Colors.crackzoneYellow,
    fontWeight: 'bold',
  },
});