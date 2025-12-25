import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>CrackZone</Text>
      <ActivityIndicator size="large" color={Colors.crackzoneYellow} style={styles.loader} />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.crackzoneYellow,
    marginBottom: 40,
  },
  loader: {
    marginBottom: 20,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});