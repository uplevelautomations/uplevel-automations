import { Link } from 'react-router-dom'

export default function AssessmentTeaser() {
  const benefits = [
    {
      icon: (
        // Gauge/speedometer icon for score
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
        </svg>
      ),
      text: "Your AI Readiness Score (out of 100)"
    },
    {
      icon: (
        // Sparkles icon for what's working
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      ),
      text: "What's working well in your business"
    },
    {
      icon: (
        // Wrench icon for what needs work
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
        </svg>
      ),
      text: "What needs work before AI makes sense"
    },
    {
      icon: (
        // Map/route icon for next steps
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
      ),
      text: "Personalized next steps"
    }
  ]

  return (
    <section className="py-24 px-6 bg-slate-900">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4 text-center">
          Find out if your business is ready for AI
        </h2>
        <p className="text-slate-400 text-center mb-12 text-lg">
          In just 2 minutes, you'll have clarity on where you stand and what to do next.
        </p>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 md:p-10 mb-12">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">
            What you'll get
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-4"
              >
                <div className="text-blue-400 mt-0.5">
                  {benefit.icon}
                </div>
                <span className="text-slate-300 font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/ai-readiness"
            onClick={() => window.dataLayer?.push({ event: 'cta_click', cta_text: 'Take the Assessment', cta_location: 'assessment_teaser' })}
            className="inline-block px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 text-lg"
          >
            Take the Assessment
          </Link>
          <p className="mt-4 text-sm text-slate-500">Free. Takes about 2 minutes.</p>
        </div>
      </div>
    </section>
  )
}
