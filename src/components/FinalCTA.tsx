import { Link } from 'react-router-dom'

export default function FinalCTA() {
  return (
    <section className="relative py-24 px-6 bg-slate-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Is your business ready for AI?
        </h2>

        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl mx-auto">
          Take this 2-minute quiz to find out.
        </p>

        <Link
          to="/ai-readiness"
          className="inline-block px-10 py-4 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-lg transition-all text-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
        >
          Get Your AI Readiness Score
        </Link>
      </div>
    </section>
  )
}
