import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveHeader from '../../components/ResponsiveHeader';

export default function TransactionDetailScreen({ navigation, route }) {
  const { transaction } = route.params || {};
  const { getSpacing, getFontSize } = useResponsive();

  if (!transaction) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
          style={styles.gradient}
        >
          <ResponsiveHeader
            title="Transaction Detail"
            showBackButton={true}
            onBackPress={() => navigation.goBack()}
          />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Transaction not found</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit': return 'add-circle';
      case 'debit': return 'remove-circle';
      default: return 'swap-horizontal';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'credit': return Colors.success;
      case 'debit': return Colors.error;
      default: return Colors.info;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return Colors.success;
      case 'pending': return Colors.warning;
      case 'failed': return Colors.error;
      default: return Colors.textMuted;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString()}`;
  };

  const handleShare = async () => {
    try {
      const message = `Transaction Details\n\nAmount: ${transaction.type === 'debit' ? '-' : '+'}${formatCurrency(transaction.amount)}\nDescription: ${transaction.description}\nDate: ${formatDate(transaction.date)}\nStatus: ${transaction.status.toUpperCase()}`;
      
      await Share.share({
        message: message,
        title: 'Transaction Details'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const DetailRow = ({ label, value, valueColor = Colors.text }) => (
    <View style={[
      styles.detailRow,
      {
        paddingVertical: getSpacing(Layout.spacing.md),
      }
    ]}>
      <Text style={[
        styles.detailLabel,
        { fontSize: getFontSize(14) }
      ]}>
        {label}
      </Text>
      <Text style={[
        styles.detailValue,
        { 
          fontSize: getFontSize(16),
          color: valueColor,
        }
      ]}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        <ResponsiveHeader
          title="Transaction Detail"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
          rightIcon="share-outline"
          onRightPress={handleShare}
        />

        <ScrollView style={styles.scrollView}>
          <View style={[
            styles.contentContainer,
            {
              paddingHorizontal: getSpacing(Layout.spacing.lg),
              paddingBottom: getSpacing(Layout.spacing.xl),
            }
          ]}>
            {/* Transaction Header */}
            <View style={[
              styles.headerCard,
              {
                padding: getSpacing(Layout.spacing.xl),
                marginBottom: getSpacing(Layout.spacing.lg),
              }
            ]}>
              <View style={[
                styles.transactionIcon,
                {
                  width: getSpacing(60),
                  height: getSpacing(60),
                  borderRadius: getSpacing(30),
                  marginBottom: getSpacing(Layout.spacing.md),
                }
              ]}>
                <Ionicons 
                  name={getTransactionIcon(transaction.type)} 
                  size={getFontSize(30)} 
                  color={getTransactionColor(transaction.type)} 
                />
              </View>
              
              <Text style={[
                styles.transactionAmount,
                { 
                  fontSize: getFontSize(32),
                  color: getTransactionColor(transaction.type),
                  marginBottom: getSpacing(Layout.spacing.sm),
                }
              ]}>
                {transaction.type === 'debit' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </Text>
              
              <Text style={[
                styles.transactionDescription,
                { 
                  fontSize: getFontSize(18),
                  marginBottom: getSpacing(Layout.spacing.sm),
                }
              ]}>
                {transaction.description}
              </Text>
              
              <View style={[
                styles.statusBadge,
                { 
                  backgroundColor: getStatusColor(transaction.status) + '20',
                  paddingHorizontal: getSpacing(Layout.spacing.md),
                  paddingVertical: getSpacing(Layout.spacing.sm),
                }
              ]}>
                <Text style={[
                  styles.statusText,
                  { 
                    fontSize: getFontSize(14),
                    color: getStatusColor(transaction.status),
                  }
                ]}>
                  {transaction.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Transaction Details */}
            <View style={[
              styles.detailsCard,
              {
                padding: getSpacing(Layout.spacing.lg),
                marginBottom: getSpacing(Layout.spacing.lg),
              }
            ]}>
              <Text style={[
                styles.sectionTitle,
                { 
                  fontSize: getFontSize(18),
                  marginBottom: getSpacing(Layout.spacing.md),
                }
              ]}>
                Transaction Details
              </Text>
              
              <DetailRow 
                label="Transaction ID" 
                value={`TXN${transaction.id.toString().padStart(8, '0')}`} 
              />
              
              <DetailRow 
                label="Date & Time" 
                value={formatDate(transaction.date)} 
              />
              
              <DetailRow 
                label="Type" 
                value={transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} 
                valueColor={getTransactionColor(transaction.type)}
              />
              
              <DetailRow 
                label="Status" 
                value={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)} 
                valueColor={getStatusColor(transaction.status)}
              />
              
              {transaction.method && (
                <DetailRow 
                  label="Payment Method" 
                  value={transaction.method} 
                />
              )}
              
              {transaction.tournament && (
                <DetailRow 
                  label="Tournament" 
                  value={transaction.tournament} 
                />
              )}
            </View>

            {/* Additional Info */}
            {transaction.status === 'pending' && (
              <View style={[
                styles.infoCard,
                {
                  padding: getSpacing(Layout.spacing.lg),
                  marginBottom: getSpacing(Layout.spacing.lg),
                }
              ]}>
                <View style={styles.infoHeader}>
                  <Ionicons name="information-circle" size={getFontSize(20)} color={Colors.warning} />
                  <Text style={[
                    styles.infoTitle,
                    { 
                      fontSize: getFontSize(16),
                      marginLeft: getSpacing(Layout.spacing.sm),
                    }
                  ]}>
                    Pending Transaction
                  </Text>
                </View>
                <Text style={[
                  styles.infoText,
                  { 
                    fontSize: getFontSize(14),
                    marginTop: getSpacing(Layout.spacing.sm),
                  }
                ]}>
                  This transaction is currently being processed. It may take 1-3 business days to complete.
                </Text>
              </View>
            )}

            {transaction.status === 'failed' && (
              <View style={[
                styles.infoCard,
                styles.errorCard,
                {
                  padding: getSpacing(Layout.spacing.lg),
                  marginBottom: getSpacing(Layout.spacing.lg),
                }
              ]}>
                <View style={styles.infoHeader}>
                  <Ionicons name="alert-circle" size={getFontSize(20)} color={Colors.error} />
                  <Text style={[
                    styles.infoTitle,
                    { 
                      fontSize: getFontSize(16),
                      marginLeft: getSpacing(Layout.spacing.sm),
                      color: Colors.error,
                    }
                  ]}>
                    Failed Transaction
                  </Text>
                </View>
                <Text style={[
                  styles.infoText,
                  { 
                    fontSize: getFontSize(14),
                    marginTop: getSpacing(Layout.spacing.sm),
                  }
                ]}>
                  This transaction failed to process. Please contact support if you need assistance.
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {transaction.status === 'failed' && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.retryButton,
                    {
                      padding: getSpacing(Layout.spacing.md),
                      marginBottom: getSpacing(Layout.spacing.sm),
                    }
                  ]}
                  onPress={() => {
                    // Handle retry logic
                    navigation.navigate('Wallet', { 
                      retryPayment: true, 
                      amount: transaction.amount 
                    });
                  }}
                >
                  <Ionicons name="refresh" size={getFontSize(20)} color={Colors.crackzoneBlack} />
                  <Text style={[
                    styles.actionButtonText,
                    { 
                      fontSize: getFontSize(16),
                      marginLeft: getSpacing(Layout.spacing.sm),
                    }
                  ]}>
                    Retry Transaction
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.supportButton,
                  {
                    padding: getSpacing(Layout.spacing.md),
                  }
                ]}
                onPress={() => {
                  // Navigate to support or show contact info
                }}
              >
                <Ionicons name="help-circle-outline" size={getFontSize(20)} color={Colors.text} />
                <Text style={[
                  styles.supportButtonText,
                  { 
                    fontSize: getFontSize(16),
                    marginLeft: getSpacing(Layout.spacing.sm),
                  }
                ]}>
                  Contact Support
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    // Dynamic padding applied via responsive hook
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.error,
    fontSize: Layout.fontSize.lg,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  transactionIcon: {
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionAmount: {
    fontWeight: 'bold',
  },
  transactionDescription: {
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusBadge: {
    borderRadius: Layout.borderRadius.md,
  },
  statusText: {
    fontWeight: 'bold',
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  errorCard: {
    borderColor: Colors.error + '40',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTitle: {
    color: Colors.warning,
    fontWeight: 'bold',
  },
  infoText: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionsContainer: {
    // Actions container
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Layout.borderRadius.md,
  },
  retryButton: {
    backgroundColor: Colors.crackzoneYellow,
  },
  actionButtonText: {
    color: Colors.crackzoneBlack,
    fontWeight: 'bold',
  },
  supportButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  supportButtonText: {
    color: Colors.text,
    fontWeight: '600',
  },
});