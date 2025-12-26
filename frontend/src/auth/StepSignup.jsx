import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Rocket, ChevronLeft, ChevronRight, User, Mail, Gamepad2, Lock, Check, Camera, Upload } from 'lucide-react'
import CrackZoneLogo from '../components/CrackZoneLogo'

const StepSignup = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gameId: '',
    favoriteGame: 'freefire',
    profilePicture: null,
    selectedAvatar: null,
    agreeTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [profilePreview, setProfilePreview] = useState(null)

  const totalSteps = 5

  // Predefined avatars
  const avatars = [
    { id: 1, name: 'Warrior', icon: '⚔️', color: 'from-red-500 to-orange-500' },
    { id: 2, name: 'Ninja', icon: '🥷', color: 'from-purple-500 to-indigo-500' },
    { id: 3, name: 'Robot', icon: '🤖', color: 'from-blue-500 to-cyan-500' },
    { id: 4, name: 'Fire', icon: '🔥', color: 'from-orange-500 to-red-500' },
    { id: 5, name: 'Lightning', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
    { id: 6, name: 'Crown', icon: '👑', color: 'from-yellow-500 to-amber-500' },
    { id: 7, name: 'Skull', icon: '💀', color: 'from-gray-500 to-black' },
    { id: 8, name: 'Diamond', icon: '💎', color: 'from-cyan-500 to-blue-500' }
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, profilePicture: file, selectedAvatar: null })
      const reader = new FileReader()
      reader.onload = (e) => setProfilePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const selectAvatar = (avatar) => {
    setFormData({ ...formData, selectedAvatar: avatar, profilePicture: null })
    setProfilePreview(null)
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Signup completed:', formData)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.username.length >= 3
      case 2:
        return formData.email.includes('@')
      case 3:
        return formData.password.length >= 6 && formData.password === formData.confirmPassword
      case 4:
        return formData.profilePicture || formData.selectedAvatar
      case 5:
        return formData.agreeTerms
      default:
        return false
    }
  }

  const getStepIcon = (step) => {
    if (step < currentStep) return <Check className="w-5 h-5" />
    if (step === currentStep) {
      switch (step) {
        case 1: return <User className="w-5 h-5" />
        case 2: return <Mail className="w-5 h-5" />
        case 3: return <Lock className="w-5 h-5" />
        case 4: return <Camera className="w-5 h-5" />
        case 5: return <Gamepad2 className="w-5 h-5" />
        default: return null
      }
    }
    return <span className="text-sm font-bold">{step}</span>
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="w-16 h-16 text-crackzone-yellow mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Choose Your Gaming Identity</h2>
              <p className="text-gray-400">Pick a unique username that represents you in tournaments</p>
            </div>
            
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
                placeholder="Enter your gaming username"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Mail className="w-16 h-16 text-crackzone-yellow mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Contact Information</h2>
              <p className="text-gray-400">We'll use this to send tournament updates and prizes</p>
            </div>
            
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
                placeholder="Enter your email address"
              />
            </div>

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
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Lock className="w-16 h-16 text-crackzone-yellow mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Secure Your Account</h2>
              <p className="text-gray-400">Create a strong password to protect your gaming profile</p>
            </div>
            
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
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Camera className="w-16 h-16 text-crackzone-yellow mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Choose Your Profile Picture</h2>
              <p className="text-gray-400">Upload a custom image or select from our gaming avatars</p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-crackzone-yellow/30 flex items-center justify-center overflow-hidden bg-crackzone-black/50">
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : formData.selectedAvatar ? (
                  <div className={`w-full h-full bg-gradient-to-br ${formData.selectedAvatar.color} flex items-center justify-center text-3xl`}>
                    {formData.selectedAvatar.icon}
                  </div>
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Upload Custom Picture
              </label>
              <div className="border-2 border-dashed border-crackzone-yellow/30 rounded-lg p-6 text-center hover:border-crackzone-yellow/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="profilePicture"
                />
                <label htmlFor="profilePicture" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-crackzone-yellow mx-auto mb-2" />
                  <p className="text-gray-300 mb-1">Click to upload an image</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Or Choose an Avatar
              </label>
              <div className="grid grid-cols-4 gap-3">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => selectAvatar(avatar)}
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-2xl transition-all hover:scale-110 ${
                      formData.selectedAvatar?.id === avatar.id 
                        ? 'ring-4 ring-crackzone-yellow ring-offset-2 ring-offset-crackzone-gray' 
                        : 'hover:ring-2 hover:ring-crackzone-yellow/50'
                    }`}
                  >
                    {avatar.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Gamepad2 className="w-16 h-16 text-crackzone-yellow mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Ready to Dominate?</h2>
              <p className="text-gray-400">Review your information and join the battle</p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-crackzone-yellow flex items-center justify-center overflow-hidden bg-crackzone-black/50">
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : formData.selectedAvatar ? (
                  <div className={`w-full h-full bg-gradient-to-br ${formData.selectedAvatar.color} flex items-center justify-center text-2xl`}>
                    {formData.selectedAvatar.icon}
                  </div>
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
            </div>

            <div className="bg-crackzone-black/30 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Username:</span>
                <span className="text-white font-medium">{formData.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white font-medium">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Favorite Game:</span>
                <span className="text-white font-medium">
                  {formData.favoriteGame === 'freefire' ? 'FreeFire' : 
                   formData.favoriteGame === 'pubg' ? 'PUBG Mobile' : 'Both Games'}
                </span>
              </div>
            </div>
            
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
                className="w-4 h-4 mt-1 text-crackzone-yellow bg-crackzone-black border-crackzone-yellow/30 rounded focus:ring-crackzone-yellow focus:ring-2"
              />
              <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-300">
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-crackzone-black via-crackzone-gray to-crackzone-black flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-crackzone-yellow/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-crackzone-yellow/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <CrackZoneLogo className="w-48 h-18 mx-auto mb-4" />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step <= currentStep 
                    ? 'bg-crackzone-yellow border-crackzone-yellow text-crackzone-black' 
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {getStepIcon(step)}
                </div>
                {step < 5 && (
                  <div className={`w-8 h-0.5 mx-2 transition-colors ${
                    step < currentStep ? 'bg-crackzone-yellow' : 'bg-gray-600'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        <div className="bg-crackzone-gray/50 backdrop-blur-sm border border-crackzone-yellow/20 rounded-xl p-8">
          <form onSubmit={handleSubmit}>
            {renderStep()}

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-crackzone-black/50 text-gray-300 hover:text-white border border-crackzone-yellow/30 hover:border-crackzone-yellow/50'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    isStepValid()
                      ? 'bg-crackzone-yellow text-crackzone-black hover:bg-yellow-400'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepValid()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 ${
                    isStepValid()
                      ? 'bg-crackzone-yellow text-crackzone-black hover:bg-yellow-400 shadow-lg'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Rocket className="w-5 h-5" />
                  Create Account
                </button>
              )}
            </div>
          </form>

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

export default StepSignup