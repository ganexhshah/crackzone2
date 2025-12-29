import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import App from './App'
import { Login, Signup } from './auth'
import GoogleCallback from './auth/GoogleCallback'
import CompleteProfile from './auth/CompleteProfile'
import GameSelection from './auth/GameSelection'
import SetupGameProfile from './auth/SetupGameProfile'
import Dashboard from './app/Dashboard'
import Tournaments from './app/Tournaments'
import TournamentDetail from './app/TournamentDetail'
import MyMatches from './app/MyMatches'
import Teams from './app/Teams'
import Schedule from './app/Schedule'
import Profile from './app/Profile'
import PublicProfile from './app/PublicProfile'
import Settings from './app/Settings'
import Wallet from './app/Wallet'
import Rewards from './app/Rewards'
import Notifications from './app/Notifications'
import Leaderboard from './app/Leaderboard'

import AdminLogin from './admin/AdminLogin'
import AdminDashboard from './admin/AdminDashboard'
import TournamentManagement from './admin/TournamentManagement'
import UserManagement from './admin/UserManagement'
import TeamManagement from './admin/TeamManagement'
import ManualPaymentManagement from './admin/ManualPaymentManagement'
import PaymentMethodSettings from './admin/PaymentMethodSettings'
import TournamentAdminPanel from './admin/TournamentAdminPanel'
import RewardManagement from './admin/RewardManagement'
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
          <Route path="/select-game" element={
            <ProtectedRoute>
              <GameSelection />
            </ProtectedRoute>
          } />
          <Route path="/setup-game-profile" element={
            <ProtectedRoute>
              <SetupGameProfile />
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
          <Route path="/u/:username" element={<PublicProfile />} />
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
          <Route path="/rewards" element={
            <ProtectedRoute>
              <Rewards />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          } />

          
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
          <Route path="/admin/tournaments/:id" element={
            <AdminProtectedRoute>
              <TournamentAdminPanel />
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
          <Route path="/admin/rewards" element={
            <AdminProtectedRoute>
              <RewardManagement />
            </AdminProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default AppRouter