import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { walletAPI } from '../services/api';

const PAYMENT_STEPS = {
  PAYMENT_METHOD: 'payment_method',
  AMOUNT: 'amount',
  QR_CODE: 'qr_code',
  SCREENSHOT: 'screenshot',
  CONFIRMATION: 'confirmation'
};

export default function ManualPaymentFlow({ visible, onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(PAYMENT_STEPS.AMOUNT);
  const [amount, setAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transactionReference, setTransactionReference] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  useEffect(() => {
    if (visible) {
      loadPaymentMethods();
      resetFlow();
    }
  }, [visible]);

  const resetFlow = () => {
    setCurrentStep(PAYMENT_STEPS.PAYMENT_METHOD); // Start with payment method selection
    setAmount('');
    setSelectedPaymentMethod(null);
    setScreenshot(null);
    setTransactionReference('');
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await walletAPI.getManualPaymentMethods();
      setPaymentMethods(response.data.methods || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    }
  };

  const selectQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
  };

  const handleAmountNext = () => {
    if (!amount || parseFloat(amount) < 10) {
      Alert.alert('Error', 'Please enter amount ≥ ₹10');
      return;
    }
    setCurrentStep(PAYMENT_STEPS.QR_CODE); // Go to QR code after amount
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setCurrentStep(PAYMENT_STEPS.AMOUNT); // Go to amount after selecting payment method
  };

  const downloadQRCode = async () => {
    try {
      if (selectedPaymentMethod?.qrCodeUrl) {
        await Linking.openURL(selectedPaymentMethod.qrCodeUrl);
      } else {
        Alert.alert('Info', 'QR Code download not available');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to download QR code');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload screenshot');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setScreenshot(result.assets[0]);
        setCurrentStep(PAYMENT_STEPS.SCREENSHOT);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permissions to take photo');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setScreenshot(result.assets[0]);
        setCurrentStep(PAYMENT_STEPS.SCREENSHOT);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadScreenshot = async () => {
    if (!screenshot) {
      Alert.alert('Error', 'Please select a screenshot');
      return;
    }

    setUploading(true);
    try {
      // In a real app, you would upload to your server or cloud storage
      // For now, we'll simulate the upload and use a placeholder URL
      const screenshotUrl = `screenshot_${Date.now()}.jpg`;
      
      const payload = {
        paymentMethodId: selectedPaymentMethod.id,
        amount: parseFloat(amount),
        screenshotUrl: screenshotUrl,
        transactionReference: transactionReference || `TXN${Date.now()}`
      };

      await walletAPI.submitManualPayment(payload);
      setCurrentStep(PAYMENT_STEPS.CONFIRMATION);
    } catch (error) {
      console.error('Error submitting payment:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit payment');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    resetFlow();
    onClose();
  };

  const handleSuccess = () => {
    resetFlow();
    onSuccess();
    onClose();
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Object.values(PAYMENT_STEPS).map((step, index) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep === step && styles.stepCircleActive,
            Object.values(PAYMENT_STEPS).indexOf(currentStep) > index && styles.stepCircleCompleted
          ]}>
            <Text style={[
              styles.stepNumber,
              (currentStep === step || Object.values(PAYMENT_STEPS).indexOf(currentStep) > index) && styles.stepNumberActive
            ]}>
              {index + 1}
            </Text>
          </View>
          {index < Object.values(PAYMENT_STEPS).length - 1 && (
            <View style={[
              styles.stepLine,
              Object.values(PAYMENT_STEPS).indexOf(currentStep) > index && styles.stepLineCompleted
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderAmountStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Enter Amount</Text>
      <Text style={styles.stepSubtitle}>
        Payment Method: {selectedPaymentMethod?.displayName} | Min: ₹10
      </Text>
      
      <View style={styles.quickAmountsContainer}>
        <Text style={styles.quickAmountsLabel}>Quick Select:</Text>
        <View style={styles.quickAmountsGrid}>
          {quickAmounts.map((quickAmount) => (
            <TouchableOpacity
              key={quickAmount}
              style={[
                styles.quickAmountButton,
                amount === quickAmount.toString() && styles.quickAmountButtonSelected
              ]}
              onPress={() => selectQuickAmount(quickAmount)}
            >
              <Text style={[
                styles.quickAmountText,
                amount === quickAmount.toString() && styles.quickAmountTextSelected
              ]}>
                ₹{quickAmount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TextInput
        style={styles.amountInput}
        placeholder="Enter custom amount"
        placeholderTextColor={Colors.textMuted}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <View style={styles.amountButtonsContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setCurrentStep(PAYMENT_STEPS.PAYMENT_METHOD)}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={handleAmountNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaymentMethodStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Payment Method</Text>
      <Text style={styles.stepSubtitle}>Choose how you want to add money</Text>
      
      <View style={styles.paymentMethodsContainer}>
        {/* Khalti - Coming Soon */}
        <TouchableOpacity style={[styles.paymentMethodCard, styles.paymentMethodDisabled]}>
          <View style={styles.paymentMethodLeft}>
            <View style={[styles.paymentMethodIcon, { backgroundColor: '#5C2D91' }]}>
              <Text style={styles.paymentMethodIconText}>K</Text>
            </View>
            <View>
              <Text style={styles.paymentMethodName}>Khalti</Text>
              <Text style={styles.paymentMethodDesc}>Digital Wallet</Text>
            </View>
          </View>
          <Text style={styles.comingSoonText}>Coming Soon</Text>
        </TouchableOpacity>

        {/* eSewa - Coming Soon */}
        <TouchableOpacity style={[styles.paymentMethodCard, styles.paymentMethodDisabled]}>
          <View style={styles.paymentMethodLeft}>
            <View style={[styles.paymentMethodIcon, { backgroundColor: '#60BB46' }]}>
              <Text style={styles.paymentMethodIconText}>E</Text>
            </View>
            <View>
              <Text style={styles.paymentMethodName}>eSewa</Text>
              <Text style={styles.paymentMethodDesc}>Digital Wallet</Text>
            </View>
          </View>
          <Text style={styles.comingSoonText}>Coming Soon</Text>
        </TouchableOpacity>

        {/* Manual Payment Methods */}
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={styles.paymentMethodCard}
            onPress={() => handlePaymentMethodSelect(method)}
          >
            <View style={styles.paymentMethodLeft}>
              <View style={[styles.paymentMethodIcon, { backgroundColor: Colors.crackzoneYellow }]}>
                <Ionicons name="qr-code" size={20} color={Colors.crackzoneBlack} />
              </View>
              <View>
                <Text style={styles.paymentMethodName}>{method.displayName}</Text>
                <Text style={styles.paymentMethodDesc}>Manual Payment - QR Code</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderQRCodeStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Scan QR Code</Text>
      <Text style={styles.stepSubtitle}>
        {selectedPaymentMethod?.displayName} - ₹{amount}
      </Text>
      
      <View style={styles.qrCodeContainer}>
        {selectedPaymentMethod?.qrCodeUrl ? (
          <Image 
            source={{ uri: selectedPaymentMethod.qrCodeUrl }} 
            style={styles.qrCodeImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.qrCodePlaceholder}>
            <Ionicons name="qr-code" size={80} color={Colors.textMuted} />
            <Text style={styles.qrCodePlaceholderText}>QR Code</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.downloadButton} onPress={downloadQRCode}>
        <Ionicons name="download" size={20} color={Colors.crackzoneBlack} />
        <Text style={styles.downloadButtonText}>Download QR Code</Text>
      </TouchableOpacity>

      {selectedPaymentMethod?.accountDetails && (
        <View style={styles.accountDetailsContainer}>
          <Text style={styles.accountDetailsTitle}>Account Details:</Text>
          <Text style={styles.accountDetailsText}>{selectedPaymentMethod.accountDetails}</Text>
        </View>
      )}

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Instructions:</Text>
        <Text style={styles.instructionsText}>1. Scan the QR code or use account details</Text>
        <Text style={styles.instructionsText}>2. Send exactly ₹{amount}</Text>
        <Text style={styles.instructionsText}>3. Take screenshot of payment confirmation</Text>
        <Text style={styles.instructionsText}>4. Upload the screenshot below</Text>
      </View>

      <View style={styles.uploadButtonsContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Ionicons name="image" size={20} color={Colors.text} />
          <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
          <Ionicons name="camera" size={20} color={Colors.text} />
          <Text style={styles.uploadButtonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderScreenshotStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Upload Screenshot</Text>
      <Text style={styles.stepSubtitle}>Payment: ₹{amount}</Text>
      
      {screenshot && (
        <View style={styles.screenshotContainer}>
          <Image source={{ uri: screenshot.uri }} style={styles.screenshotImage} />
          <TouchableOpacity 
            style={styles.changeScreenshotButton}
            onPress={() => setCurrentStep(PAYMENT_STEPS.QR_CODE)}
          >
            <Text style={styles.changeScreenshotText}>Change Screenshot</Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        style={styles.referenceInput}
        placeholder="Transaction Reference (Optional)"
        placeholderTextColor={Colors.textMuted}
        value={transactionReference}
        onChangeText={setTransactionReference}
      />

      <TouchableOpacity 
        style={[styles.submitButton, uploading && styles.submitButtonDisabled]} 
        onPress={uploadScreenshot}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color={Colors.crackzoneBlack} />
        ) : (
          <Text style={styles.submitButtonText}>Submit Payment</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderConfirmationStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.confirmationContainer}>
        <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
        <Text style={styles.confirmationTitle}>Payment Submitted!</Text>
        <Text style={styles.confirmationMessage}>
          Your payment of ₹{amount} has been submitted successfully.
        </Text>
        <Text style={styles.confirmationSubMessage}>
          Admin will verify your payment within 24 hours. You'll receive a notification once approved.
        </Text>
        
        <TouchableOpacity style={styles.doneButton} onPress={handleSuccess}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case PAYMENT_STEPS.PAYMENT_METHOD:
        return renderPaymentMethodStep();
      case PAYMENT_STEPS.AMOUNT:
        return renderAmountStep();
      case PAYMENT_STEPS.QR_CODE:
        return renderQRCodeStep();
      case PAYMENT_STEPS.SCREENSHOT:
        return renderScreenshotStep();
      case PAYMENT_STEPS.CONFIRMATION:
        return renderConfirmationStep();
      default:
        return renderPaymentMethodStep();
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Money</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {renderStepIndicator()}
          
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {renderCurrentStep()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    maxHeight: '90%',
    minHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: Layout.spacing.sm,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.lg,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.crackzoneYellow,
    borderColor: Colors.crackzoneYellow,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepNumber: {
    fontSize: Layout.fontSize.sm,
    fontWeight: 'bold',
    color: Colors.textMuted,
  },
  stepNumberActive: {
    color: Colors.crackzoneBlack,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: Layout.spacing.sm,
  },
  stepLineCompleted: {
    backgroundColor: Colors.success,
  },
  scrollContent: {
    flex: 1,
  },
  stepContent: {
    padding: Layout.spacing.lg,
  },
  stepTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },
  quickAmountsContainer: {
    marginBottom: Layout.spacing.lg,
  },
  quickAmountsLabel: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Layout.spacing.sm,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  quickAmountButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    minWidth: 70,
    alignItems: 'center',
  },
  quickAmountButtonSelected: {
    backgroundColor: Colors.crackzoneYellow,
    borderColor: Colors.crackzoneYellow,
  },
  quickAmountText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  quickAmountTextSelected: {
    color: Colors.crackzoneBlack,
  },
  amountInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: Layout.fontSize.lg,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },
  amountButtonsContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  backButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  nextButton: {
    flex: 1,
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.crackzoneBlack,
  },
  paymentMethodsContainer: {
    gap: Layout.spacing.md,
  },
  paymentMethodCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodDisabled: {
    opacity: 0.6,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  paymentMethodIconText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  paymentMethodName: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  paymentMethodDesc: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  comingSoonText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.warning,
    fontWeight: '600',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    borderRadius: Layout.borderRadius.md,
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qrCodePlaceholderText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textMuted,
    marginTop: Layout.spacing.sm,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    gap: Layout.spacing.sm,
  },
  downloadButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.crackzoneBlack,
  },
  accountDetailsContainer: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  accountDetailsTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  accountDetailsText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  instructionsContainer: {
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  instructionsTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  instructionsText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
    lineHeight: 18,
  },
  uploadButtonsContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  uploadButtonText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  screenshotContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  screenshotImage: {
    width: 200,
    height: 300,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
  },
  changeScreenshotButton: {
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
  },
  changeScreenshotText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  referenceInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    marginBottom: Layout.spacing.lg,
  },
  submitButton: {
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.crackzoneBlack,
  },
  confirmationContainer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  confirmationTitle: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  confirmationMessage: {
    fontSize: Layout.fontSize.lg,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
    lineHeight: 24,
  },
  confirmationSubMessage: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    lineHeight: 22,
  },
  doneButton: {
    backgroundColor: Colors.crackzoneYellow,
    borderRadius: Layout.borderRadius.md,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.xl,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.crackzoneBlack,
  },
});