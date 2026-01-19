import { Request, Response } from 'express'
import { Resend } from 'resend'

interface AbandonAlertRequest {
  name: string
  email: string
  currentPhase: number
  messageCount: number
  transcript: string
}

const PHASE_NAMES = [
  'Business Context',
  'Process Overview',
  'People & Roles',
  'Step-by-Step Walkthrough',
  'Tools & Systems',
  'Pain Points & Bottlenecks',
  'Confirmation & Wrap-up'
]

export async function sendAbandonAlertHandler(req: Request, res: Response) {
  try {
    const {
      name,
      email,
      currentPhase,
      messageCount,
      transcript
    } = req.body as AbandonAlertRequest

    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    const phaseName = PHASE_NAMES[currentPhase - 1] || `Phase ${currentPhase}`

    await resend.emails.send({
      from: 'UpLevel Automations <noreply@uplevelautomations.com>',
      to: 'roy@uplevelautomations.com',
      subject: `⚠️ Process Mapper Abandoned: ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #dc2626; font-size: 24px; margin-bottom: 24px;">Process Mapper Session Abandoned</h1>

          <p style="color: #475569; font-size: 16px; margin-bottom: 24px;">
            Someone started the Process Mapper but has been inactive for 10+ minutes.
          </p>

          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h2 style="color: #991b1b; font-size: 18px; margin: 0 0 16px 0;">Contact Info</h2>
            <p style="color: #475569; margin: 4px 0;"><strong>Name:</strong> ${name}</p>
            <p style="color: #475569; margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          </div>

          <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 16px 0;">Session Details</h2>
            <p style="color: #475569; margin: 4px 0;"><strong>Stopped at:</strong> ${phaseName}</p>
            <p style="color: #475569; margin: 4px 0;"><strong>Messages exchanged:</strong> ${messageCount}</p>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 16px 0;">Conversation Transcript</h2>
            <pre style="color: #475569; font-size: 13px; white-space: pre-wrap; font-family: inherit; margin: 0;">${transcript}</pre>
          </div>

          <p style="color: #64748b; font-size: 14px;">
            Consider reaching out to see if they need help or had technical issues.
          </p>
        </div>
      `
    })

    return res.json({ success: true })
  } catch (error) {
    console.error('Abandon alert error:', error)
    return res.status(500).json({ error: 'Failed to send abandon alert' })
  }
}
