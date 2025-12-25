import React from 'react'

const CrackZoneLogo = ({ className = "w-32 h-12" }) => {
  return (
    <div className={`${className} flex items-center justify-center`}>
      <img
        src="/logo.png"
        alt="CrackZone"
        className="w-full h-full object-contain"
        onError={(e) => {
          // Fallback to SVG if PNG fails to load
          e.target.style.display = 'none'
          e.target.nextSibling.style.display = 'block'
        }}
      />
      
      {/* SVG Fallback */}
      <svg
        viewBox="0 0 128 48"
        className="w-full h-full hidden"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <text
          x="2"
          y="32"
          className="fill-crackzone-yellow font-gaming font-black"
          style={{
            fontSize: '18px',
            fontWeight: '900',
            letterSpacing: '1px'
          }}
          filter="url(#glow)"
        >
          CRACK
        </text>
        
        <g transform="translate(68, 8)">
          <path
            d="M0 4 L20 4 L20 8 L8 20 L20 20 L20 24 L0 24 L0 20 L12 8 L0 8 Z"
            fill="url(#yellowGradient)"
            filter="url(#glow)"
          />
          <path
            d="M10 2 L14 2 L8 14 L12 14 L6 26 L4 26 L10 14 L6 14 L10 2 Z"
            fill="#FFD700"
            opacity="0.9"
            filter="url(#glow)"
          />
        </g>
        
        <text
          x="92"
          y="32"
          className="fill-crackzone-yellow font-gaming font-black"
          style={{
            fontSize: '18px',
            fontWeight: '900',
            letterSpacing: '1px'
          }}
          filter="url(#glow)"
        >
          ONE
        </text>
        
        <g opacity="0.3">
          <line x1="0" y1="40" x2="128" y2="40" stroke="#FFD700" strokeWidth="1"/>
          <line x1="0" y1="42" x2="128" y2="42" stroke="#FFD700" strokeWidth="0.5"/>
        </g>
      </svg>
    </div>
  )
}

export default CrackZoneLogo