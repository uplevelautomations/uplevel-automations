import { Request, Response } from 'express'
import { Resend } from 'resend'

interface AssessmentEmailRequest {
  to: string
  toName: string
  phone?: string
  score: number
  qualified: boolean
  answers: {
    q1: string
    q2: string
    q2a: string
    q3: string
    q4: string
    q5: string
    q6: string
    q7: string
    q8: string
    q9: string
  }
  strengths: string[]
  improvements: string[]
  quickWins: string[]
}

export async function sendAssessmentEmailHandler(req: Request, res: Response) {
  try {
    const {
      to,
      toName,
      phone,
      score,
      qualified,
      answers,
      strengths,
      improvements,
      quickWins
    } = req.body as AssessmentEmailRequest

    if (!to || !toName || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Email to prospect
    const prospectEmail = await resend.emails.send({
      from: 'UpLevel Automations <noreply@uplevelautomations.com>',
      to: to,
      subject: `Your AI Readiness Score: ${score}/100`,
      html: generateProspectEmail(toName, score, qualified, strengths, improvements, quickWins)
    })

    // Email to Roy with full details
    const royEmail = await resend.emails.send({
      from: 'UpLevel Automations <noreply@uplevelautomations.com>',
      to: 'roy@uplevelautomations.com',
      subject: `${qualified ? '🟢' : '🔴'} New Assessment: ${toName} - Score ${score}/100`,
      html: generateRoyEmail(toName, to, phone, score, qualified, answers)
    })

    return res.json({
      success: true,
      prospectEmailId: prospectEmail.data?.id,
      royEmailId: royEmail.data?.id
    })
  } catch (error) {
    console.error('Assessment email error:', error)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}

function generateProspectEmail(
  name: string,
  score: number,
  qualified: boolean,
  strengths: string[],
  improvements: string[],
  quickWins: string[]
): string {
  const scoreColor = score >= 70 ? '#16a34a' : score >= 40 ? '#ca8a04' : '#dc2626'

  const ctaSection = qualified
    ? `
      <div style="background: #2563eb; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <h2 style="color: white; font-size: 20px; margin: 0 0 12px 0;">Ready to put AI to work?</h2>
        <p style="color: #bfdbfe; font-size: 14px; margin: 0 0 16px 0;">
          You've got the foundation. Let's build your roadmap together.
        </p>
        <a href="https://cal.com/roy-banwell/ai-strategy-call"
           style="display: inline-block; background: white; color: #2563eb; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Book Your Strategy Call
        </a>
      </div>
    `
    : `
      <div style="background: #2563eb; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <h2 style="color: white; font-size: 20px; margin: 0 0 12px 0;">Start Building Your Foundation</h2>
        <p style="color: #bfdbfe; font-size: 14px; margin: 0 0 16px 0;">
          The first step to AI readiness? Document your processes. Use our free Process Mapper to create a clear workflow in minutes — no AI experience needed.
        </p>
        <a href="https://uplevelautomations.com/process-mapper"
           style="display: inline-block; background: white; color: #2563eb; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Map Your First Process →
        </a>
      </div>
      <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 16px;">
        Once you've documented a few processes, retake this assessment — you'll be surprised how much your score improves.
      </p>
    `

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 16px;">Your AI Readiness Results</h1>

      <p style="color: #475569; font-size: 16px; line-height: 1.6;">
        Hi ${name},
      </p>

      <p style="color: #475569; font-size: 16px; line-height: 1.6;">
        Thanks for completing the AI Readiness Assessment! Here's what we found:
      </p>

      <!-- Score -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">Your AI Readiness Score</p>
        <div style="font-size: 48px; font-weight: bold; color: ${scoreColor};">
          ${score}<span style="font-size: 24px; color: #94a3b8;">/100</span>
        </div>
      </div>

      ${strengths.length > 0 ? `
        <!-- Strengths -->
        <div style="margin: 24px 0;">
          <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 12px 0;">✅ What's working well</h3>
          <ul style="color: #475569; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
            ${strengths.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${improvements.length > 0 ? `
        <!-- Improvements -->
        <div style="margin: 24px 0;">
          <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 12px 0;">⚠️ What needs work</h3>
          <ul style="color: #475569; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
            ${improvements.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${quickWins.length > 0 ? `
        <!-- Quick Wins -->
        <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 12px 0;">⚡ Your Quick Wins</h3>
          <ul style="color: #475569; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
            ${quickWins.map(w => `<li>${w}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${ctaSection}

      <p style="color: #94a3b8; font-size: 14px; margin-top: 32px;">
        — Roy Banwell<br>
        UpLevel Automations
      </p>
    </div>
  `
}

function generateRoyEmail(
  name: string,
  email: string,
  phone: string | undefined,
  score: number,
  qualified: boolean,
  answers: AssessmentEmailRequest['answers']
): string {
  const answerLabels: Record<string, Record<string, string>> = {
    q1: { 'less-10': 'Less than 10 hours', '10-25': '10-25 hours', '25-50': '25-50 hours', 'more-50': 'More than 50 hours' },
    q2: { 'no': 'No documentation', 'partial': 'Partial documentation', 'yes': 'Well documented' },
    q2a: { 'docs': 'Notion/Google Docs', 'drives': 'Shared drives', 'pm-tool': 'PM tool', 'scattered': 'Scattered' },
    q3: { 'people': 'Finding people', 'time': 'My time/bandwidth', 'leads': 'Lead generation', 'cashflow': 'Cash flow', 'other': 'Other' },
    q4: { 'come-to-me': 'Come to me', 'need-input': 'Need my input', 'independent': 'Handle independently' },
    q5: { 'silos': 'Work in silos', 'gaps': 'Communication gaps', 'aligned': 'Well aligned' },
    q6: { 'skeptic': 'Skeptic', 'aware': 'Aware but inactive', 'tried': 'Tried AI tools', 'looking': 'Actively looking', 'advanced': 'Already using' },
    q7: { 'not-likely': 'Not likely', 'somewhat': 'Somewhat likely', 'likely': 'Likely', 'very-likely': 'Very likely', 'definitely': 'Definitely' },
    q9: { 'under-500k': 'Under $500k', '500k-1m': '$500k-$1M', '1m-3m': '$1M-$3M', '3m-10m': '$3M-$10M', 'over-10m': 'Over $10M' }
  }

  const getLabel = (q: string, value: string) => answerLabels[q]?.[value] || value

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 24px;">
        ${qualified ? '🟢' : '🔴'} New Assessment Completed
      </h1>

      <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 16px 0;">Contact Info</h2>
        <p style="color: #475569; margin: 4px 0;"><strong>Name:</strong> ${name}</p>
        <p style="color: #475569; margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        ${phone ? `<p style="color: #475569; margin: 4px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
        <p style="color: #475569; margin: 4px 0;"><strong>Score:</strong> ${score}/100</p>
        <p style="color: #475569; margin: 4px 0;"><strong>Qualified:</strong> ${qualified ? 'Yes' : 'No'}</p>
      </div>

      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 16px 0;">Assessment Answers</h2>

        <p style="color: #475569; margin: 8px 0;"><strong>Manual hours/week:</strong> ${getLabel('q1', answers.q1)}</p>
        <p style="color: #475569; margin: 8px 0;"><strong>Process documentation:</strong> ${getLabel('q2', answers.q2)}</p>
        ${answers.q2a ? `<p style="color: #475569; margin: 8px 0;"><strong>Where documented:</strong> ${getLabel('q2a', answers.q2a)}</p>` : ''}
        <p style="color: #475569; margin: 8px 0;"><strong>Biggest bottleneck:</strong> ${getLabel('q3', answers.q3)}</p>
        <p style="color: #475569; margin: 8px 0;"><strong>Team autonomy:</strong> ${getLabel('q4', answers.q4)}</p>
        <p style="color: #475569; margin: 8px 0;"><strong>Team alignment:</strong> ${getLabel('q5', answers.q5)}</p>
        <p style="color: #475569; margin: 8px 0;"><strong>AI situation:</strong> ${getLabel('q6', answers.q6)}</p>
        <p style="color: #475569; margin: 8px 0;"><strong>Investment likelihood:</strong> ${getLabel('q7', answers.q7)}</p>
        <p style="color: #475569; margin: 8px 0;"><strong>Revenue:</strong> ${getLabel('q9', answers.q9)}</p>
      </div>

      <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 12px 0;">Business Description</h2>
        <p style="color: #475569; margin: 0; white-space: pre-wrap;">${answers.q8 || 'Not provided'}</p>
      </div>

      <p style="color: #64748b; font-size: 14px;">
        This lead has also been logged to Google Sheets.
      </p>
    </div>
  `
}
