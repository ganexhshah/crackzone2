import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Gamepad2, 
  Trophy, 
  Target,
  Users, 
  User,
  Gift,
  Award
} from 'lucide-react'

const MobileBottomMenu = () => {
  const location = useLocation()

  const menuItems = [
    { name: 'Dashboard', icon: Gamepad2, path: '/dashboard' },
    { name: 'Tournaments', icon: Trophy, path: '/tournaments' },
    { name: 'Leaderboard', icon: Award, path: '/leaderboard' },
    { name: 'Teams', icon: Users, path: '/teams' },
    { name: 'Profile', icon: User, path: '/profile' }
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-crackzone-gray/95 backdrop-blur-sm border-t border-crackzone-yellow/20 z-50">
      <div className="flex justify-around items-center py-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-crackzone-yellow'
                  : 'text-gray-400 hover:text-crackzone-yellow'
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 ${isActive ? 'text-crackzone-yellow' : ''}`} />
              <span className="text-xs font-medium">{item.name}</span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-crackzone-yellow rounded-full"></div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default MobileBottomMenu