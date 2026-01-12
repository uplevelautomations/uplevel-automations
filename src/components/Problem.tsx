export default function Problem() {
  const painPoints = [
    {
      number: "1",
      title: "Too much noise",
      description: "Everyone's talking about AI, but most of it is hype, and none of it is specific to your business."
    },
    {
      number: "2",
      title: "No clear starting point",
      description: "You've seen the tools, maybe tried a few things, but you don't know what's actually worth your time."
    },
    {
      number: "3",
      title: "Scaling shouldn't mean more hiring",
      description: "You want to grow without adding headcount, but you're not sure how AI actually fits."
    }
  ]

  return (
    <section id="problem" className="relative py-24 px-6 overflow-hidden scroll-mt-20">
      {/* Extended background from hero */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-slate-50"></div>


      <div className="relative max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight text-center mb-16">
          You know AI can help.<br className="hidden sm:block" /> You just don't know where to start.
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <span className="inline-block text-4xl font-bold text-blue-200 mb-4 group-hover:text-blue-300 transition-colors">
                {point.number}
              </span>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {point.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
