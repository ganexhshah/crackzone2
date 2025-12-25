import React from 'react'
import { Zap, Trophy, Shield, Smartphone, Users, BarChart3 } from 'lucide-react'

const FeaturesSection = () => {
  const features = [
    {
      icon: <Zap className="w-12 h-12 text-crackzone-yellow" />,
      title: 'Instant Tournaments',
      description: 'Join tournaments instantly with our quick matchmaking system. No waiting, just pure gaming action.'
    },
    {
      icon: <Trophy className="w-12 h-12 text-crackzone-yellow" />,
      title: 'Massive Prizes',
      description: 'Win real money and exclusive rewards. Our prize pools are among the biggest in the gaming community.'
    },
    {
      icon: <Shield className="w-12 h-12 text-crackzone-yellow" />,
      title: 'Secure Platform',
      description: 'Your data and winnings are safe with our bank-grade security and instant payout system.'
    },
    {
      icon: <Smartphone className="w-12 h-12 text-crackzone-yellow" />,
      title: 'Mobile Optimized',
      description: 'Play anywhere, anytime. Our platform works seamlessly on all devices and screen sizes.'
    },
    {
      icon: <Users className="w-12 h-12 text-crackzone-yellow" />,
      title: 'Team Tournaments',
      description: 'Form squads with friends or join random teams. Experience the thrill of coordinated gameplay.'
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-crackzone-yellow" />,
      title: 'Live Statistics',
      description: 'Track your performance with detailed stats, rankings, and match history analytics.'
    }
  ]

  return (
    <section id="features" className="py-20 bg-crackzone-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Choose <span className="text-crackzone-yellow">CrackZone</span>?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the ultimate gaming tournament platform designed for competitive players who demand the best.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-crackzone-black/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-8 hover:border-crackzone-yellow/40 transition-all hover:transform hover:scale-105 group"
            >
              <div className="mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-crackzone-yellow mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection