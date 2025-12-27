import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { walletAPI } from '../../services/api';
import ManualPaymentFlow from '../../components/ManualPaymentFlow';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveHeader from '../../components/ResponsiveHeader';
import WalletSkeleton from '../../components/skeletons/WalletSkeleton';

export default function WalletScreen({ navigation, route }) {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addMoneyModal, setAddMoneyModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const { 
    getResponsiveValue, 
    getFontSize, 
    getSpacing, 
    getContainerPadding 
  } = useResponsive();

  useEffect(() => {
    loadWalletData();
    loadPaymentMethods();
    
    // Handle retry payment from navigation params
    if (route.params?.retryPayment && route.params?.amount) {
      setAmount(route.params.amount.toString());
      setAddMoneyModal(true);
    }
  }, [route.params]);

  const loadWalletData = async () => {
    try {
      const [walletResponse, transactionsResponse] = await Promise.all([
        walletAPI.getWallet(),
        walletAPI.getTransactions({ limit: 10 })
      ]);
      
      // Handle the backend response structure
      const walletData = walletResponse.data.wallet;
      const transactionsData = transactionsResponse.data.transactions || [];
      
      setWallet({
        balance: walletData.balance,
        total_deposited: walletData.totalEarnings,
        total_withdrawn: walletData.totalSpent,
        tournament_winnings: walletData.totalEarnings - walletData.totalSpent
      });
      
      setTransactions(transactionsData.map(tx => ({
        ...tx,
        created_at: tx.date + 'T' + tx.time + ':00Z' // Convert backend format to ISO
      })));
    } catch (error) {
      console.error('Error loading wallet data:', error);
      Alert.alert('Error', 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await walletAPI.getManualPaymentMethods();
      setPaymentMethods(response.data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  }, []);

  const handleAddMoney = () => {
    setAddMoneyModal(true);
  };

  const handleAddMoneySuccess = async () => {
    await loadWalletData();
    Alert.alert('Success', 'Payment submitted successfully! Admin will verify within 24 hours.');
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) < 100) {
      Alert.alert('Error', 'Minimum withdrawal amount is ₹100');
      return;
    }

    if (wallet && parseFloat(amount) > wallet.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    try {
      const payload = {
        amount: parseFloat(amount),
        paymentMethodId: 'default', // Backend expects paymentMethodId
        bankDetails: {
          source: 'mobile_app',
          timestamp: new Date().toISOString()
        }
      };
      
      await walletAPI.withdraw(payload);
      setWithdrawModal(false);
      setAmount('');
      await loadWalletData();
      Alert.alert('Success', 'Withdrawal request submitted successfully');
    } catch (error) {
      console.error('Error withdrawing money:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to process withdrawal');
    }
  };

  const selectQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
      case 'deposit':
      case 'add_money':
        return 'add-circle';
      case 'debit':
      case 'withdrawal':
      case 'withdraw':
        return 'remove-circle';
      case 'tournament_fee':
        return 'trophy';
      case 'tournament_prize':
        return 'medal';
      default:
        return 'swap-horizontal';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'credit':
      case 'deposit':
      case 'add_money':
      case 'tournament_prize':
        return Colors.success;
      case 'debit':
      case 'withdrawal':
      case 'withdraw':
      case 'tournament_fee':
        return Colors.error;
      default:
        return Colors.info;
    }
  };

  const renderTransaction = ({ item }) => (
    <TouchableOpacity 
      style={styles.transactionItem}
      onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
    >
      <View style={styles.transactionLeft}>
        <Ionicons 
          name={getTransactionIcon(item.type)} 
          size={24} 
          color={getTransactionColor(item.type)} 
        />
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>{item.description || item.type}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.created_at)}</Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          { color: getTransactionColor(item.type) }
        ]}>
          {item.type === 'debit' || item.type === 'withdrawal' || item.type === 'tournament_fee' ? '-' : '+'}
          {formatCurrency(item.amount)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <WalletSkeleton />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.crackzoneBlack, Colors.crackzoneGray]} style={styles.gradient}>
        {/* Responsive Header */}
        <ResponsiveHeader
          title="Wallet"
          showBackButton={false}
          rightIcon="card-outline"
          onRightPress={() => navigation.navigate('TransactionHistory')}
          showBorder={false}
        />

        {/* Subtitle */}
        <View style={[
          styles.subtitleContainer,
          {
            paddingHorizontal: getContainerPadding(),
            paddingBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          <Text style={[
            styles.headerSubtitle,
            { fontSize: getFontSize(16) }
          ]}>
            Manage your gaming funds
          </Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <LinearGradient
              colors={[Colors.crackzoneYellow, Colors.accentDark]}
              style={styles.balanceGradient}
            >
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceAmount}>{formatCurrency(wallet?.balance)}</Text>
              <Text style={styles.balanceSubtext}>Available for tournaments</Text>
            </LinearGradient>
          </View>

          {/* Wallet Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatCurrency(wallet?.total_deposited || 0)}
              </Text>
              <Text style={styles.statLabel}>Total Deposited</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatCurrency(wallet?.total_withdrawn || 0)}
              </Text>
              <Text style={styles.statLabel}>Total Withdrawn</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatCurrency(wallet?.tournament_winnings || 0)}
              </Text>
              <Text style={styles.statLabel}>Winnings</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleAddMoney}
            >
              <Ionicons name="add-circle-outline" size={24} color={Colors.success} />
              <Text style={styles.actionButtonText}>Add Money</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setWithdrawModal(true)}
            >
              <Ionicons name="remove-circle-outline" size={24} color={Colors.error} />
              <Text style={styles.actionButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {transactions.length > 0 ? (
              <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyStateText}>No transactions yet</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Manual Payment Flow */}
        <ManualPaymentFlow
          visible={addMoneyModal}
          onClose={() => setAddMoneyModal(false)}
          onSuccess={handleAddMoneySuccess}
        />

        {/* Withdraw Modal */}
        <Modal
          visible={withdrawModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Withdraw Money</Text>
              <Text style={styles.modalSubtitle}>
                Available: {formatCurrency(wallet?.balance)} | Min: ₹100
              </Text>
              
              <TextInput
                style={styles.amountInput}
                placeholder="Enter withdrawal amount"
                placeholderTextColor={Colors.textMuted}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />

              <View style={styles.withdrawInfo}>
                <Text style={styles.withdrawInfoText}>
                  • Processing time: 1-3 business days
                </Text>
                <Text style={styles.withdrawInfoText}>
                  • No withdrawal fees
                </Text>
                <Text style={styles.withdrawInfoText}>
                  • Money will be transferred to your registered bank account
                </Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setWithdrawModal(false);
                    setAmount('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleWithdraw}
                >
                  <Text style={styles.confirmButtonText}>Withdraw</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Layout.fontSize.lg,
    color: Colors.text,
  },
  subtitleContainer: {
    // Dynamic padding applied via responsive hook
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  balanceCard: {
    marginHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
  },
  balanceGradient: {
    padding: Layout.spacing.lg,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: Layout.fontSize.sm,
    color: Colors.crackzoneBlack,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.crackzoneBlack,
    marginBottom: Layout.spacing.xs,
  },
  balanceSubtext: {
    fontSize: Layout.fontSize.sm,
    color: Colors.crackzoneBlack,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  statValue: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  statLabel: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
    gap: Layout.spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '600',
    marginTop: Layout.spacing.sm,
  },
  transactionsSection: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  viewAllText: {
    fontSize: Layout.fontSize.md,
    color: Colors.crackzoneYellow,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  transactionDetails: {
    marginLeft: Layout.spacing.md,
    flex: 1,
  },
  transactionTitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  transactionDate: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  transactionAmount: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  emptyStateText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textMuted,
    marginTop: Layout.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
  },
  modalSubtitle: {
    fontSize: Layout.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
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
  withdrawInfo: {
    backgroundColor: Colors.card,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.lg,
  },
  withdrawInfoText: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmButton: {
    backgroundColor: Colors.crackzoneYellow,
  },
  cancelButtonText: {
    fontSize: Layout.fontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  confirmButtonText: {
    fontSize: Layout.fontSize.md,
    color: Colors.crackzoneBlack,
    fontWeight: 'bold',
  },
});