import { Link } from 'react-router-dom'

export default function Hero() {
  const scrollToNext = () => {
    const element = document.getElementById('about')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-background"></div>

      {/* Decorative circles */}
      <div className="absolute top-20 right-[10%] w-72 h-72 bg-blue-100/50 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-[5%] w-96 h-96 bg-blue-50/50 rounded-full blur-3xl"></div>


      <div className="relative max-w-4xl mx-auto text-center">
        <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-6 shadow-sm">
          AI Transformation Partner
        </span>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
          The <span className="text-blue-600">AI partner</span> for businesses who want results, not hype.
        </h1>

        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Take a 2-minute assessment to see where AI can help, and what to do first.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/ai-readiness"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all text-center shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
          >
            Get Your AI Readiness Score
          </Link>
          <button
            onClick={scrollToNext}
            className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border border-slate-200 transition-all hover:border-slate-300"
          >
            Learn more
          </button>
        </div>
      </div>
    </section>
  )
}
