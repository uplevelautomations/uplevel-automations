import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'

// Types
interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface UserInfo {
  name: string
  email: string
}

interface ProcessData {
  processName: string
  businessName: string
  businessType: string
  teamSize: string
  processOwner: string
  steps: Array<{
    number: number
    title: string
    actor: string
    details: string[]
  }>
  tools: Array<{ name: string; purpose: string }>
  painPoints: string[]
  duration: string
  decisionPoints: Array<{
    location: string
    condition: string
    paths: string[]
  }>
  automationOpportunities?: Array<{
    title: string
    observation: string
    solution: string
    impact: string
  }>
}

type Stage = 'email' | 'mode-select' | 'chat' | 'complete'
type MapMode = 'quick' | 'deep'

// Quick Map system prompt (10-15 minutes, high-level)
const QUICK_MAP_PROMPT = `You are an expert business process analyst helping someone quickly capture the essentials of a business process. Your goal is to get a clear overview of how the process works — enough to identify the main steps, who's involved, and where the friction is — in about 10-15 minutes.

## Phase Markers

At the START of each response, include a phase marker on its own line:
- [PHASE:1] — Context & Overview
- [PHASE:2] — Main Steps
- [PHASE:3] — Pain Points
- [PHASE:4] — Wrap-up

## Your Approach

**Be conversational but purposeful.** You're having a real discovery conversation, just one that stays at the high level. Every question should move toward a clear picture of the process.

**Stay high-level.** You're mapping the forest, not the trees. Capture the main steps and flow. Don't dig into sub-steps, exceptions, edge cases, or "what if" scenarios.

**Accept general answers.** You don't need to know exactly how long each step takes or what happens in every edge case. If they say "a few days" or "my team handles it," that's enough.

**One thing at a time.** Ask one question per message. Keep it conversational. Don't overwhelm.

**Summarize and confirm.** After gathering details on a section, reflect it back to confirm understanding before moving on. This builds confidence that you're tracking.

## Conversation Structure

### Phase 1: Context & Overview
Get the basics:
- What's the process you want to map?
- What does your business do?
- Who's involved in this process?
- What triggers it to start, and what does "done" look like?

### Phase 2: Main Steps
Walk through the process at a high level:
- What are the major steps from start to finish?
- What tools or systems are used?
- Don't dig into sub-steps, inputs/outputs for each step, or exceptions — capture the flow, not the details

### Phase 3: Pain Points
Quick hit on friction:
- What's the most annoying or time-consuming part?
- Where do things get stuck or fall through the cracks?
- Roughly how long does the whole process take?

Don't ask for breakdowns or quantification.

### Phase 4: Wrap-up
Summarize what you've captured:
- Provide a summary of the process as you understand it
- Confirm you've got it right
- Note any obvious automation opportunities based on what you heard

## Tone & Style
- Warm and professional, like a consultant who's done this a hundred times
- Plain language, no jargon
- Keep responses focused — don't ramble, but don't be curt either
- Acknowledge what they've shared before asking more

## Important Rules
1. **Stay high-level.** You're mapping the shape of the process, not every detail.
2. **Never ask them to quantify or break down.** No "can you estimate hours per step" or "what percentage of the time does X happen."
3. **If they say they're done or want to wrap up, do it immediately.**

When the conversation is complete, end your message with exactly this marker on its own line:
[PROCESS_COMPLETE]`

// Deep Dive system prompt (30-45 minutes, detailed)
const DEEP_DIVE_PROMPT = `You are an expert business process analyst helping someone document and map out a business process. Your goal is to extract enough detail that the process could be handed to someone unfamiliar with the business and they could execute it, or that an automation engineer could identify clear opportunities for improvement.

## Phase Markers

At the START of each response, include a phase marker on its own line (this powers the progress indicator):
- [PHASE:1] — Business Context
- [PHASE:2] — Process Overview
- [PHASE:3] — People & Roles
- [PHASE:4] — Step-by-Step Walkthrough
- [PHASE:5] — Tools & Systems
- [PHASE:6] — Pain Points & Bottlenecks
- [PHASE:7] — Confirmation & Wrap-up

## Your Approach

**Be conversational but purposeful.** You're not filling out a form — you're having a discovery conversation. But every question should move toward a complete picture of the process.

**Challenge vagueness.** When someone says things like:
- "We follow up with them" → Ask: How? Email? Phone? What triggers the follow-up? How long after? Who decides?
- "We check if they're qualified" → Ask: What specific criteria? Is there a checklist? Who makes the call? What happens to unqualified ones?
- "It goes to the team" → Ask: Which team? One person or multiple? How is it assigned? How do they know it's arrived?
- "We process the order" → Ask: What does processing actually involve? What systems? What steps?

**Identify handoffs and gaps.** These are where things break down. When responsibility shifts from one person/team to another, dig into:
- How does information get passed?
- How does the next person know they have something to do?
- What gets lost or delayed at this point?

**Surface pain points.** Ask about:
- Where things get stuck or delayed
- What causes errors or rework
- What's annoying or tedious
- What they wish was different

**Summarize and confirm.** After gathering details on a section, reflect it back to confirm understanding before moving on.

## Conversation Structure

Guide the conversation through these phases, but be flexible — sometimes information comes out of order and that's fine.

### Phase 1: Business Context
Get a quick sense of their business so you can understand the process in context:
- What does your business do? (Just a sentence or two — enough to understand the context)
- How big is your team? (Rough sense: just you, a few people, a larger team?)

### Phase 2: Process Overview
Understand the process itself:
- What is this process called? (Or what would you call it?)
- What triggers this process to start? (A customer action? A time-based trigger? An internal request?)
- What's the end result when this process is done successfully?
- Roughly how often does this process run? (Daily? Weekly? Per customer?)

### Phase 3: People & Roles
- Who's involved in this process? (Job titles/roles, not specific names)
- Who "owns" this process — who's responsible if it breaks down?
- Are there any external parties involved? (Customers, vendors, partners?)

### Phase 4: Step-by-Step Walkthrough
This is the meat of the conversation. For each step, extract:
- What happens (the action)
- Who does it (the role)
- What they need (inputs, information, access)
- What tools/systems they use
- How long it typically takes
- What triggers the next step

Watch for:
- Decision points (if X then Y, else Z)
- Parallel paths (things that happen simultaneously)
- Loops (steps that repeat until a condition is met)
- Exceptions (what happens when things go wrong)

### Phase 5: Tools & Systems
- What software/tools are used throughout this process?
- Are there manual steps that involve spreadsheets, paper, or copy-pasting between systems?
- Where does information "live" at each stage?

### Phase 6: Pain Points & Bottlenecks
- Where does this process get stuck or delayed most often?
- What's the most tedious or annoying part?
- Roughly how long does the whole thing take, end-to-end?
- How much time does each person spend on this?
- If you could wave a magic wand, what would you fix?

**Important:** If the user gives general answers like "all of the above" or a rough total estimate, accept them and move to Phase 7. Don't ask them to break down or quantify further — you have enough.

### Phase 7: Confirmation & Wrap-up
- Provide a complete summary of the process as you understand it
- Ask if anything is missing or incorrect
- Note any areas of uncertainty or "it depends" situations

## Tone & Style
- Be warm and professional, like a consultant who's done this a hundred times
- Use plain language, not business jargon
- Be encouraging — mapping processes can feel tedious, acknowledge their effort
- Be patient with confusion — people often haven't thought about their processes this explicitly before
- Keep responses focused — don't ramble, but don't be curt either

## Output Format
As you gather information, mentally organize it into this structure (you'll use this to generate the final document):

PROCESS_NAME: [name]
TRIGGER: [what starts the process]
END_STATE: [what success looks like]
FREQUENCY: [how often it runs]
OWNER: [who's responsible]

ROLES:
- [Role 1]: [what they do in this process]
- [Role 2]: [what they do in this process]

STEPS:
1. [Step name]
   - Action: [what happens]
   - Actor: [who does it]
   - Inputs: [what they need]
   - Tools: [systems used]
   - Duration: [how long]
   - Output: [what's produced]
   - Notes: [any conditions, exceptions]

2. [Step name]
   ...

DECISION_POINTS:
- At step [X]: If [condition], then [path A], else [path B]

TOOLS_USED:
- [Tool 1]: [used for what]
- [Tool 2]: [used for what]

PAIN_POINTS:
- [Pain point 1]: [brief description]
- [Pain point 2]: [brief description]

PROCESS_DURATION: [rough end-to-end time]

AUTOMATION_OPPORTUNITIES:
- [Opportunity 1]: [what could be automated and why]
- [Opportunity 2]: [what could be automated and why]

## Important Rules
1. **Never assume.** If something isn't clear, ask. Don't fill in gaps with guesses.
2. **Stay focused on one topic per message.** Don't jump between phases or ask about unrelated things in the same response. It's fine to ask follow-up questions on the same topic, but don't bundle "how big is your team?" with "which process do you want to map?" — those are separate conversations.
3. **Acknowledge what you've learned.** Periodically reflect back what you understand so they know you're tracking.
4. **Watch for scope creep.** If they start describing multiple processes, gently steer back: "That sounds like a separate process — let's finish mapping [X] first, then we can tackle that one."
5. **Know when you're done.** When you have enough detail to write a clear, complete process document, start wrapping up. Don't drag it out.
6. **CRITICAL: If the user says they're done, that's enough, or asks you to complete/finish/wrap up — DO IT IMMEDIATELY.** Don't ask more questions. Provide the summary and add the completion marker. Use reasonable defaults for any missing information.

When the conversation is complete and the user confirms the summary is accurate (or explicitly asks you to finish), end your message with exactly this marker on its own line:
[PROCESS_COMPLETE]`

// Phase definitions for each mode
const QUICK_PHASES = [
  { id: 1, name: 'Context & Overview', description: 'Understanding your business and process' },
  { id: 2, name: 'Main Steps', description: 'Walking through the workflow' },
  { id: 3, name: 'Pain Points', description: 'Where things get stuck' },
  { id: 4, name: 'Wrap-up', description: 'Review and finalize' },
]

const DEEP_PHASES = [
  { id: 1, name: 'Business Context', description: 'Understanding your business' },
  { id: 2, name: 'Process Overview', description: 'What triggers this process and what it achieves' },
  { id: 3, name: 'People & Roles', description: 'Who is involved in this process' },
  { id: 4, name: 'Step-by-Step', description: 'Walking through the workflow' },
  { id: 5, name: 'Tools & Systems', description: 'Software and systems used' },
  { id: 6, name: 'Pain Points', description: 'Bottlenecks and frustrations' },
  { id: 7, name: 'Confirmation', description: 'Review and finalize' },
]

// Mode Selection Component
function ModeSelection({ userInfo, onSelect }: { userInfo: UserInfo; onSelect: (mode: MapMode) => void }) {
  return (
    <div className="min-h-[70vh] flex flex-col justify-center">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Hey {userInfo.name}! How detailed do you want to go?
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Choose the depth that fits your needs right now.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Quick Map Option */}
        <button
          onClick={() => onSelect('quick')}
          className="text-left p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Quick Map</h3>
              <p className="text-sm text-slate-500">10-15 minutes</p>
            </div>
          </div>
          <p className="text-slate-600 mb-4">
            Get a clean overview of your process with key steps and automation opportunities. Best for a fast snapshot.
          </p>
          <span className="text-blue-600 font-medium group-hover:underline">
            Start Quick Map →
          </span>
        </button>

        {/* Deep Dive Option */}
        <button
          onClick={() => onSelect('deep')}
          className="text-left p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Deep Dive</h3>
              <p className="text-sm text-slate-500">30-45 minutes</p>
            </div>
          </div>
          <p className="text-slate-600 mb-4">
            Detailed walkthrough of every step, handoff, and edge case. Best for complex processes you want fully documented.
          </p>
          <span className="text-slate-600 font-medium group-hover:underline">
            Start Deep Dive →
          </span>
        </button>
      </div>
    </div>
  )
}

// Email Capture Component
function EmailCapture({ onSubmit }: { onSubmit: (info: UserInfo) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setIsSubmitting(true)

    // Submit to Google Sheets immediately (status: started)
    const startedData = {
      type: 'process-mapper',
      timestamp: new Date().toISOString(),
      name: name.trim(),
      email: email.trim(),
      status: 'started',
      processName: '',
      businessName: '',
      businessType: '',
      teamSize: '',
      stepsCount: '',
      toolsUsed: '',
      painPoints: '',
      duration: '',
      transcript: ''
    }

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(startedData),
    }).catch(error => {
      console.error('Error submitting start to Google Sheets:', error)
    })

    setTimeout(() => {
      onSubmit({ name: name.trim(), email: email.trim() })
    }, 300)
  }

  return (
    <div className="min-h-[70vh] flex flex-col justify-center">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-6">
          Free Tool
        </span>

        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
          Map Your <span className="text-blue-600">Business Process</span>
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Answer a few questions about one of your workflows, and we'll generate a
          professional process document you can use to train your team, onboard new hires,
          or identify automation opportunities.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
        {[
          { title: '10-15 Minutes', desc: 'Quick conversation to capture your process' },
          { title: 'Professional PDF', desc: 'Clean documentation you can actually use' },
          { title: 'Automation Ideas', desc: 'Get recommendations for what to automate' },
        ].map((item, i) => (
          <div key={i} className="text-center p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="text-slate-900 font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              required
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@company.com"
              required
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !email.trim()}
            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-600/25 mt-4"
          >
            {isSubmitting ? 'Starting...' : 'Start Mapping My Process'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          We'll email you the completed process document. No spam, ever.
        </p>
      </div>
    </div>
  )
}

// Progress Indicator Component
function ProgressIndicator({ currentPhase, mode }: { currentPhase: number; mode: MapMode }) {
  const phases = mode === 'quick' ? QUICK_PHASES : DEEP_PHASES
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">Progress</span>
        <span className="text-sm text-slate-500">Step {currentPhase} of {phases.length}</span>
      </div>
      <div className="flex gap-1 mb-2">
        {phases.map((phase) => (
          <div
            key={phase.id}
            className={`h-2 flex-1 rounded-full transition-colors ${
              phase.id < currentPhase
                ? 'bg-green-500'
                : phase.id === currentPhase
                ? 'bg-blue-500'
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <div className="text-sm text-slate-600">
        <span className="font-medium">{phases[currentPhase - 1]?.name}</span>
        <span className="text-slate-400 ml-2">— {phases[currentPhase - 1]?.description}</span>
      </div>
    </div>
  )
}

// Chat Interface Component
function ChatInterface({
  userInfo,
  mode,
  onComplete
}: {
  userInfo: UserInfo
  mode: MapMode
  onComplete: (data: ProcessData, messages: Message[]) => void
}) {
  // Select prompt and initial message based on mode
  const systemPrompt = mode === 'quick' ? QUICK_MAP_PROMPT : DEEP_DIVE_PROMPT
  const phases = mode === 'quick' ? QUICK_PHASES : DEEP_PHASES

  const initialMessage = mode === 'quick'
    ? `[PHASE:1]

Hi ${userInfo.name}! Let's quickly map out one of your business processes. This should take about 10-15 minutes — I'll ask you about the main steps, who's involved, and where things get stuck.

What process would you like to capture today?`
    : `[PHASE:1]

Hi ${userInfo.name}! I'm here to help you map out one of your business processes. By the end of our conversation, you'll have a clear, documented workflow that shows exactly how this process works — who does what, when, and how.

To get started, tell me a bit about your business and what process you'd like to map out. For example: "I run a marketing agency and I want to map out how we onboard new clients."`

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: initialMessage
    }
  ])
  const [currentPhase, setCurrentPhase] = useState(1)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [hasTriggeredAbandon, setHasTriggeredAbandon] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const abandonTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          setInput(prev => prev + finalTranscript)
        }
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [])

  // Abandon detection - 10 minute inactivity timer
  const ABANDON_TIMEOUT = 10 * 60 * 1000 // 10 minutes

  const sendAbandonAlert = () => {
    if (hasTriggeredAbandon || isComplete) return
    setHasTriggeredAbandon(true)

    const transcript = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')

    fetch('/api/send-abandon-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userInfo.name,
        email: userInfo.email,
        mode,
        currentPhase,
        messageCount: messages.length,
        transcript
      }),
    }).catch(error => {
      console.error('Error sending abandon alert:', error)
    })
  }

  const resetAbandonTimer = () => {
    if (abandonTimerRef.current) {
      clearTimeout(abandonTimerRef.current)
    }
    if (!isComplete && !hasTriggeredAbandon) {
      abandonTimerRef.current = setTimeout(sendAbandonAlert, ABANDON_TIMEOUT)
    }
  }

  // Start abandon timer on mount, reset on message changes
  useEffect(() => {
    resetAbandonTimer()
    return () => {
      if (abandonTimerRef.current) {
        clearTimeout(abandonTimerRef.current)
      }
    }
  }, [messages, isComplete])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          systemPrompt,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      const assistantMessage = data.content

      // Parse phase marker from response
      const phaseMatch = assistantMessage.match(/\[PHASE:(\d)\]/)
      if (phaseMatch) {
        const newPhase = parseInt(phaseMatch[1], 10)
        if (newPhase >= 1 && newPhase <= phases.length) {
          setCurrentPhase(newPhase)
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }])

      // Auto-trigger PDF generation when process is complete
      if (assistantMessage.includes('[PROCESS_COMPLETE]')) {
        setIsComplete(true)
        // Small delay to let the message render, then auto-generate
        setTimeout(() => {
          handleGeneratePDFAuto([...messages, { role: 'user', content: userMessage }, { role: 'assistant', content: assistantMessage }])
        }, 1500)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneratePDFAuto = async (allMessages: Message[]) => {
    setIsLoading(true)
    try {
      const extractResponse = await fetch('/api/extract-process-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages }),
      })

      if (!extractResponse.ok) throw new Error('Failed to extract data')

      const processData: ProcessData = await extractResponse.json()
      onComplete(processData, allMessages)
    } catch (error) {
      console.error('Extraction error:', error)
      alert('Sorry, there was an error generating your document. Please try again.')
      setIsLoading(false)
    }
  }

  const handleGeneratePDF = async () => {
    setIsLoading(true)
    try {
      const extractResponse = await fetch('/api/extract-process-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })

      if (!extractResponse.ok) throw new Error('Failed to extract data')

      const processData: ProcessData = await extractResponse.json()
      onComplete(processData, messages)
    } catch (error) {
      console.error('Extraction error:', error)
      alert('Sorry, there was an error generating your document. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
      {/* Progress Indicator */}
      {!isComplete && <ProgressIndicator currentPhase={currentPhase} mode={mode} />}

      {/* Chat Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Process Mapping Session</h2>
          <p className="text-sm text-slate-500">with {userInfo.name}</p>
        </div>
        {isComplete && isLoading && (
          <div className="flex items-center gap-3 px-6 py-2.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Generating your document...
          </div>
        )}
        {isComplete && !isLoading && (
          <button
            onClick={handleGeneratePDF}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-600/25"
          >
            Generate My Process Document
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 shadow-sm'
              }`}
            >
              {message.role === 'user' ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              ) : (
                <div className="text-sm leading-relaxed prose prose-sm prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-slate-800">
                  <ReactMarkdown>
                    {message.content
                      .replace('[PROCESS_COMPLETE]', '')
                      .replace(/\[PHASE:\d\]\n*/g, '')
                      .trim()}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isComplete ? (
        <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Listening..." : "Type your response..."}
                rows={2}
                disabled={isLoading}
                className={`w-full px-4 py-3 pr-12 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50 ${isListening ? 'border-red-400 ring-2 ring-red-200' : 'border-slate-300'}`}
              />
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                    isListening
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                  } disabled:opacity-50`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? (
                    <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all self-end"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Press Enter to send, Shift+Enter for new line{speechSupported && ' • Click mic to dictate'}
          </p>
        </form>
      ) : (
        <div className="mt-4 pt-4 border-t border-slate-200 text-center">
          <p className="text-slate-600 mb-4">
            Your process has been mapped! Click the button above to generate your document.
          </p>
        </div>
      )}
    </div>
  )
}

// Google Apps Script URL (same as Assessment)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzs806_T0UUwSAMwZa_ppjAobgf4STx_85d3pGjGCc28fr4GTRnG6RkBAm-BhMVBy-XaA/exec'

// Process Complete Component
function ProcessComplete({
  processData,
  userInfo,
  mode,
  messages
}: {
  processData: ProcessData
  userInfo: UserInfo
  mode: MapMode
  messages: Message[]
}) {
  const [isGenerating, setIsGenerating] = useState(true)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasSubmittedLead, setHasSubmittedLead] = useState(false)

  useEffect(() => {
    generatePDF()
  }, [])

  const submitToGoogleSheets = () => {
    const submissionData = {
      type: 'process-mapper',
      timestamp: new Date().toISOString(),
      name: userInfo.name,
      email: userInfo.email,
      status: 'completed',
      mode,
      processName: processData.processName,
      businessName: processData.businessName,
      businessType: processData.businessType,
      teamSize: processData.teamSize,
      stepsCount: processData.steps.length,
      toolsUsed: processData.tools.map(t => t.name).join(', '),
      painPoints: processData.painPoints.join('; '),
      duration: processData.duration,
      transcript: messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')
    }

    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData),
    }).catch(error => {
      console.error('Error submitting to Google Sheets:', error)
    })
  }

  const sendEmails = async (pdfBase64: string) => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userInfo.email,
          toName: userInfo.name,
          processName: processData.processName,
          businessName: processData.businessName,
          pdfBase64,
          processData: {
            processName: processData.processName,
            businessName: processData.businessName,
            businessType: processData.businessType,
            teamSize: processData.teamSize,
            stepsCount: processData.steps.length,
            toolsUsed: processData.tools.map(t => t.name).join(', '),
            painPoints: processData.painPoints.join('; '),
            duration: processData.duration,
          },
          transcript: messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')
        }),
      })
    } catch (err) {
      console.error('Email send error:', err)
      // Don't fail the whole flow if email fails
    }
  }

  const generatePDF = async () => {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processData, userInfo }),
      })

      if (!response.ok) throw new Error('Failed to generate PDF')

      const data = await response.json()
      setPdfUrl(data.pdfUrl)

      // Submit to Google Sheets and send emails in parallel
      if (!hasSubmittedLead) {
        setHasSubmittedLead(true)
        submitToGoogleSheets()
        sendEmails(data.pdfBase64)
      }
    } catch (err) {
      console.error('PDF generation error:', err)
      setError('There was an error generating your PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center text-center">
      {isGenerating ? (
        <>
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-8"></div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Generating Your Process Document</h2>
          <p className="text-slate-600">This usually takes about 10-15 seconds...</p>
        </>
      ) : error ? (
        <>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-8">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Something Went Wrong</h2>
          <p className="text-slate-600 mb-8">{error}</p>
          <button
            onClick={generatePDF}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
          >
            Try Again
          </button>
        </>
      ) : (
        <>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-8">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Your Process Document is Ready!
          </h2>

          <p className="text-lg text-slate-600 max-w-lg mb-8">
            We've also sent a copy to <span className="font-medium text-slate-900">{userInfo.email}</span>
          </p>

          {/* Automation Opportunities - The Value */}
          {processData.automationOpportunities && processData.automationOpportunities.length > 0 && (
            <div className="w-full max-w-2xl mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2 text-left">
                Automation Opportunities
              </h3>
              <p className="text-slate-600 text-sm mb-6 text-left">
                Based on your process, here's where automation could save you time:
              </p>
              <div className="space-y-4">
                {processData.automationOpportunities.map((opp, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 text-left shadow-sm">
                    <h4 className="font-semibold text-slate-900 mb-2">
                      {i + 1}. {opp.title}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-600">
                        <span className="font-medium text-slate-700">What we noticed: </span>
                        {opp.observation}
                      </p>
                      <p className="text-slate-600">
                        <span className="font-medium text-slate-700">Potential solution: </span>
                        {opp.solution}
                      </p>
                      <p className="text-blue-600 font-medium">
                        {opp.impact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Process Summary - Compact */}
          <div className="w-full max-w-2xl bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-slate-500">Process: </span>
                <span className="font-medium text-slate-700">{processData.processName}</span>
              </div>
              <div>
                <span className="text-slate-500">Steps: </span>
                <span className="font-medium text-slate-700">{processData.steps.length}</span>
              </div>
              <div>
                <span className="text-slate-500">Duration: </span>
                <span className="font-medium text-slate-700">{processData.duration}</span>
              </div>
              <div>
                <span className="text-slate-500">Pain Points: </span>
                <span className="font-medium text-slate-700">{processData.painPoints.length}</span>
              </div>
            </div>
          </div>

          {/* Download Button */}
          {pdfUrl && (
            <a
              href={pdfUrl}
              download={`${processData.processName.replace(/\s+/g, '-')}-Process-Map.pdf`}
              className="px-8 py-4 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 font-medium rounded-lg transition-all mb-8"
            >
              Download Full Process Document (PDF)
            </a>
          )}

          {/* CTA */}
          <div className="w-full max-w-2xl border-t border-slate-200 pt-8 mt-4 text-center">
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              Want to explore these opportunities?
            </h4>
            <p className="text-slate-600 mb-6">
              Book a free strategy call and we'll walk through how to automate this process.
            </p>
            <a
              href="https://cal.com/roy-banwell/ai-strategy-call"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-600/25"
            >
              Book a Strategy Call
            </a>
          </div>
        </>
      )}
    </div>
  )
}

// Main Page Component
export default function ProcessMapper() {
  const [stage, setStage] = useState<Stage>('email')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [mapMode, setMapMode] = useState<MapMode | null>(null)
  const [processData, setProcessData] = useState<ProcessData | null>(null)
  const [conversationMessages, setConversationMessages] = useState<Message[]>([])

  const handleEmailSubmit = (info: UserInfo) => {
    setUserInfo(info)
    setStage('mode-select')
  }

  const handleModeSelect = (mode: MapMode) => {
    setMapMode(mode)
    setStage('chat')
  }

  const handleChatComplete = (data: ProcessData, messages: Message[]) => {
    setProcessData(data)
    setConversationMessages(messages)
    setStage('complete')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-slate-900">
            UpLevel <span className="text-blue-600">Automations</span>
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {stage === 'email' && (
            <EmailCapture onSubmit={handleEmailSubmit} />
          )}

          {stage === 'mode-select' && userInfo && (
            <ModeSelection userInfo={userInfo} onSelect={handleModeSelect} />
          )}

          {stage === 'chat' && userInfo && mapMode && (
            <ChatInterface
              userInfo={userInfo}
              mode={mapMode}
              onComplete={handleChatComplete}
            />
          )}

          {stage === 'complete' && processData && userInfo && mapMode && (
            <ProcessComplete
              processData={processData}
              userInfo={userInfo}
              mode={mapMode}
              messages={conversationMessages}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-slate-500">
            © 2025 UpLevel Automations. Built for ROI.
          </p>
        </div>
      </footer>
    </div>
  )
}
