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