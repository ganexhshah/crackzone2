import React, { useState } from 'react'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Gamepad2, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX,
  Eye,
  EyeOff,
  Trash2,
  LogOut,
  Save,
  ChevronRight
} from 'lucide-react'
import DashboardNavbar from './DashboardNavbar'
import MobileBottomMenu from './MobileBottomMenu'

const Settings = () => {
  const [activeSection, setActiveSection] = useState('account')
  const [settings, setSettings] = useState({
    // Account Settings
    twoFactorAuth: false,
    emailNotifications: true,
    smsNotifications: false,
    
    // Privacy Settings
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowFriendRequests: true,
    
    // Game Settings
    autoJoinTeam: false,
    showGameStats: true,
    allowSpectators: true,
    
    // Notification Settings
    tournamentReminders: true,
    teamInvites: true,
    matchResults: true,
    promotionalEmails: false,
    
    // Display Settings
    darkMode: true,
    soundEffects: true,
    animations: true,
    language: 'english'
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const sections = [
    { id: 'account', name: 'Account', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'game', name: 'Game Settings', icon: Gamepad2 },
    { id: 'display', name: 'Display', icon: settings.darkMode ? Moon : Sun }
  ]

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-white font-medium">{label}</p>
        {description && <p className="text-sm text-gray-400">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-crackzone-yellow' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )

  const SelectField = ({ value, onChange, options, label }) => (
    <div className="py-3">
      <label className="block text-white font-medium mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white focus:outline-none focus:border-crackzone-yellow"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Security</h3>
        
        <ToggleSwitch
          enabled={settings.twoFactorAuth}
          onChange={(value) => handleSettingChange('twoFactorAuth', value)}
          label="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
        />
        
        <div className="border-t border-gray-600 my-4"></div>
        
        <h4 className="text-white font-medium mb-4">Change Password</h4>
        <div className="space-y-4">
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
              className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <button className="bg-crackzone-yellow text-crackzone-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors">
            Update Password
          </button>
        </div>
      </div>

      <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-red-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h3>
        <p className="text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <button className="bg-red-500/20 text-red-400 px-6 py-3 rounded-lg font-bold hover:bg-red-500/30 transition-colors flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Notification Preferences</h3>
      
      <ToggleSwitch
        enabled={settings.emailNotifications}
        onChange={(value) => handleSettingChange('emailNotifications', value)}
        label="Email Notifications"
        description="Receive notifications via email"
      />
      
      <ToggleSwitch
        enabled={settings.smsNotifications}
        onChange={(value) => handleSettingChange('smsNotifications', value)}
        label="SMS Notifications"
        description="Receive notifications via SMS"
      />
      
      <div className="border-t border-gray-600 my-4"></div>
      
      <ToggleSwitch
        enabled={settings.tournamentReminders}
        onChange={(value) => handleSettingChange('tournamentReminders', value)}
        label="Tournament Reminders"
        description="Get notified about upcoming tournaments"
      />
      
      <ToggleSwitch
        enabled={settings.teamInvites}
        onChange={(value) => handleSettingChange('teamInvites', value)}
        label="Team Invitations"
        description="Receive team invitation notifications"
      />
      
      <ToggleSwitch
        enabled={settings.matchResults}
        onChange={(value) => handleSettingChange('matchResults', value)}
        label="Match Results"
        description="Get notified about match outcomes"
      />
      
      <ToggleSwitch
        enabled={settings.promotionalEmails}
        onChange={(value) => handleSettingChange('promotionalEmails', value)}
        label="Promotional Emails"
        description="Receive promotional content and offers"
      />
    </div>
  )

  const renderPrivacySettings = () => (
    <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Privacy Settings</h3>
      
      <SelectField
        value={settings.profileVisibility}
        onChange={(value) => handleSettingChange('profileVisibility', value)}
        label="Profile Visibility"
        options={[
          { value: 'public', label: 'Public' },
          { value: 'friends', label: 'Friends Only' },
          { value: 'private', label: 'Private' }
        ]}
      />
      
      <ToggleSwitch
        enabled={settings.showOnlineStatus}
        onChange={(value) => handleSettingChange('showOnlineStatus', value)}
        label="Show Online Status"
        description="Let others see when you're online"
      />
      
      <ToggleSwitch
        enabled={settings.allowFriendRequests}
        onChange={(value) => handleSettingChange('allowFriendRequests', value)}
        label="Allow Friend Requests"
        description="Allow other players to send friend requests"
      />
    </div>
  )

  const renderGameSettings = () => (
    <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Game Preferences</h3>
      
      <ToggleSwitch
        enabled={settings.autoJoinTeam}
        onChange={(value) => handleSettingChange('autoJoinTeam', value)}
        label="Auto-Join Team"
        description="Automatically join available teams"
      />
      
      <ToggleSwitch
        enabled={settings.showGameStats}
        onChange={(value) => handleSettingChange('showGameStats', value)}
        label="Show Game Statistics"
        description="Display your game stats publicly"
      />
      
      <ToggleSwitch
        enabled={settings.allowSpectators}
        onChange={(value) => handleSettingChange('allowSpectators', value)}
        label="Allow Spectators"
        description="Let others watch your matches"
      />
    </div>
  )

  const renderDisplaySettings = () => (
    <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Display & Interface</h3>
      
      <ToggleSwitch
        enabled={settings.darkMode}
        onChange={(value) => handleSettingChange('darkMode', value)}
        label="Dark Mode"
        description="Use dark theme for the interface"
      />
      
      <ToggleSwitch
        enabled={settings.soundEffects}
        onChange={(value) => handleSettingChange('soundEffects', value)}
        label="Sound Effects"
        description="Play sound effects for actions"
      />
      
      <ToggleSwitch
        enabled={settings.animations}
        onChange={(value) => handleSettingChange('animations', value)}
        label="Animations"
        description="Enable interface animations"
      />
      
      <SelectField
        value={settings.language}
        onChange={(value) => handleSettingChange('language', value)}
        label="Language"
        options={[
          { value: 'english', label: 'English' },
          { value: 'hindi', label: 'हिंदी' },
          { value: 'tamil', label: 'தமிழ்' },
          { value: 'telugu', label: 'తెలుగు' }
        ]}
      />
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'account': return renderAccountSettings()
      case 'notifications': return renderNotificationSettings()
      case 'privacy': return renderPrivacySettings()
      case 'game': return renderGameSettings()
      case 'display': return renderDisplaySettings()
      default: return renderAccountSettings()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account preferences and privacy settings</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-4">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-crackzone-yellow/20 text-crackzone-yellow'
                        : 'text-gray-300 hover:text-white hover:bg-crackzone-yellow/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <section.icon className="w-5 h-5" />
                      <span className="font-medium">{section.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {renderContent()}
            
            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button className="bg-crackzone-yellow text-crackzone-black px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save All Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomMenu />
    </div>
  )
}

export default Settings