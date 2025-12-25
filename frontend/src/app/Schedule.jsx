import React, { useState } from 'react'
import { Calendar, Clock, Trophy, Users, MapPin, Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import DashboardNavbar from './DashboardNavbar'
import MobileBottomMenu from './MobileBottomMenu'

const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('week') // 'week' or 'month'

  const events = [
    {
      id: 1,
      title: 'FreeFire Championship',
      type: 'tournament',
      date: '2024-12-25',
      time: '20:00',
      duration: '2 hours',
      participants: '156/200',
      status: 'registered',
      prize: '₹1,00,000'
    },
    {
      id: 2,
      title: 'Team Practice Session',
      type: 'practice',
      date: '2024-12-26',
      time: '18:00',
      duration: '1 hour',
      participants: '4/4',
      status: 'confirmed',
      team: 'Fire Squad'
    },
    {
      id: 3,
      title: 'PUBG Squad Battle',
      type: 'tournament',
      date: '2024-12-27',
      time: '19:00',
      duration: '3 hours',
      participants: '89/100',
      status: 'pending',
      prize: '₹75,000'
    },
    {
      id: 4,
      title: 'Strategy Meeting',
      type: 'meeting',
      date: '2024-12-28',
      time: '16:00',
      duration: '30 minutes',
      participants: '4/4',
      status: 'confirmed',
      team: 'Fire Squad'
    }
  ]

  const getEventsByDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateStr)
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getWeekDates = (date) => {
    const week = []
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const EventCard = ({ event }) => (
    <div className={`bg-crackzone-gray/50 backdrop-blur-sm border rounded-lg p-4 mb-3 hover:border-crackzone-yellow/40 transition-all ${
      event.type === 'tournament' ? 'border-crackzone-yellow/20' :
      event.type === 'practice' ? 'border-blue-500/20' :
      'border-green-500/20'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            event.type === 'tournament' ? 'bg-crackzone-yellow' :
            event.type === 'practice' ? 'bg-blue-500' :
            'bg-green-500'
          }`}></div>
          <div>
            <h3 className="font-bold text-white text-sm">{event.title}</h3>
            <p className="text-xs text-gray-400">
              {event.team && `${event.team} • `}
              {event.prize && `Prize: ${event.prize}`}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          event.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
          event.status === 'registered' ? 'bg-crackzone-yellow/20 text-crackzone-yellow' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {event.status}
        </span>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{event.time} ({event.duration})</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{event.participants}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black">
      <DashboardNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Schedule</h1>
            <p className="text-gray-400">Manage your tournaments and team events</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'week' 
                  ? 'bg-crackzone-yellow text-crackzone-black' 
                  : 'bg-crackzone-gray/50 text-gray-400 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'month' 
                  ? 'bg-crackzone-yellow text-crackzone-black' 
                  : 'bg-crackzone-gray/50 text-gray-400 hover:text-white'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-6 bg-crackzone-gray/30 rounded-lg p-4">
          <button 
            onClick={() => {
              const newDate = new Date(currentDate)
              newDate.setDate(currentDate.getDate() - (viewMode === 'week' ? 7 : 30))
              setCurrentDate(newDate)
            }}
            className="p-2 text-gray-400 hover:text-crackzone-yellow transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-bold text-white">
            {formatDate(currentDate)}
          </h2>
          
          <button 
            onClick={() => {
              const newDate = new Date(currentDate)
              newDate.setDate(currentDate.getDate() + (viewMode === 'week' ? 7 : 30))
              setCurrentDate(newDate)
            }}
            className="p-2 text-gray-400 hover:text-crackzone-yellow transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {viewMode === 'week' ? (
          /* Week View */
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {getWeekDates(currentDate).map((date, index) => {
              const dayEvents = getEventsByDate(date)
              const isToday = date.toDateString() === new Date().toDateString()
              
              return (
                <div key={index} className={`bg-crackzone-gray/30 rounded-lg p-4 min-h-[200px] ${
                  isToday ? 'ring-2 ring-crackzone-yellow/50' : ''
                }`}>
                  <div className="text-center mb-3">
                    <p className="text-xs text-gray-400 uppercase">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className={`text-lg font-bold ${
                      isToday ? 'text-crackzone-yellow' : 'text-white'
                    }`}>
                      {date.getDate()}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {dayEvents.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Month View - Simplified */
          <div className="bg-crackzone-gray/30 rounded-lg p-6">
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="bg-crackzone-gray/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white">{event.title}</h3>
                    <span className="text-sm text-gray-400">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{event.participants}</span>
                    </div>
                    {event.prize && (
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        <span>{event.prize}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-crackzone-gray/50 rounded-lg p-4 text-center">
            <Trophy className="w-8 h-8 text-crackzone-yellow mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-xs text-gray-400">Upcoming Tournaments</p>
          </div>
          <div className="bg-crackzone-gray/50 rounded-lg p-4 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">2</p>
            <p className="text-xs text-gray-400">Team Events</p>
          </div>
          <div className="bg-crackzone-gray/50 rounded-lg p-4 text-center">
            <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">1</p>
            <p className="text-xs text-gray-400">Today's Events</p>
          </div>
          <div className="bg-crackzone-gray/50 rounded-lg p-4 text-center">
            <Bell className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">5</p>
            <p className="text-xs text-gray-400">Reminders Set</p>
          </div>
        </div>
      </div>

      <MobileBottomMenu />
    </div>
  )
}

export default Schedule