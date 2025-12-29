import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader, Shield, Zap, Users, Trophy } from 'lucide-react'
import CrackZoneLogo from '../components/CrackZoneLogo'
import { getGoogleOAuthUrl } from '../utils/urls'

const GoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Check for error in URL parameters
    const urlError = searchParams.get('error')
    if (urlError === 'auth_failed') {
      setError('Google authentication failed. Please try again.')
    } else if (urlError === 'oauth_not_configured') {
      setError('Google OAuth is not properly configured.')
    }
  }, [searchParams])

  const handleGoogleAuth = () => {
    setIsLoading(true)
    // Redirect to Google OAuth
    window.location.href = getGoogleOAuthUrl()
  }

  const features = [
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Your account is protected with Google\'s advanced security'
    },
    {
      icon: Zap,
      title: 'Quick Access',
      description: 'Get started instantly without creating a new password'
    },
    {
      icon: Users,
      title: 'Join the Community',
      description: 'Connect with thousands of gamers in tournaments'
    },
    {
      icon: Trophy,
      title: 'Win Prizes',
      description: 'Compete in tournaments and earn real rewards'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <CrackZoneLogo className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to CrackZone</h1>
          <p className="text-gray-400">Continue with Google to join the ultimate gaming platform</p>
        </div>

        {/* Main Auth Card */}
        <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-8 mb-6">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Google Auth Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <a href="#" className="text-crackzone-yellow hover:text-yellow-400 transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-crackzone-yellow hover:text-yellow-400 transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-crackzone-gray/30 backdrop-blur-sm border border-crackzone-yellow/10 rounded-lg p-4 text-center">
              <feature.icon className="w-6 h-6 text-crackzone-yellow mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Alternative Options */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">
            Already have an account with email?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 bg-crackzone-gray/50 border border-crackzone-yellow/20 text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-crackzone-gray/70 hover:border-crackzone-yellow/30 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="flex-1 bg-crackzone-gray/50 border border-crackzone-yellow/20 text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-crackzone-gray/70 hover:border-crackzone-yellow/30 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-8 text-sm">
            <div>
              <div className="text-crackzone-yellow font-bold">10K+</div>
              <div className="text-gray-400">Active Players</div>
            </div>
            <div>
              <div className="text-crackzone-yellow font-bold">500+</div>
              <div className="text-gray-400">Tournaments</div>
            </div>
            <div>
              <div className="text-crackzone-yellow font-bold">₹50L+</div>
              <div className="text-gray-400">Prizes Won</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoogleAuth