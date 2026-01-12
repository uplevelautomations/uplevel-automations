import { Link } from 'react-router-dom'

export default function Services() {
  const services = [
    {
      title: "AI Readiness Assessment",
      description: "A 2-minute quiz to see where AI can help your business and what to tackle first.",
      cta: "Take the Assessment",
      href: "/ai-readiness",
      isLink: true,
      highlight: true
    },
    {
      title: "5-Day AI Roadmap",
      description: "Deep dive into your business, identify 5-8 AI opportunities with ROI projections, and deliver a prioritized 3-month action plan.",
      cta: "Start with Assessment",
      href: "/ai-readiness",
      isLink: true
    },
    {
      title: "Custom AI Automation",
      description: "Know what you want to automate already? I'll scope the work, manage the project, and deliver results.",
      cta: "Book a Call",
      href: "https://cal.com/roy-banwell/30minaicall",
      isLink: false
    }
  ]

  return (
    <section id="services" className="py-24 px-6 bg-white scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            How I can help
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Whether you need clarity, a roadmap, or full implementation — there's a path forward.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className={`relative rounded-xl p-8 transition-all duration-300 hover:-translate-y-1 flex flex-col ${
                service.highlight
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-slate-50 hover:shadow-md'
              }`}
            >
              <h3 className={`text-xl font-semibold mb-3 ${service.highlight ? 'text-white' : 'text-slate-900'}`}>
                {service.title}
              </h3>
              <p className={`leading-relaxed flex-grow ${service.highlight ? 'text-blue-100' : 'text-slate-600'}`}>
                {service.description}
              </p>
              <div className="mt-6">
                {service.isLink ? (
                  <Link
                    to={service.href}
                    className={`inline-block px-5 py-2.5 rounded-lg font-medium transition-all ${
                      service.highlight
                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {service.cta}
                  </Link>
                ) : (
                  <a
                    href={service.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-block px-5 py-2.5 rounded-lg font-medium transition-all ${
                      service.highlight
                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {service.cta}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
