import React, { useState, useEffect } from 'react'
import { 
  Wallet as WalletIcon, 
  Plus, 
  Minus, 
  CreditCard, 
  Smartphone, 
  Building, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  EyeOff,
  Copy,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Loader
} from 'lucide-react'
import DashboardNavbar from './DashboardNavbar'
import MobileBottomMenu from './MobileBottomMenu'
import ManualPaymentModal from '../components/ManualPaymentModal'
import { walletAPI } from '../services/api'

const Wallet = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [isManualPaymentModalOpen, setIsManualPaymentModalOpen] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  const [addAmount, setAddAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [walletData, setWalletData] = useState({
    balance: 0,
    totalEarnings: 0,
    totalSpent: 0,
    pendingAmount: 0
  })
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      const response = await walletAPI.getWallet()
      setWalletData(response.data?.wallet || {
        balance: 0,
        totalEarnings: 0,
        totalSpent: 0,
        pendingAmount: 0
      })
      setTransactions(response.data?.recentTransactions || [])
      setError('')
    } catch (err) {
      setError('Failed to load wallet data')
      console.error('Wallet fetch error:', err)
      // Set default values on error
      setWalletData({
        balance: 0,
        totalEarnings: 0,
        totalSpent: 0,
        pendingAmount: 0
      })
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddMoney = async () => {
    if (!addAmount || addAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (selectedPaymentMethod === 'manual') {
      setIsAddMoneyModalOpen(false)
      setIsManualPaymentModalOpen(true)
      return
    }

    try {
      setLoading(true)
      await walletAPI.addMoney({
        amount: parseFloat(addAmount),
        paymentMethod: selectedPaymentMethod,
        paymentDetails: { method: selectedPaymentMethod }
      })
      
      setIsAddMoneyModalOpen(false)
      setAddAmount('')
      setError('')
      await fetchWalletData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add money')
    } finally {
      setLoading(false)
    }
  }

  const handleManualPaymentSuccess = async (response) => {
    setAddAmount('')
    setError('')
    await fetchWalletData()
    // Show success message
    alert('Payment submitted successfully! It will be verified by admin within 24 hours.')
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (withdrawAmount > walletData.balance) {
      setError('Insufficient balance')
      return
    }

    try {
      setLoading(true)
      await walletAPI.withdraw({
        amount: parseFloat(withdrawAmount),
        bankDetails: { accountNumber: '****1234', bankName: 'HDFC Bank' }
      })
      
      setIsWithdrawModalOpen(false)
      setWithdrawAmount('')
      setError('')
      await fetchWalletData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process withdrawal')
    } finally {
      setLoading(false)
    }
  }

  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: Smartphone, description: 'PhonePe, GPay, Paytm' },
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', name: 'Net Banking', icon: Building, description: 'All major banks' },
    { id: 'manual', name: 'Manual', icon: WalletIcon, description: 'eSewa, Khalti, Bank Transfer' }
  ]

  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000]

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const StatCard = ({ icon: Icon, label, value, trend, color = 'text-crackzone-yellow' }) => (
    <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${color}`} />
        {trend && (
          <div className={`flex items-center gap-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">₹{value.toLocaleString()}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )

  const TransactionItem = ({ transaction }) => (
    <div className="bg-crackzone-gray/30 rounded-lg p-4 hover:bg-crackzone-gray/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            transaction.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            {transaction.type === 'credit' ? 
              <ArrowDownLeft className="w-5 h-5 text-green-400" /> : 
              <ArrowUpRight className="w-5 h-5 text-red-400" />
            }
          </div>
          <div>
            <h4 className="font-medium text-white">{transaction.description}</h4>
            <p className="text-sm text-gray-400">{transaction.date} • {transaction.time}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold ${
            transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
          }`}>
            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
          </p>
          <span className={`text-xs px-2 py-1 rounded-full ${
            transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
            transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {transaction.status}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>ID: {transaction.transactionId}</span>
        <button 
          onClick={() => copyToClipboard(transaction.transactionId)}
          className="flex items-center gap-1 hover:text-crackzone-yellow transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          Copy
        </button>
      </div>
    </div>
  )

  const AddMoneyModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-crackzone-gray/95 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Money</h2>
          <button onClick={() => {setIsAddMoneyModalOpen(false); setError('')}} className="p-2 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Enter Amount</label>
            <input
              type="number"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              placeholder="₹ 0"
              className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white text-xl font-bold text-center focus:outline-none focus:border-crackzone-yellow"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-300 mb-3">Quick Select</p>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => setAddAmount(amount.toString())}
                  className="py-2 px-3 bg-crackzone-black/30 border border-crackzone-yellow/20 rounded-lg text-white hover:border-crackzone-yellow/50 transition-colors"
                >
                  ₹{amount}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-300 mb-3">Payment Method</p>
            <div className="space-y-2">
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    selectedPaymentMethod === method.id
                      ? 'border-crackzone-yellow bg-crackzone-yellow/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <method.icon className="w-5 h-5 text-crackzone-yellow" />
                  <div className="text-left">
                    <p className="text-white font-medium">{method.name}</p>
                    <p className="text-xs text-gray-400">{method.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {setIsAddMoneyModalOpen(false); setError('')}}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMoney}
              disabled={!addAmount || addAmount <= 0 || loading}
              className="flex-1 bg-crackzone-yellow text-crackzone-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
              Add ₹{addAmount || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const WithdrawModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-crackzone-gray/95 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Withdraw Money</h2>
          <button onClick={() => {setIsWithdrawModalOpen(false); setError('')}} className="p-2 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-crackzone-yellow/10 border border-crackzone-yellow/30 rounded-lg p-4">
            <p className="text-sm text-crackzone-yellow">Available Balance: ₹{walletData.balance.toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Withdraw Amount</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="₹ 0"
              max={walletData.balance}
              className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white text-xl font-bold text-center focus:outline-none focus:border-crackzone-yellow"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-300 mb-3">Bank Account</p>
            <div className="bg-crackzone-black/30 border border-gray-600 rounded-lg p-3">
              <p className="text-white font-medium">HDFC Bank ****1234</p>
              <p className="text-sm text-gray-400">Primary Account</p>
            </div>
          </div>

          <div className="bg-gray-600/20 rounded-lg p-4">
            <p className="text-xs text-gray-400">
              • Withdrawals are processed within 1-2 business days<br/>
              • Minimum withdrawal amount: ₹100<br/>
              • No withdrawal fees for amounts above ₹500
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {setIsWithdrawModalOpen(false); setError('')}}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              disabled={!withdrawAmount || withdrawAmount <= 0 || withdrawAmount > walletData.balance || loading}
              className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
              Withdraw ₹{withdrawAmount || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading && !walletData.balance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
        <DashboardNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 animate-spin text-crackzone-yellow" />
          </div>
        </div>
        <MobileBottomMenu />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
            <p className="text-gray-400">Manage your funds and transactions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsAddMoneyModalOpen(true)}
              className="bg-crackzone-yellow text-crackzone-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Money
            </button>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Minus className="w-5 h-5" />
              Withdraw
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-crackzone-yellow/20 to-crackzone-yellow/5 border border-crackzone-yellow/30 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <WalletIcon className="w-8 h-8 text-crackzone-yellow" />
              <h2 className="text-xl font-bold text-white">Current Balance</h2>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 text-gray-400 hover:text-crackzone-yellow transition-colors"
            >
              {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-4xl font-bold text-white mb-2">
            {showBalance ? `₹${walletData.balance.toLocaleString()}` : '₹••••••'}
          </p>
          <p className="text-gray-300">Available for tournaments and withdrawals</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={TrendingUp} 
            label="Total Earnings" 
            value={walletData.totalEarnings} 
            trend={12}
            color="text-green-400"
          />
          <StatCard 
            icon={TrendingDown} 
            label="Total Spent" 
            value={walletData.totalSpent} 
            trend={-5}
            color="text-red-400"
          />
          <StatCard 
            icon={Calendar} 
            label="Pending Amount" 
            value={walletData.pendingAmount} 
            color="text-yellow-400"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-crackzone-gray/30 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-crackzone-yellow text-crackzone-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'transactions'
                ? 'bg-crackzone-yellow text-crackzone-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {(transactions || []).length > 0 ? (
                  (transactions || []).slice(0, 3).map(transaction => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <WalletIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No recent transactions</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setActiveTab('transactions')}
                className="w-full mt-4 text-crackzone-yellow hover:text-yellow-400 font-medium transition-colors"
              >
                View All Transactions
              </button>
            </div>

            <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setIsAddMoneyModalOpen(true)}
                  className="w-full bg-crackzone-yellow/20 border border-crackzone-yellow/30 text-crackzone-yellow py-3 rounded-lg font-medium hover:bg-crackzone-yellow/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Money to Wallet
                </button>
                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="w-full bg-red-500/20 border border-red-500/30 text-red-400 py-3 rounded-lg font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Minus className="w-5 h-5" />
                  Withdraw Funds
                </button>
                <button className="w-full bg-crackzone-gray/50 border border-gray-600 text-gray-300 py-3 rounded-lg font-medium hover:bg-crackzone-gray/70 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Statement
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Transaction History</h3>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-crackzone-gray/50 border border-crackzone-yellow/20 rounded-lg text-gray-300 hover:text-crackzone-yellow transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-crackzone-gray/50 border border-crackzone-yellow/20 rounded-lg text-gray-300 hover:text-crackzone-yellow transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {(transactions || []).length > 0 ? (
                (transactions || []).map(transaction => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))
              ) : (
                <div className="text-center py-12">
                  <WalletIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No transactions found</p>
                  <p className="text-gray-500 text-sm">Your transaction history will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddMoneyModalOpen && <AddMoneyModal />}
      {isWithdrawModalOpen && <WithdrawModal />}
      {isManualPaymentModalOpen && (
        <ManualPaymentModal
          isOpen={isManualPaymentModalOpen}
          onClose={() => setIsManualPaymentModalOpen(false)}
          amount={addAmount}
          onSuccess={handleManualPaymentSuccess}
        />
      )}

      <MobileBottomMenu />
    </div>
  )
}

export default Wallet