import { useState } from 'react'
import { Link } from 'react-router-dom'
import Cal from '@calcom/embed-react'

// Types
interface Question {
  id: string
  question: string
  type: 'select' | 'text'
  hint?: string
  options?: { label: string; value: string; score?: number }[]
  conditional?: { questionId: string; values: string[] }
}

interface Answers {
  [key: string]: string
}

// Questions data based on spec
const questions: Question[] = [
  {
    id: 'q1',
    question: 'How much time do you and your team spend each week on repetitive, manual tasks?',
    type: 'select',
    hint: 'Add up hours across your whole team. Think: data entry, copying info between systems, sending routine emails, scheduling, invoice processing, etc.',
    options: [
      { label: 'Less than 10 hours', value: 'less-10', score: 5 },
      { label: '10-25 hours', value: '10-25', score: 10 },
      { label: '25-50 hours', value: '25-50', score: 15 },
      { label: 'More than 50 hours', value: 'more-50', score: 20 },
    ],
  },
  {
    id: 'q2',
    question: 'Do you have documented processes for your core operations?',
    type: 'select',
    hint: 'SOPs, checklists, training docs — anything that explains how to do a task without asking someone.',
    options: [
      { label: "No, most things are in people's heads", value: 'no', score: 0 },
      { label: 'Partially — some things are written down', value: 'partial', score: 6 },
      { label: 'Yes, we have SOPs for most key processes', value: 'yes', score: 12 },
    ],
  },
  {
    id: 'q2a',
    question: 'Where are your processes documented?',
    type: 'select',
    conditional: { questionId: 'q2', values: ['partial', 'yes'] },
    options: [
      { label: 'Notion, Google Docs, or similar', value: 'docs' },
      { label: 'Shared drives or folders', value: 'drives' },
      { label: 'Project management tool (Asana, Monday, etc.)', value: 'pm-tool' },
      { label: 'Physical documents or scattered locations', value: 'scattered' },
    ],
  },
  {
    id: 'q3',
    question: "What's the biggest bottleneck to growing your business right now?",
    type: 'select',
    options: [
      { label: 'Finding and training good people', value: 'people' },
      { label: 'My own time and bandwidth', value: 'time' },
      { label: 'Generating enough leads or sales', value: 'leads' },
      { label: 'Cash flow or capital', value: 'cashflow' },
      { label: 'Something else', value: 'other' },
    ],
  },
  {
    id: 'q4',
    question: 'When your team encounters a problem, what usually happens?',
    type: 'select',
    hint: 'Think about day-to-day operational issues — customer complaints, scheduling conflicts, equipment problems.',
    options: [
      { label: 'They come to me for direction', value: 'come-to-me', score: 4 },
      { label: 'They try to solve it but often need my input', value: 'need-input', score: 8 },
      { label: 'They handle most issues independently', value: 'independent', score: 12 },
    ],
  },
  {
    id: 'q5',
    question: 'How aligned is your team on priorities and goals?',
    type: 'select',
    options: [
      { label: 'Not very — people work in silos', value: 'silos', score: 4 },
      { label: 'Somewhat — but communication gaps exist', value: 'gaps', score: 8 },
      { label: 'Very aligned — everyone knows the priorities', value: 'aligned', score: 12 },
    ],
  },
  {
    id: 'q6',
    question: "What's your current situation with AI?",
    type: 'select',
    options: [
      { label: "I'm skeptical — not sure AI is right for my business", value: 'skeptic', score: 0 },
      { label: "I know AI could help but I haven't done anything yet", value: 'aware', score: 10 },
      { label: "I've tried AI tools for small things like writing or research", value: 'tried', score: 12 },
      { label: "I'm actively looking for help implementing AI in my business", value: 'looking', score: 16 },
      { label: "We've already built automations or have technical staff handling it", value: 'advanced', score: 16 },
    ],
  },
  {
    id: 'q7',
    question: 'If you had a clear path to save time or increase profits using AI, how likely are you to invest in it?',
    type: 'select',
    options: [
      { label: "Not likely — I'm skeptical or budget-constrained", value: 'not-likely', score: 0 },
      { label: "Somewhat likely — I'd need to see proof first", value: 'somewhat', score: 5 },
      { label: "Likely — I'm open if the ROI is clear", value: 'likely', score: 10 },
      { label: "Very likely — I'm actively looking for solutions", value: 'very-likely', score: 15 },
      { label: "Definitely — I'm ready to invest now", value: 'definitely', score: 20 },
    ],
  },
  {
    id: 'q8',
    question: 'Describe your business in one sentence.',
    type: 'text',
    hint: 'Example: "We run a residential cleaning company with 15 employees serving the Denver metro area."',
  },
  {
    id: 'q9',
    question: "What's your approximate annual revenue?",
    type: 'select',
    options: [
      { label: 'Under $500k', value: 'under-500k', score: 0 },
      { label: '$500k - $1M', value: '500k-1m', score: 4 },
      { label: '$1M - $3M', value: '1m-3m', score: 6 },
      { label: '$3M - $10M', value: '3m-10m', score: 8 },
      { label: 'Over $10M', value: 'over-10m', score: 8 },
    ],
  },
]

// Calculate score
function calculateScore(answers: Answers): number {
  let score = 0
  questions.forEach((q) => {
    if (q.options) {
      const answer = answers[q.id]
      const option = q.options.find((o) => o.value === answer)
      if (option?.score !== undefined) {
        score += option.score
      }
    }
  })
  return score
}

// Check if lead is disqualified
function isDisqualified(answers: Answers): boolean {
  // DQ if revenue under $500k
  if (answers.q9 === 'under-500k') return true

  // DQ if AI skeptic AND won't invest
  if (answers.q6 === 'skeptic' && answers.q7 === 'not-likely') return true

  // DQ if cash flow problems AND won't invest
  if (answers.q3 === 'cashflow' && answers.q7 === 'not-likely') return true

  return false
}

// Generate dynamic feedback with detailed insights
function generateFeedback(answers: Answers): { strengths: string[]; improvements: string[]; quickWins: string[] } {
  const strengths: string[] = []
  const improvements: string[] = []
  const quickWins: string[] = []

  // Q1: Manual hours
  if (['25-50', 'more-50'].includes(answers.q1)) {
    strengths.push('Significant time on repetitive tasks means high automation ROI potential')
    if (answers.q1 === 'more-50') {
      quickWins.push('With 50+ hours of manual work weekly, even a 30% reduction through automation could save 15+ hours/week')
    } else {
      quickWins.push('25-50 hours of manual work is a strong foundation for automation. Focus on the most repetitive tasks first.')
    }
  } else if (answers.q1 === 'less-10') {
    improvements.push('Low volume of repetitive tasks. Automation ROI may be limited until you scale.')
  }

  // Q2: Documentation
  if (answers.q2 === 'yes') {
    strengths.push('Strong process documentation. You can automate what you can document.')
  } else if (answers.q2 === 'partial') {
    strengths.push('Some processes already documented gives you a head start on automation')
    quickWins.push('Prioritize documenting your highest-volume repetitive tasks first')
  } else if (answers.q2 === 'no') {
    improvements.push('Processes live in people\'s heads. This needs to change before AI can help.')
    quickWins.push('Start by documenting your top 3 most frequent tasks. Even rough bullet points beat nothing.')
  }

  // Q4: Team autonomy
  if (answers.q4 === 'independent') {
    strengths.push('Team operates independently, so automation won\'t create bottlenecks')
  } else if (answers.q4 === 'need-input') {
    strengths.push('Team is semi-autonomous, which is a good foundation for automation')
  } else if (answers.q4 === 'come-to-me') {
    improvements.push('You\'re the bottleneck. AI can help, but decision frameworks come first.')
    quickWins.push('Pick one recurring decision and create a simple rule your team can follow without you')
  }

  // Q5: Team alignment
  if (answers.q5 === 'aligned') {
    strengths.push('Team is aligned on priorities, so automation projects will have buy-in')
  } else if (answers.q5 === 'gaps') {
    improvements.push('Communication gaps exist. Automation can help, but alignment matters.')
  } else if (answers.q5 === 'silos') {
    improvements.push('Team works in silos, which limits what automation can do')
  }

  // Q6: AI situation
  if (answers.q6 === 'looking' || answers.q6 === 'advanced') {
    strengths.push('Already engaged with AI, so you know what\'s possible')
  } else if (answers.q6 === 'tried') {
    strengths.push('You\'ve experimented with AI and are ready to go deeper')
  } else if (answers.q6 === 'aware') {
    strengths.push('Open to AI. You just need the right guidance.')
  }

  // Q3: Bottleneck-specific insights
  if (answers.q3 === 'time') {
    quickWins.push('Your bandwidth is the bottleneck. Automation should target tasks that eat your time.')
  } else if (answers.q3 === 'people') {
    quickWins.push('Hiring is hard. Automation can multiply your existing team\'s capacity instead.')
  } else if (answers.q3 === 'leads') {
    quickWins.push('Lead generation can be partially automated: follow-up sequences, qualification, outreach.')
  }

  return { strengths, improvements, quickWins }
}

// Generate DQ tips
function getDQTips(answers: Answers): string[] {
  const tips: string[] = []

  if (answers.q2 === 'no') {
    tips.push('Start by documenting your top 3 processes. Even rough notes in Google Docs beats having everything in people\'s heads.')
  }

  if (answers.q4 === 'come-to-me') {
    tips.push('Pick one recurring decision your team asks you about and create a simple rule they can follow without you.')
  }

  if (answers.q6 === 'skeptic') {
    tips.push('Try using ChatGPT for one small task this week — drafting an email, summarizing meeting notes. See what clicks.')
  }

  if (answers.q9 === 'under-500k') {
    tips.push('Focus on revenue first. AI becomes a multiplier once you have volume to work with.')
  }

  if (answers.q3 === 'cashflow') {
    tips.push('Tighten up cash flow before investing in new systems. AI has real ROI, but it\'s not free.')
  }

  return tips.slice(0, 3)
}

export default function Assessment() {
  const [hasStarted, setHasStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [contactInfo, setContactInfo] = useState({ name: '', email: '', phone: '' })
  const [showResults, setShowResults] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)


  // Get visible questions (filter out conditionals that don't apply)
  const visibleQuestions = questions.filter((q) => {
    if (!q.conditional) return true
    const conditionAnswer = answers[q.conditional.questionId]
    return q.conditional.values.includes(conditionAnswer)
  })

  const totalSteps = visibleQuestions.length + 1 // +1 for contact form
  const progress = ((currentStep + 1) / totalSteps) * 100

  const currentQuestion = visibleQuestions[currentStep]
  const isContactStep = currentStep >= visibleQuestions.length

  const handleOptionSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

  const handleNext = () => {
    if (currentStep < visibleQuestions.length) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const canProceed = () => {
    if (isContactStep) {
      return contactInfo.name && contactInfo.email
    }
    if (currentQuestion.type === 'text') {
      return (answers[currentQuestion.id] || '').length > 0
    }
    return !!answers[currentQuestion.id]
  }

  const handleSubmit = () => {
    // Show results immediately
    setShowResults(true)

    // Fire webhook in background (don't await)
    const score = calculateScore(answers)
    const qualified = !isDisqualified(answers)

    const submissionData = {
      timestamp: new Date().toISOString(),
      name: contactInfo.name,
      email: contactInfo.email,
      phone: contactInfo.phone,
      score,
      qualified,
      q1: answers.q1 || '',
      q2: answers.q2 || '',
      q2a: answers.q2a || '',
      q3: answers.q3 || '',
      q4: answers.q4 || '',
      q5: answers.q5 || '',
      q6: answers.q6 || '',
      q7: answers.q7 || '',
      q8: answers.q8 || '',
      q9: answers.q9 || '',
    }

    // Send to Google Sheets in background
    fetch('https://script.google.com/macros/s/AKfycby3ZYCsepTTivWqZ85uydIwZe6lQXKqdg29rg3CoNys3MvxWOTd-TSrKy1tytxBQ95XiQ/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    }).catch(error => {
      console.error('Error submitting to Google Sheets:', error)
    })
  }

  // Intro screen
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100 relative overflow-hidden flex flex-col">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Decorative blurred circles */}
        <div className="absolute top-20 right-[10%] w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[5%] w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />

        {/* Navbar */}
        <nav className="relative z-50 bg-transparent">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <Link to="/" className="font-semibold text-slate-900 text-lg">
              UpLevel Automations
            </Link>
          </div>
        </nav>

        {/* Centered content */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-6 pb-20">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              You Can't Automate Chaos
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6">
              Is Your Business Ready for{' '}
              <span className="text-blue-600">AI Automation?</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Take our free readiness assessment to discover if your processes are mature enough for AI automation. Get your score and personalized roadmap in minutes.
            </p>

            {/* CTA button */}
            <button
              onClick={() => setHasStarted(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/25 mb-12"
            >
              Check Your Readiness Score
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            {/* Trust indicators */}
            <div className="text-sm text-slate-500 mb-2">
              Helping small businesses build automation-ready processes
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                AI Readiness Score
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Personalized Roadmap
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Expert Guidance
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Loading screen while submitting
  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100 relative overflow-hidden flex flex-col">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Decorative blurred circles */}
        <div className="absolute top-20 right-[10%] w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[5%] w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />

        {/* Navbar */}
        <nav className="relative z-50 bg-transparent">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <Link to="/" className="font-semibold text-slate-900 text-lg">
              UpLevel Automations
            </Link>
          </div>
        </nav>

        {/* Centered loading content */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            {/* Animated spinner */}
            <div className="mb-8">
              <svg className="w-16 h-16 mx-auto text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              Analyzing Your Results
            </h2>
            <p className="text-slate-600 text-lg max-w-md mx-auto">
              We're generating your personalized AI readiness score and recommendations...
            </p>
          </div>
        </main>
      </div>
    )
  }

  // Results page
  if (showResults) {
    const score = calculateScore(answers)
    const qualified = !isDisqualified(answers)
    const { strengths, improvements, quickWins } = generateFeedback(answers)
    const dqTips = getDQTips(answers)

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Decorative blurred circles */}
        <div className="absolute top-20 right-[10%] w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[5%] w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />

        {/* Navbar */}
        <nav className="relative z-50 border-b border-slate-200/50 bg-white/60 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="font-semibold text-slate-900 text-lg">
              UpLevel Automations
            </Link>
          </div>
        </nav>

        {/* Results content */}
        <main className="relative z-10 pt-16 pb-20 px-6">
          <div className="max-w-2xl mx-auto">
            {/* Score display */}
            <div className="text-center mb-12">
              <p className="text-slate-600 mb-2">Your AI Readiness Score</p>
              <div className="text-6xl md:text-7xl font-bold text-slate-900 mb-2">
                {score}<span className="text-3xl text-slate-400">/100</span>
              </div>
            </div>

            {/* Dynamic feedback */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
              {strengths.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    What's working well
                  </h3>
                  <ul className="space-y-2">
                    {strengths.map((s, i) => (
                      <li key={i} className="text-slate-600 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {improvements.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    What needs work
                  </h3>
                  <ul className="space-y-2">
                    {improvements.map((s, i) => (
                      <li key={i} className="text-slate-600 flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quick Wins - shown for everyone with quickWins */}
            {quickWins.length > 0 && (
              <div className="bg-blue-50 rounded-2xl border border-blue-100 p-8 mb-8">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Your Quick Wins
                </h3>
                <p className="text-slate-600 text-sm mb-4">Based on your answers, here's what to focus on:</p>
                <ul className="space-y-3">
                  {quickWins.slice(0, 3).map((win, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
                        {i + 1}
                      </div>
                      <p className="text-slate-700">{win}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Qualified: Pitch the call */}
            {qualified ? (
              <>
                {/* Big CTA */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Ready to put AI to work for your business?
                  </h2>
                  <p className="text-blue-100 text-lg">
                    You've got the foundation. Now let's build your roadmap.
                  </p>
                </div>

                {/* Your Next Step: 5-Day AI Roadmap */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Your Next Step</p>
                      <h3 className="text-xl font-bold text-slate-900">The 5-Day AI Roadmap</h3>
                    </div>
                  </div>

                  <p className="text-slate-600 mb-6">
                    In 5 days, you'll go from "AI sounds cool" to "here's exactly where to start." We'll map your operations, identify your highest-ROI automation opportunity, and give you a clear action plan.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-slate-600 text-sm">Deep-dive into your specific processes</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-slate-600 text-sm">Prioritized list of automation opportunities</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-slate-600 text-sm">ROI projections for top opportunities</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-slate-600 text-sm">Clear action plan you can execute</p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-blue-800 text-sm">
                      <span className="font-semibold">Book a call to get started.</span> We'll review your assessment, discuss your business, and see if the 5-Day AI Roadmap is a fit.
                    </p>
                  </div>
                </div>

                {/* What happens on the call */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">What happens on the call</h3>
                  <p className="text-slate-600 mb-6">30 minutes. No fluff. Here's exactly what we'll cover:</p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Unpack your assessment results</p>
                        <p className="text-sm text-slate-500">I'll walk through what your score actually means and where the gaps are</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Discuss your biggest bottlenecks</p>
                        <p className="text-sm text-slate-500">What's eating your time? Where are the manual tasks piling up?</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">See if the 5-Day Roadmap is right for you</p>
                        <p className="text-sm text-slate-500">If it's a fit, we'll map out next steps. If not, you'll still leave with clarity.</p>
                      </div>
                    </div>
                  </div>

                  {/* Risk reversal */}
                  <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl">
                    <p className="text-green-800 text-sm">
                      <span className="font-semibold">Worst case?</span> You walk away with a clearer picture of what's possible and what to focus on first.
                    </p>
                  </div>
                </div>

                {/* Who is Roy - Now comes after the pitch */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Who you'll be working with</h3>
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Photo and name */}
                    <div className="md:w-1/3 text-center md:text-left">
                      <img
                        src="/roy-headshot.png"
                        alt="Roy Banwell"
                        className="w-32 h-32 mx-auto md:mx-0 rounded-2xl object-cover mb-4"
                      />
                      <h4 className="text-xl font-bold text-slate-900">Roy Banwell</h4>
                      <p className="text-slate-500">AI Transformation Consultant</p>

                      {/* Stats under photo */}
                      <div className="flex justify-center md:justify-start gap-4 mt-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">4+</div>
                          <div className="text-xs text-slate-500">Years in AI</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">$2M+</div>
                          <div className="text-xs text-slate-500">AI Sold</div>
                        </div>
                      </div>
                    </div>

                    {/* Bio and credentials */}
                    <div className="md:w-2/3">
                      <div className="space-y-4 text-slate-600">
                        <p>
                          I've spent 4+ years in AI, scoping and selling systems at startups that have raised over $50M. I've personally sold over $2M in AI solutions designed to generate pipeline and drive revenue for businesses like yours.
                        </p>
                        <p>
                          I'm a certified AI Transformation Consultant through the AAA Mastermind, the top AI transformation community in the world.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonials - Easy to add later */}
                {/*
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">What others are saying</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 rounded-xl p-6">
                      <p className="text-slate-600 italic mb-4">"Quote here..."</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                        <div>
                          <p className="font-medium text-slate-900">Name</p>
                          <p className="text-sm text-slate-500">Title, Company</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                */}

                {/* Book the call */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">Book your free strategy call</h3>
                    <p className="text-slate-500 text-sm">Pick a time that works for you</p>
                  </div>
                  <Cal
                    calLink="roy-banwell/ai-strategy-call"
                    style={{ width: '100%', height: '100%', overflow: 'scroll' }}
                    config={{
                      layout: 'month_view',
                    }}
                  />
                </div>
              </>
            ) : (
              /* DQ'd: Give advice */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  You're not quite ready — and that's okay.
                </h2>
                <p className="text-slate-600 mb-6">
                  AI works best when there's enough scale and structure to build on. Based on your answers, here's what to focus on first:
                </p>

                <div className="space-y-4 mb-8">
                  {dqTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-sm font-medium">
                        {i + 1}
                      </div>
                      <p className="text-slate-600">{tip}</p>
                    </div>
                  ))}
                </div>

                <p className="text-slate-500 text-sm">
                  I'll stay in touch with practical tips on AI and automation. When the time is right, you'll know where to find me.
                </p>
              </div>
            )}

            {/* Back to home */}
            <div className="text-center mt-12">
              <Link
                to="/"
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Assessment form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100 relative overflow-hidden flex flex-col">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Decorative blurred circles */}
      <div className="absolute top-20 right-[10%] w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-[5%] w-80 h-80 bg-blue-100/40 rounded-full blur-3xl" />

      {/* Navbar */}
      <nav className="relative z-50 border-b border-slate-200/50 bg-white/60 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="font-semibold text-slate-900 text-lg">
            UpLevel Automations
          </Link>
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {currentStep + 1} of {totalSteps}
          </span>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="relative z-40 h-1 bg-slate-200/50">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-xl">
          {isContactStep ? (
            /* Contact form */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-3">
                Almost there! Get your results.
              </h2>
              <p className="text-slate-600 mb-8">
                Enter your info below to see your AI Readiness Score and personalized recommendations.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                    Phone <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-4">
                By submitting, you agree to receive your results and occasional emails from UpLevel Automations. You can unsubscribe anytime.
              </p>
            </div>
          ) : (
            /* Question */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-3">
                {currentQuestion.question}
              </h2>
              {currentQuestion.hint && (
                <p className="text-slate-500 text-sm mb-8">{currentQuestion.hint}</p>
              )}
              {!currentQuestion.hint && <div className="mb-5" />}

              {currentQuestion.type === 'select' ? (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleOptionSelect(option.value)}
                      className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                        answers[currentQuestion.id] === option.value
                          ? 'border-blue-600 bg-blue-50 shadow-sm'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <span className={answers[currentQuestion.id] === option.value ? 'text-blue-900 font-medium' : 'text-slate-700'}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow resize-none"
                  rows={4}
                  placeholder="Type your answer here..."
                />
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {isContactStep ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                  canProceed() && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'See My Results'}
                {!isSubmitting && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                  canProceed()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Next
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
