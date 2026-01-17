import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [resourcesOpen, setResourcesOpen] = useState(false)

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
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2">
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
            )}
          </div>

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
