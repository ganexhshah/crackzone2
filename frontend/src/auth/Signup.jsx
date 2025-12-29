import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Rocket, Flame, Target, Zap } from 'lucide-react'
import CrackZoneLogo from '../components/CrackZoneLogo'
import { useAuth } from '../contexts/AuthContext'
import { GOOGLE_AUTH_URL } from '../config/api'

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gameId: '',
    favoriteGame: 'freefire'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!')
      setLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      })
      
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black flex items-center justify-center p-4 main-app">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-crackzone-yellow/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-crackzone-yellow/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <CrackZoneLogo className="w-48 h-18 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Join the Battle!</h1>
          <p className="text-gray-400">Create your account and start dominating</p>
        </div>

        {/* Signup Form */}
        <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Gaming Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow focus:ring-1 focus:ring-crackzone-yellow transition-colors"
                placeholder="Choose your gaming name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow focus:ring-1 focus:ring-crackzone-yellow transition-colors"
                placeholder="Enter your email"
              />
            </div>

            {/* Game ID Field */}
            <div>
              <label htmlFor="gameId" className="block text-sm font-medium text-gray-300 mb-2">
                Game ID (Optional)
              </label>
              <input
                type="text"
                id="gameId"
                name="gameId"
                value={formData.gameId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow focus:ring-1 focus:ring-crackzone-yellow transition-colors"
                placeholder="Your FreeFire/PUBG ID"
              />
            </div>

            {/* Favorite Game */}
            <div>
              <label htmlFor="favoriteGame" className="block text-sm font-medium text-gray-300 mb-2">
                Favorite Game
              </label>
              <select
                id="favoriteGame"
                name="favoriteGame"
                value={formData.favoriteGame}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white focus:outline-none focus:border-crackzone-yellow focus:ring-1 focus:ring-crackzone-yellow transition-colors"
              >
                <option value="freefire">FreeFire</option>
                <option value="pubg">PUBG Mobile</option>
                <option value="both">Both Games</option>
              </select>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow focus:ring-1 focus:ring-crackzone-yellow transition-colors pr-12"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-crackzone-yellow transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-crackzone-black/50 border border-crackzone-yellow/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-crackzone-yellow focus:ring-1 focus:ring-crackzone-yellow transition-colors pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-crackzone-yellow transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 mt-1 text-crackzone-yellow bg-crackzone-black border-crackzone-yellow/30 rounded focus:ring-crackzone-yellow focus:ring-2"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                I agree to the{' '}
                <Link to="/terms" className="text-crackzone-yellow hover:text-yellow-400 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-crackzone-yellow hover:text-yellow-400 transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-crackzone-yellow text-crackzone-black hover:bg-yellow-400 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Rocket className="w-5 h-5" />
              {loading ? 'Creating Account...' : 'Create Account & Start Playing'}
            </button>
          </form>

          {/* Social Signup */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-crackzone-yellow/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-crackzone-gray text-gray-400">Or sign up with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <a
                href={GOOGLE_AUTH_URL}
                className="w-full inline-flex justify-center py-3 px-4 border border-crackzone-yellow/30 rounded-lg bg-crackzone-black/50 text-sm font-medium text-gray-300 hover:bg-crackzone-yellow/10 hover:border-crackzone-yellow/50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="ml-2">Google</span>
              </a>

              <button className="w-full inline-flex justify-center py-3 px-4 border border-crackzone-yellow/30 rounded-lg bg-crackzone-black/50 text-sm font-medium text-gray-300 hover:bg-crackzone-yellow/10 hover:border-crackzone-yellow/50 transition-colors opacity-50 cursor-not-allowed">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-crackzone-yellow hover:text-yellow-400 font-medium transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup