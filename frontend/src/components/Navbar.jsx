import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import CrackZoneLogo from './CrackZoneLogo'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-crackzone-black/95 backdrop-blur-sm border-b border-crackzone-yellow/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <CrackZoneLogo className="w-32 h-12" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#tournaments" className="text-gray-300 hover:text-crackzone-yellow px-3 py-2 text-sm font-medium transition-colors">
                Tournaments
              </a>
              <a href="#games" className="text-gray-300 hover:text-crackzone-yellow px-3 py-2 text-sm font-medium transition-colors">
                Games
              </a>
              <a href="#leaderboard" className="text-gray-300 hover:text-crackzone-yellow px-3 py-2 text-sm font-medium transition-colors">
                Leaderboard
              </a>
              <a href="#about" className="text-gray-300 hover:text-crackzone-yellow px-3 py-2 text-sm font-medium transition-colors">
                About
              </a>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-crackzone-yellow px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user?.username}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-crackzone-yellow hover:text-white px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/google" className="bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Link>
                <Link to="/login" className="text-crackzone-yellow hover:text-white px-4 py-2 text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="bg-crackzone-yellow text-crackzone-black hover:bg-yellow-400 px-6 py-2 rounded-lg text-sm font-bold transition-colors">
                  Join Tournament
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-crackzone-yellow p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-crackzone-yellow/20">
              <a href="#tournaments" className="text-gray-300 hover:text-crackzone-yellow block px-3 py-2 text-base font-medium">
                Tournaments
              </a>
              <a href="#games" className="text-gray-300 hover:text-crackzone-yellow block px-3 py-2 text-base font-medium">
                Games
              </a>
              <a href="#leaderboard" className="text-gray-300 hover:text-crackzone-yellow block px-3 py-2 text-base font-medium">
                Leaderboard
              </a>
              <a href="#about" className="text-gray-300 hover:text-crackzone-yellow block px-3 py-2 text-base font-medium">
                About
              </a>
              <div className="pt-4 pb-3 border-t border-crackzone-yellow/20">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="text-gray-300 hover:text-crackzone-yellow block w-full text-left px-3 py-2 text-base font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {user?.username}
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="text-crackzone-yellow hover:text-white block w-full text-left px-3 py-2 text-base font-medium flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/auth/google" className="bg-white text-gray-900 block w-full text-left px-3 py-2 mb-2 rounded-lg text-base font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Link>
                    <Link to="/login" className="text-crackzone-yellow hover:text-white block w-full text-left px-3 py-2 text-base font-medium">
                      Login
                    </Link>
                    <Link to="/signup" className="bg-crackzone-yellow text-crackzone-black hover:bg-yellow-400 block w-full text-left px-3 py-2 mt-2 rounded-lg text-base font-bold">
                      Join Tournament
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar