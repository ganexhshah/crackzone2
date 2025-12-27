import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/FeaturesSection'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-crackzone-black main-app">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  )
}

export default App