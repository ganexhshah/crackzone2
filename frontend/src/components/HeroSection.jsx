import React from 'react'
import { Link } from 'react-router-dom'
import { Flame, Target, Gamepad2, Trophy, Shield, Smartphone, Users, BarChart3 } from 'lucide-react'

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-crackzone-yellow/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-crackzone-yellow/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            DOMINATE THE
            <span className="block text-crackzone-yellow">BATTLEGROUND</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join the ultimate FreeFire and PUBG tournaments. Compete with the best, win epic prizes, and claim your throne in the gaming arena.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/auth/google" className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg text-center flex items-center justify-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/signup" className="bg-crackzone-yellow text-crackzone-black hover:bg-yellow-400 px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg text-center flex items-center justify-center gap-2">
              <Flame className="w-5 h-5" />
              Join FreeFire Tournament
            </Link>
            <Link to="/signup" className="bg-transparent border-2 border-crackzone-yellow text-crackzone-yellow hover:bg-crackzone-yellow hover:text-crackzone-black px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 text-center flex items-center justify-center gap-2">
              <Target className="w-5 h-5" />
              Join PUBG Tournament
            </Link>
            <Link to="/dashboard" className="bg-crackzone-gray/50 border-2 border-crackzone-yellow/50 text-crackzone-yellow hover:bg-crackzone-yellow/10 hover:border-crackzone-yellow px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 text-center flex items-center justify-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              Dashboard
            </Link>
          </div>

          {/* Game Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* FreeFire Card */}
            <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-8 hover:border-crackzone-yellow/40 transition-all group">
              <div className="flex justify-center mb-4">
                <img 
                  src="/images/freefire.jpg" 
                  alt="FreeFire" 
                  className="w-16 h-16 object-contain"
                  onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='flex'}}
                />
                <div className="hidden justify-center items-center w-16 h-16 bg-crackzone-yellow/20 rounded-lg">
                  <Flame className="w-8 h-8 text-crackzone-yellow" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-crackzone-yellow mb-4">FreeFire Tournaments</h3>
              <p className="text-gray-300 mb-6">
                Fast-paced battle royale action. Quick matches, intense gameplay, and massive prize pools waiting for skilled players.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Prize Pool:</span>
                  <span className="text-crackzone-yellow font-bold">₹50,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Entry Fee:</span>
                  <span className="text-crackzone-yellow font-bold">₹100</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Tournament:</span>
                  <span className="text-crackzone-yellow font-bold">Today 8 PM</span>
                </div>
              </div>
              <button className="w-full mt-6 bg-crackzone-yellow/10 hover:bg-crackzone-yellow hover:text-crackzone-black text-crackzone-yellow border border-crackzone-yellow/30 py-3 rounded-lg font-bold transition-all group-hover:scale-105">
                Register Now
              </button>
            </div>

            {/* PUBG Card */}
            <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-8 hover:border-crackzone-yellow/40 transition-all group">
              <div className="flex justify-center mb-4">
                <img 
                  src="/images/pubg.jpg" 
                  alt="PUBG Mobile" 
                  className="w-16 h-16 object-contain"
                  onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='flex'}}
                />
                <div className="hidden justify-center items-center w-16 h-16 bg-crackzone-yellow/20 rounded-lg">
                  <Target className="w-8 h-8 text-crackzone-yellow" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-crackzone-yellow mb-4">PUBG Mobile</h3>
              <p className="text-gray-300 mb-6">
                Strategic battle royale warfare. Team up with friends, plan your strategy, and fight for the ultimate chicken dinner.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex justify-between">
                  <span>Prize Pool:</span>
                  <span className="text-crackzone-yellow font-bold">₹1,00,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Entry Fee:</span>
                  <span className="text-crackzone-yellow font-bold">₹200</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Tournament:</span>
                  <span className="text-crackzone-yellow font-bold">Tomorrow 6 PM</span>
                </div>
              </div>
              <button className="w-full mt-6 bg-crackzone-yellow/10 hover:bg-crackzone-yellow hover:text-crackzone-black text-crackzone-yellow border border-crackzone-yellow/30 py-3 rounded-lg font-bold transition-all group-hover:scale-105">
                Register Now
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-crackzone-yellow">10K+</div>
              <div className="text-gray-400">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-crackzone-yellow">500+</div>
              <div className="text-gray-400">Tournaments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-crackzone-yellow">₹50L+</div>
              <div className="text-gray-400">Prize Money</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-crackzone-yellow">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-crackzone-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}

export default HeroSection