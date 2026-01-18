import { Link } from 'react-router-dom'

const processes = [
  {
    number: 1,
    name: 'Prospecting',
    category: 'Acquisition',
    description: 'Finding and qualifying potential clients',
    examples: ['Lead research', 'Outreach campaigns', 'Lead scoring']
  },
  {
    number: 2,
    name: 'Sales',
    category: 'Acquisition',
    description: 'Converting prospects into paying customers',
    examples: ['Discovery calls', 'Proposals', 'Follow-ups']
  },
  {
    number: 3,
    name: 'Onboarding',
    category: 'Delivery',
    description: 'Getting new clients set up for success',
    examples: ['Welcome sequences', 'Account setup', 'Kickoff calls']
  },
  {
    number: 4,
    name: 'Service Delivery',
    category: 'Delivery',
    description: 'Actually delivering what you sell',
    examples: ['Project management', 'Deliverable creation', 'Quality checks']
  },
  {
    number: 5,
    name: 'Outcome Support',
    category: 'Support',
    description: 'Helping clients achieve their goals',
    examples: ['Check-ins', 'Troubleshooting', 'Training']
  },
  {
    number: 6,
    name: 'Analytics & Reporting',
    category: 'Support',
    description: 'Measuring and communicating results',
    examples: ['Performance reports', 'ROI tracking', 'Dashboards']
  },
  {
    number: 7,
    name: 'Retention & Offboarding',
    category: 'Support',
    description: 'Keeping clients happy or wrapping up well',
    examples: ['Renewal outreach', 'Feedback collection', 'Exit process']
  }
]

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Acquisition: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Delivery: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Support: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' }
}

export default function ValueDeliveryFlow() {
  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-4">
            Framework
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            The 7 Processes Every Business Runs
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Whether you know it or not, your business runs on these core workflows.
            Understanding them is the first step to optimizing and automating them.
          </p>
        </div>

        {/* Category Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {Object.entries(categoryColors).map(([category, colors]) => (
            <div key={category} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colors.bg} ${colors.border} border-2`}></div>
              <span className="text-sm text-slate-600">{category}</span>
            </div>
          ))}
        </div>

        {/* Process Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {processes.slice(0, 4).map((process) => {
            const colors = categoryColors[process.category]
            return (
              <div
                key={process.number}
                className={`relative p-5 rounded-xl border ${colors.border} ${colors.bg} transition-all hover:shadow-md`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-7 h-7 rounded-full bg-white ${colors.text} text-sm font-bold flex items-center justify-center border ${colors.border}`}>
                    {process.number}
                  </span>
                  <h3 className="font-semibold text-slate-900">{process.name}</h3>
                </div>
                <p className="text-sm text-slate-600 mb-3">{process.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {process.examples.map((example, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-white/70 text-slate-600 rounded">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {processes.slice(4).map((process) => {
            const colors = categoryColors[process.category]
            return (
              <div
                key={process.number}
                className={`relative p-5 rounded-xl border ${colors.border} ${colors.bg} transition-all hover:shadow-md`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-7 h-7 rounded-full bg-white ${colors.text} text-sm font-bold flex items-center justify-center border ${colors.border}`}>
                    {process.number}
                  </span>
                  <h3 className="font-semibold text-slate-900">{process.name}</h3>
                </div>
                <p className="text-sm text-slate-600 mb-3">{process.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {process.examples.map((example, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-white/70 text-slate-600 rounded">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            Want to document one of these processes?
          </h3>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            Our free Process Mapper tool helps you document any workflow in 5-10 minutes.
            You'll get a professional PDF you can use to train your team or identify automation opportunities.
          </p>
          <Link
            to="/process-mapper"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-600/25"
          >
            Map a Process for Free
          </Link>
        </div>
      </div>
    </section>
  )
}
