import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import App from './App'
import { Login, Signup } from './auth'
import GoogleCallback from './auth/GoogleCallback'
import CompleteProfile from './auth/CompleteProfile'
import Dashboard from './app/Dashboard'
import Tournaments from './app/Tournaments'
import TournamentDetail from './app/TournamentDetail'
import MyMatches from './app/MyMatches'
import Teams from './app/Teams'
import Schedule from './app/Schedule'
import Profile from './app/Profile'
import Settings from './app/Settings'
import Wallet from './app/Wallet'
import Notifications from './app/Notifications'
import TestManualPayment from './components/TestManualPayment'
import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import TournamentManagement from './admin/TournamentManagement'
import UserManagement from './admin/UserManagement'
import TeamManagement from './admin/TeamManagement'
import ManualPaymentManagement from './admin/ManualPaymentManagement'
import PaymentMethodSettings from './admin/PaymentMethodSettings'
import AdminProtectedRoute from './admin/AdminProtectedRoute'

const AppRouter = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          <Route path="/complete-profile" element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/tournaments" element={
            <ProtectedRoute>
              <Tournaments />
            </ProtectedRoute>
          } />
          <Route path="/tournaments/:id" element={
            <ProtectedRoute>
              <TournamentDetail />
            </ProtectedRoute>
          } />
          <Route path="/my-matches" element={
            <ProtectedRoute>
              <MyMatches />
            </ProtectedRoute>
          } />
          <Route path="/teams" element={
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          } />
          <Route path="/schedule" element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/wallet" element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          
          {/* Test Route */}
          <Route path="/test-manual-payment" element={<TestManualPayment />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/tournaments" element={
            <AdminProtectedRoute>
              <TournamentManagement />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <AdminProtectedRoute>
              <UserManagement />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/teams" element={
            <AdminProtectedRoute>
              <TeamManagement />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/payments" element={
            <AdminProtectedRoute>
              <ManualPaymentManagement />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/payment-settings" element={
            <AdminProtectedRoute>
              <PaymentMethodSettings />
            </AdminProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default AppRouter