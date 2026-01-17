import { Request, Response } from 'express'
import { Resend } from 'resend'

interface EmailRequest {
  to: string
  toName: string
  processName: string
  businessName: string
  pdfBase64: string
  // Data for Roy's copy
  processData: {
    processName: string
    businessName: string
    businessType: string
    teamSize: string
    stepsCount: number
    toolsUsed: string
    painPoints: string
    duration: string
  }
  transcript: string
}

export async function sendEmailHandler(req: Request, res: Response) {
  try {
    const {
      to,
      toName,
      processName,
      businessName,
      pdfBase64,
      processData,
      transcript
    } = req.body as EmailRequest

    if (!to || !pdfBase64 || !processName) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Clean filename
    const filename = `${processName.replace(/[^a-zA-Z0-9]/g, '-')}-Process-Map.pdf`

    // Email to prospect with their PDF
    const prospectEmail = await resend.emails.send({
      from: 'UpLevel Automations <noreply@uplevelautomations.com>',
      to: to,
      subject: `Your Process Map: ${processName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 16px;">Your Process Map is Ready!</h1>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Hi ${toName},
          </p>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Thanks for using our Process Mapper tool! Attached is your process documentation for <strong>${processName}</strong>.
          </p>

          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            This document includes:
          </p>

          <ul style="color: #475569; font-size: 16px; line-height: 1.8;">
            <li>Step-by-step breakdown of your process</li>
            <li>Who's responsible for each step</li>
            <li>Tools and systems involved</li>
            <li>Pain points and bottlenecks identified</li>
          </ul>

          <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 12px 0;">Ready to automate?</h2>
            <p style="color: #475569; font-size: 14px; margin: 0 0 16px 0;">
              Let's discuss how AI can eliminate the bottlenecks in this process.
            </p>
            <a href="https://cal.com/roy-banwell/ai-strategy-call"
               style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
              Book a Strategy Call
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 14px; margin-top: 32px;">
            — Roy Banwell<br>
            UpLevel Automations
          </p>
        </div>
      `,
      attachments: [
        {
          filename: filename,
          content: pdfBase64,
        }
      ]
    })

    // Email to Roy with the PDF and full details
    const royEmail = await resend.emails.send({
      from: 'UpLevel Automations <noreply@uplevelautomations.com>',
      to: 'roy@uplevelautomations.com',
      subject: `📋 New Process Mapped: ${processName} - ${toName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 24px;">New Process Mapping Completed!</h1>

          <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 16px 0;">Contact Info</h2>
            <p style="color: #475569; margin: 4px 0;"><strong>Name:</strong> ${toName}</p>
            <p style="color: #475569; margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${to}">${to}</a></p>
          </div>

          <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 16px 0;">Process Details</h2>
            <p style="color: #475569; margin: 4px 0;"><strong>Process:</strong> ${processData.processName}</p>
            <p style="color: #475569; margin: 4px 0;"><strong>Business:</strong> ${processData.businessName} (${processData.businessType})</p>
            <p style="color: #475569; margin: 4px 0;"><strong>Team Size:</strong> ${processData.teamSize}</p>
            <p style="color: #475569; margin: 4px 0;"><strong>Steps:</strong> ${processData.stepsCount}</p>
            <p style="color: #475569; margin: 4px 0;"><strong>Duration:</strong> ${processData.duration}</p>
          </div>

          <div style="background: #fef2f2; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h2 style="color: #991b1b; font-size: 18px; margin: 0 0 16px 0;">Pain Points</h2>
            <p style="color: #475569; white-space: pre-line;">${processData.painPoints.replace(/;/g, '\n•')}</p>
          </div>

          <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 16px 0;">Tools Used</h2>
            <p style="color: #475569;">${processData.toolsUsed}</p>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 16px 0;">Full Conversation Transcript</h2>
            <pre style="color: #475569; font-size: 13px; white-space: pre-wrap; font-family: inherit; margin: 0;">${transcript}</pre>
          </div>

          <p style="color: #64748b; font-size: 14px;">
            The PDF is attached. This lead has also been logged to Google Sheets.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: filename,
          content: pdfBase64,
        }
      ]
    })

    return res.json({
      success: true,
      prospectEmailId: prospectEmail.data?.id,
      royEmailId: royEmail.data?.id
    })
  } catch (error) {
    console.error('Email error:', error)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
