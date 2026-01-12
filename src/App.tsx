import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Problem from './components/Problem'
import Services from './components/Services'
import AssessmentTeaser from './components/AssessmentTeaser'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Problem />
        <Services />
        <AssessmentTeaser />
      </main>
      <Footer />
    </div>
  )
}

export default App
