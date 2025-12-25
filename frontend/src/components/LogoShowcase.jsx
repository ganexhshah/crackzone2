import React from 'react'
import CrackZoneLogo from './CrackZoneLogo'

const LogoShowcase = () => {
  return (
    <div className="min-h-screen bg-crackzone-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-crackzone-yellow mb-8 text-center">
          CrackZone Logo Showcase
        </h1>
        
        <div className="grid gap-8">
          {/* Main Logo Sizes */}
          <div className="bg-crackzone-gray p-8 rounded-lg">
            <h2 className="text-xl font-bold text-crackzone-yellow mb-4">Main Logo Variations</h2>
            <div className="grid gap-6">
              <div className="flex items-center gap-4">
                <span className="text-gray-300 w-24">Large:</span>
                <CrackZoneLogo className="w-64 h-24" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-300 w-24">Medium:</span>
                <CrackZoneLogo className="w-32 h-12" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-300 w-24">Small:</span>
                <CrackZoneLogo className="w-24 h-9" />
              </div>
            </div>
          </div>
          
          {/* On Different Backgrounds */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-8 rounded-lg">
              <h3 className="text-black font-bold mb-4">On Light Background</h3>
              <CrackZoneLogo className="w-32 h-12" />
            </div>
            <div className="bg-gray-800 p-8 rounded-lg">
              <h3 className="text-white font-bold mb-4">On Dark Background</h3>
              <CrackZoneLogo className="w-32 h-12" />
            </div>
          </div>
          
          {/* Usage Examples */}
          <div className="bg-crackzone-gray p-8 rounded-lg">
            <h2 className="text-xl font-bold text-crackzone-yellow mb-4">Usage Examples</h2>
            
            {/* Header Example */}
            <div className="bg-crackzone-black p-4 rounded mb-4">
              <div className="flex items-center justify-between">
                <CrackZoneLogo className="w-24 h-9" />
                <nav className="flex gap-4 text-sm">
                  <a href="#" className="text-gray-300 hover:text-crackzone-yellow">Tournaments</a>
                  <a href="#" className="text-gray-300 hover:text-crackzone-yellow">Teams</a>
                  <a href="#" className="text-gray-300 hover:text-crackzone-yellow">Leaderboard</a>
                </nav>
              </div>
            </div>
            
            {/* Card Example */}
            <div className="bg-crackzone-black p-6 rounded">
              <div className="flex items-center gap-3 mb-4">
                <img src="/crackzone-icon.svg" alt="CrackZone" className="w-8 h-8" />
                <span className="text-crackzone-yellow font-bold">Tournament Alert</span>
              </div>
              <p className="text-gray-300">New tournament starting in 30 minutes!</p>
            </div>
          </div>
          
          {/* Technical Specs */}
          <div className="bg-crackzone-gray p-8 rounded-lg">
            <h2 className="text-xl font-bold text-crackzone-yellow mb-4">Technical Specifications</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-bold text-crackzone-yellow mb-2">Logo Dimensions</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• Horizontal: 128×48px (optimized)</li>
                  <li>• Aspect ratio: 8:3</li>
                  <li>• Scalable SVG format</li>
                  <li>• Transparent background</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-crackzone-yellow mb-2">Color Palette</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• Primary: #FFD700 (Gold)</li>
                  <li>• Secondary: #FFA500 (Orange)</li>
                  <li>• Background: #0A0A0A (Black)</li>
                  <li>• Surface: #1A1A1A (Dark Gray)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogoShowcase