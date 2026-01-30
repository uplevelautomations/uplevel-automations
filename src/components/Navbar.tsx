import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

          {/* Resources Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
          >
            <button
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium flex items-center gap-1"
            >
              Resources
              <svg
                className={`w-4 h-4 transition-transform ${resourcesOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {resourcesOpen && (
              <div className="absolute top-full left-0 pt-2 w-56">
                <div className="bg-white rounded-lg shadow-lg border border-slate-200 py-2">
                <Link
                  to="/ai-readiness"
                  className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <div className="font-medium">AI Readiness Assessment</div>
                  <div className="text-xs text-slate-500 mt-0.5">See if your business is ready for AI</div>
                </Link>
                <Link
                  to="/process-mapper"
                  className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <div className="font-medium">Process Mapper</div>
                  <div className="text-xs text-slate-500 mt-0.5">Document a workflow in minutes</div>
                </Link>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => scrollTo('footer')}
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            Contact
          </button>
          <a
            href="https://cal.com/roy-banwell/ai-strategy-call"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => window.dataLayer?.push({ event: 'cal_booking_click', booking_source: 'navbar' })}
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            Book a Call
          </a>
          <Link
            to="/ai-readiness"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            Take the Assessment
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-6 py-4 space-y-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resources</div>
            <Link
              to="/ai-readiness"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-blue-600 font-medium"
            >
              AI Readiness Assessment
            </Link>
            <Link
              to="/process-mapper"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-700 hover:text-blue-600 font-medium"
            >
              Process Mapper
            </Link>
            <a
              href="https://cal.com/roy-banwell/ai-strategy-call"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setMobileMenuOpen(false)
                window.dataLayer?.push({ event: 'cal_booking_click', booking_source: 'navbar_mobile' })
              }}
              className="block py-2 text-slate-700 hover:text-blue-600 font-medium"
            >
              Book a Call
            </a>
            <div className="pt-4 border-t border-slate-200">
              <Link
                to="/ai-readiness"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Take the Assessment
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
