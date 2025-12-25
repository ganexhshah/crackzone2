import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { walletAPI } from '../../services/api';

export default function TransactionHistoryScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async (pageNum = 1, append = false) => {
    try {
      const response = await walletAPI.getTransactions({ 
        page: pageNum, 
        limit: 20 
      });
      
      const newTransactions = response.data.transactions || [];
      
      // Convert backend format to expected format
      const formattedTransactions = newTransactions.map(tx => ({
        ...tx,
        created_at: tx.date + 'T' + tx.time + ':00Z', // Convert backend format to ISO
        reference_id: tx.transactionId
      }));
      
      if (append) {
        setTransactions(prev => [...prev, ...formattedTransactions]);
      } else {
        setTransactions(formattedTransactions);
      }
      
      setHasMore(newTransactions.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactions(1, false);
    setRefreshing(false);
  }, []);

  const loadMore = () => {
    if (hasMore && !loading) {
      loadTransactions(page + 1, true);
    }
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
      case 'refund':
        return 'refresh-circle';
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
      case 'refund':
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'pending':
        return Colors.warning;
      case 'failed':
        return Colors.error;
      default:
        return Colors.textMuted;
    }
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: getTransactionColor(item.type) + '20' }
        ]}>
          <Ionicons 
            name={getTransactionIcon(item.type)} 
            size={24} 
            color={getTransactionColor(item.type)} 
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>
            {item.description || item.type.replace('_', ' ').toUpperCase()}
          </Text>
          <Text style={styles.transactionDate}>{formatDate(item.created_at)}</Text>
          {item.status && (
            <Text style={[styles.transactionStatus, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          )}
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
        {item.reference_id && (
          <Text style={styles.referenceId}>#{item.reference_id}</Text>
        )}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color={Colors.textMuted} />
      <Text style={styles.emptyStateTitle}>No Transactions</Text>
      <Text style={styles.emptyStateText}>
        Your transaction history will appear here
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.crackzoneBlack, Colors.crackzoneGray]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Transactions List */}
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={Colors.crackzoneYellow}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  backButton: {
    padding: Layout.spacing.sm,
    marginRight: Layout.spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  listContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: Layout.spacing.xs,
  },
  transactionStatus: {
    fontSize: Layout.fontSize.xs,
    fontWeight: '600',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.xs,
  },
  referenceId: {
    fontSize: Layout.fontSize.xs,
    color: Colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
  },
  emptyStateText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  loadingFooter: {
    paddingVertical: Layout.spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Layout.fontSize.md,
    color: Colors.textMuted,
  },
});