import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveHeader from '../../components/ResponsiveHeader';

export default function TransactionHistoryScreen({ navigation }) {
  const { getSpacing, getFontSize } = useResponsive();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const transactions = [
    {
      id: 1,
      type: 'credit',
      amount: 1000,
      description: 'Added money to wallet',
      date: '2024-03-15T10:30:00Z',
      status: 'completed',
      method: 'UPI',
    },
    {
      id: 2,
      type: 'debit',
      amount: 100,
      description: 'Tournament entry fee',
      date: '2024-03-14T15:45:00Z',
      status: 'completed',
      tournament: 'FreeFire Championship',
    },
    {
      id: 3,
      type: 'credit',
      amount: 500,
      description: 'Tournament prize',
      date: '2024-03-13T18:20:00Z',
      status: 'completed',
      tournament: 'PUBG Squad Battle',
    },
    {
      id: 4,
      type: 'debit',
      amount: 2000,
      description: 'Withdrawal to bank',
      date: '2024-03-12T09:15:00Z',
      status: 'pending',
      method: 'Bank Transfer',
    },
    {
      id: 5,
      type: 'credit',
      amount: 2500,
      description: 'Added money to wallet',
      date: '2024-03-10T14:30:00Z',
      status: 'completed',
      method: 'Credit Card',
    },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

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
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString()}`;
  };

  const filteredTransactions = activeFilter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === activeFilter);

  const TransactionItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.transactionItem,
        {
          padding: getSpacing(Layout.spacing.md),
          marginBottom: getSpacing(Layout.spacing.sm),
        }
      ]}
      onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
    >
      <View style={styles.transactionLeft}>
        <View style={[
          styles.transactionIcon,
          {
            width: getSpacing(40),
            height: getSpacing(40),
            borderRadius: getSpacing(20),
            marginRight: getSpacing(Layout.spacing.md),
          }
        ]}>
          <Ionicons 
            name={getTransactionIcon(item.type)} 
            size={getFontSize(20)} 
            color={getTransactionColor(item.type)} 
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={[
            styles.transactionTitle,
            { 
              fontSize: getFontSize(16),
              marginBottom: getSpacing(Layout.spacing.xs),
            }
          ]}>
            {item.description}
          </Text>
          <Text style={[
            styles.transactionDate,
            { fontSize: getFontSize(12) }
          ]}>
            {formatDate(item.date)}
          </Text>
          {item.tournament && (
            <Text style={[
              styles.transactionMeta,
              { fontSize: getFontSize(12) }
            ]}>
              {item.tournament}
            </Text>
          )}
          {item.method && (
            <Text style={[
              styles.transactionMeta,
              { fontSize: getFontSize(12) }
            ]}>
              via {item.method}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          { 
            fontSize: getFontSize(16),
            color: getTransactionColor(item.type),
            marginBottom: getSpacing(Layout.spacing.xs),
          }
        ]}>
          {item.type === 'debit' ? '-' : '+'}
          {formatCurrency(item.amount)}
        </Text>
        <View style={[
          styles.statusBadge,
          { 
            backgroundColor: getStatusColor(item.status) + '20',
            paddingHorizontal: getSpacing(Layout.spacing.sm),
            paddingVertical: getSpacing(Layout.spacing.xs),
          }
        ]}>
          <Text style={[
            styles.statusText,
            { 
              fontSize: getFontSize(10),
              color: getStatusColor(item.status),
            }
          ]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const filters = [
    { id: 'all', name: 'All', count: transactions.length },
    { id: 'credit', name: 'Credits', count: transactions.filter(t => t.type === 'credit').length },
    { id: 'debit', name: 'Debits', count: transactions.filter(t => t.type === 'debit').length },
  ];

  const totalCredits = transactions
    .filter(t => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = transactions
    .filter(t => t.type === 'debit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.crackzoneBlack, Colors.crackzoneGray]}
        style={styles.gradient}
      >
        <ResponsiveHeader
          title="Transaction History"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />

        <View style={[
          styles.subtitleContainer,
          {
            paddingHorizontal: getSpacing(Layout.spacing.lg),
            paddingBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          <Text style={[
            styles.headerSubtitle,
            { fontSize: getFontSize(16) }
          ]}>
            View all your transactions
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={[
          styles.summaryContainer,
          {
            marginHorizontal: getSpacing(Layout.spacing.lg),
            marginBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          <View style={[
            styles.summaryCard,
            {
              padding: getSpacing(Layout.spacing.md),
              marginRight: getSpacing(Layout.spacing.sm),
            }
          ]}>
            <Text style={[
              styles.summaryValue,
              { 
                fontSize: getFontSize(18),
                color: Colors.success,
                marginBottom: getSpacing(Layout.spacing.xs),
              }
            ]}>
              +{formatCurrency(totalCredits)}
            </Text>
            <Text style={[
              styles.summaryLabel,
              { fontSize: getFontSize(12) }
            ]}>
              Total Credits
            </Text>
          </View>
          <View style={[
            styles.summaryCard,
            {
              padding: getSpacing(Layout.spacing.md),
              marginLeft: getSpacing(Layout.spacing.sm),
            }
          ]}>
            <Text style={[
              styles.summaryValue,
              { 
                fontSize: getFontSize(18),
                color: Colors.error,
                marginBottom: getSpacing(Layout.spacing.xs),
              }
            ]}>
              -{formatCurrency(totalDebits)}
            </Text>
            <Text style={[
              styles.summaryLabel,
              { fontSize: getFontSize(12) }
            ]}>
              Total Debits
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={[
          styles.filtersContainer,
          {
            marginHorizontal: getSpacing(Layout.spacing.lg),
            marginBottom: getSpacing(Layout.spacing.lg),
          }
        ]}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                {
                  paddingVertical: getSpacing(Layout.spacing.sm),
                  paddingHorizontal: getSpacing(Layout.spacing.md),
                },
                activeFilter === filter.id && styles.activeFilterTab
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text style={[
                styles.filterText,
                { fontSize: getFontSize(14) },
                activeFilter === filter.id && styles.activeFilterText
              ]}>
                {filter.name} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsList}>
          {filteredTransactions.length > 0 ? (
            <FlatList
              data={filteredTransactions}
              renderItem={({ item }) => <TransactionItem item={item} />}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={[
                styles.listContainer,
                {
                  paddingHorizontal: getSpacing(Layout.spacing.lg),
                  paddingBottom: getSpacing(Layout.spacing.xl),
                }
              ]}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={Colors.crackzoneYellow}
                />
              }
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={getFontSize(48)} color={Colors.textMuted} />
              <Text style={[
                styles.emptyStateText,
                { 
                  fontSize: getFontSize(16),
                  marginTop: getSpacing(Layout.spacing.md),
                }
              ]}>
                No transactions found
              </Text>
              <Text style={[
                styles.emptyStateSubtext,
                { fontSize: getFontSize(14) }
              ]}>
                Your transaction history will appear here
              </Text>
            </View>
          )}
        </View>
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
  subtitleContainer: {
    // Dynamic padding applied via responsive hook
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  summaryValue: {
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: Colors.textSecondary,
  },
  filtersContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.xs,
    flexDirection: 'row',
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: Layout.borderRadius.md,
  },
  activeFilterTab: {
    backgroundColor: Colors.crackzoneYellow,
  },
  filterText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeFilterText: {
    color: Colors.crackzoneBlack,
  },
  transactionsList: {
    flex: 1,
  },
  listContainer: {
    // Dynamic padding applied via responsive hook
  },
  transactionItem: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    color: Colors.text,
    fontWeight: '600',
  },
  transactionDate: {
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  transactionMeta: {
    color: Colors.textMuted,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontWeight: 'bold',
  },
  statusBadge: {
    borderRadius: Layout.borderRadius.sm,
  },
  statusText: {
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },
  emptyStateText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Layout.spacing.sm,
  },
});