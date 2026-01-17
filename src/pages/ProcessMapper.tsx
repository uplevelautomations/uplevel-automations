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
}

type Stage = 'email' | 'chat' | 'complete'

// System prompt for the AI
const SYSTEM_PROMPT = `You are an expert business process analyst helping someone document and map out a business process. Your goal is to extract enough detail that the process could be handed to someone unfamiliar with the business and they could execute it, or that an automation engineer could identify clear opportunities for improvement.

## Your Approach

**Be conversational but purposeful.** You're not filling out a form — you're having a discovery conversation. But every question should move toward a complete picture of the process.

**Challenge vagueness relentlessly.** When someone says things like:
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

**Summarize and confirm.** After gathering details on a section, reflect it back to confirm understanding.

## Conversation Structure

Guide the conversation through these phases:

### Phase 1: Business Context & Process Overview
- What does your business do? (Just a sentence or two)
- How big is your team?
- What is this process called?
- What triggers this process to start?
- What's the end result when done successfully?
- Roughly how often does this process run?

### Phase 2: People & Roles
- Who's involved in this process?
- Who "owns" this process?
- Any external parties involved?

### Phase 3: Step-by-Step Walkthrough
For each step, extract:
- What happens (the action)
- Who does it (the role)
- What they need (inputs, information, access)
- What tools/systems they use
- How long it typically takes
- What triggers the next step

### Phase 4: Tools & Systems
- What software/tools are used?
- Manual steps involving spreadsheets, paper, or copy-pasting?
- Where does information "live" at each stage?

### Phase 5: Pain Points & Bottlenecks
- Where does this process get stuck or delayed?
- What's the most tedious or annoying part?
- Roughly how long does the whole thing take, end-to-end?
- How much time does each person spend on this?
- If you could wave a magic wand, what would you fix?

### Phase 6: Confirmation & Wrap-up
- Provide a complete summary of the process
- Ask if anything is missing or incorrect

## Tone & Style
- Be warm and professional
- Use plain language, not business jargon
- Be encouraging
- Keep responses focused — don't ramble, but don't be curt either

## Important Rules
1. Never assume. If something isn't clear, ask.
2. One thing at a time. Don't overwhelm with multiple questions.
3. Acknowledge what you've learned periodically.
4. Watch for scope creep — keep focused on one process.
5. Know when you're done. When you have enough detail, start wrapping up.
6. **CRITICAL: If the user says they're done, that's enough, or asks you to complete/finish/wrap up — DO IT IMMEDIATELY.** Don't ask more questions. Provide the summary and add the completion marker. Use reasonable defaults for any missing information.

When the conversation is complete and the user confirms the summary is accurate (or explicitly asks you to finish), end your message with exactly this marker on its own line:
[PROCESS_COMPLETE]`

// Email Capture Component
function EmailCapture({ onSubmit }: { onSubmit: (info: UserInfo) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setIsSubmitting(true)
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
          { title: '5-10 Minutes', desc: 'Quick conversation to capture your process' },
          { title: 'Professional PDF', desc: 'Clean documentation you can actually use' },
          { title: 'Identify Bottlenecks', desc: 'Surface pain points and inefficiencies' },
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

// Chat Interface Component
function ChatInterface({
  userInfo,
  onComplete
}: {
  userInfo: UserInfo
  onComplete: (data: ProcessData, messages: Message[]) => void
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi ${userInfo.name}! I'm here to help you map out one of your business processes. By the end of our conversation, you'll have a clear, documented workflow that shows exactly how this process works — who does what, when, and how.\n\nTo get started, tell me a bit about your business and what process you'd like to map out. For example: "I run a marketing consultancy with a small team, and I want to map out how we onboard new clients."`
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

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
          systemPrompt: SYSTEM_PROMPT,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      const assistantMessage = data.content

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
                    {message.content.replace('[PROCESS_COMPLETE]', '').trim()}
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
  messages
}: {
  processData: ProcessData
  userInfo: UserInfo
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

          {/* Process Summary */}
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 mb-8 text-left shadow-sm">
            <h3 className="text-slate-900 font-bold mb-4">{processData.processName}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Business</span>
                <span className="text-slate-700">{processData.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Steps</span>
                <span className="text-slate-700">{processData.steps.length} steps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration</span>
                <span className="text-slate-700">{processData.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pain Points</span>
                <span className="text-slate-700">{processData.painPoints.length} identified</span>
              </div>
            </div>
          </div>

          {/* Download Button */}
          {pdfUrl && (
            <a
              href={pdfUrl}
              download={`${processData.processName.replace(/\s+/g, '-')}-Process-Map.pdf`}
              className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-600/25 hover:-translate-y-0.5 mb-8"
            >
              Download Process Document (PDF)
            </a>
          )}

          {/* Next Steps */}
          <div className="w-full max-w-lg border-t border-slate-200 pt-8 mt-4">
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
              What's Next?
            </h4>
            <p className="text-slate-600 mb-6">
              Want to discuss this process and see if it can be automated?
              Book a free strategy call and we'll walk through the opportunities together.
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
  const [processData, setProcessData] = useState<ProcessData | null>(null)
  const [conversationMessages, setConversationMessages] = useState<Message[]>([])

  const handleEmailSubmit = (info: UserInfo) => {
    setUserInfo(info)
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

          {stage === 'chat' && userInfo && (
            <ChatInterface
              userInfo={userInfo}
              onComplete={handleChatComplete}
            />
          )}

          {stage === 'complete' && processData && userInfo && (
            <ProcessComplete
              processData={processData}
              userInfo={userInfo}
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
