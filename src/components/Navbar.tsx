import { Link } from 'react-router-dom'

export default function Navbar() {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="font-semibold text-slate-900 text-lg">
          UpLevel Automations
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollTo('about')}
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            About
          </button>
          <button
            onClick={() => scrollTo('services')}
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            Services
          </button>
          <button
            onClick={() => scrollTo('footer')}
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            Contact
          </button>
          <Link
            to="/ai-readiness"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            Take the Assessment
          </Link>
        </div>

        <Link
          to="/ai-readiness"
          className="md:hidden px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Assessment
        </Link>
      </div>
    </nav>
  )
}
