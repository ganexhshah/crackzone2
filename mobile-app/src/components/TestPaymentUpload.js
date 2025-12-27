import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { walletAPI } from '../services/api';

export default function TestPaymentUpload() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        setUploadResult(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setUploading(true);
    try {
      console.log('Testing upload with image:', selectedImage.uri);
      
      const response = await walletAPI.uploadPaymentScreenshot(selectedImage.uri);
      console.log('Upload response:', response.data);
      
      setUploadResult(response.data);
      Alert.alert('Success', 'Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.error || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Payment Screenshot Upload</Text>
      
      <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
        <Ionicons name="image" size={24} color={Colors.text} />
        <Text style={styles.buttonText}>Pick Image</Text>
      </TouchableOpacity>

      {selectedImage && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage.uri }} style={styles.image} />
          <Text style={styles.imageInfo}>
            Size: {Math.round(selectedImage.fileSize / 1024)}KB
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.uploadButton, (!selectedImage || uploading) && styles.disabledButton]} 
        onPress={uploadImage}
        disabled={!selectedImage || uploading}
      >
        {uploading ? (
          <ActivityIndicator color={Colors.crackzoneBlack} />
        ) : (
          <>
            <Ionicons name="cloud-upload" size={24} color={Colors.crackzoneBlack} />
            <Text style={styles.uploadButtonText}>Upload Image</Text>
          </>
        )}
      </TouchableOpacity>

      {uploadResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Upload Result:</Text>
          <Text style={styles.resultText}>URL: {uploadResult.url}</Text>
          <Text style={styles.resultText}>Public ID: {uploadResult.public_id}</Text>
          
          {uploadResult.url && (
            <Image source={{ uri: uploadResult.url }} style={styles.uploadedImage} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.lg,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    gap: Layout.spacing.sm,
  },
  buttonText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.sm,
  },
  imageInfo: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    gap: Layout.spacing.sm,
  },
  disabledButton: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: Layout.fontSize.md,
    color: Colors.crackzoneBlack,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  resultText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  uploadedImage: {
    width: 150,
    height: 100,
    borderRadius: Layout.borderRadius.md,
    marginTop: Layout.spacing.sm,
  },
});