import { Request, Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const EXTRACTION_PROMPT = `You are a data extraction assistant AND an automation consultant. Given the following conversation where a business process was mapped out, extract the structured data and provide automation recommendations.

Return ONLY valid JSON with this exact structure (no markdown, no explanation):

{
  "processName": "string - name of the process",
  "businessName": "string - name of the business",
  "businessType": "string - type of business",
  "teamSize": "string - description of team size",
  "processOwner": "string - who owns this process",
  "steps": [
    {
      "number": 1,
      "title": "string - step title",
      "actor": "string - who does this step",
      "details": ["string - detail 1", "string - detail 2"]
    }
  ],
  "tools": [
    {
      "name": "string - tool name",
      "purpose": "string - what it's used for"
    }
  ],
  "painPoints": ["string - pain point 1", "string - pain point 2"],
  "duration": "string - how long the process takes",
  "decisionPoints": [
    {
      "location": "string - where in the process",
      "condition": "string - what determines the path",
      "paths": ["string - path 1", "string - path 2"]
    }
  ],
  "automationOpportunities": [
    {
      "title": "string - short name for the opportunity",
      "observation": "string - what you noticed in the current process",
      "solution": "string - specific automation or AI solution that could help",
      "impact": "string - estimated time savings or efficiency gain"
    }
  ]
}

## Instructions for automationOpportunities

Analyze the conversation for automation opportunities based on:
- **Repetitive manual tasks** (data entry, form filling, copy-pasting between systems)
- **Information that lives "in someone's head"** (tribal knowledge that should be systematized)
- **Back-and-forth communication** (follow-ups, status checks, reminders)
- **Decision points with clear rules** (if X then Y — can be automated)
- **Waiting periods** (where automated notifications could help)
- **Handoffs between people** (where automation could smooth transitions)
- **Manual tracking** (spreadsheets, reminder systems that could be automated)

Generate 2-4 specific, actionable recommendations. Be concrete about what technology could help (e.g., "automated email sequences," "Zapier integration between X and Y," "AI-powered data extraction," "automated reminder system").

Extract all information from the conversation. If something wasn't discussed, use reasonable defaults or empty arrays.`

export async function extractProcessDataHandler(req: Request, res: Response) {
  try {
    const { messages } = req.body as { messages: Message[] }

    if (!messages) {
      return res.status(400).json({ error: 'Missing messages' })
    }

    // Initialize client inside handler so env vars are loaded
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const conversationText = messages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: EXTRACTION_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here is the conversation to extract data from:\n\n${conversationText}`,
        },
      ],
    })

    const textContent = response.content.find((block) => block.type === 'text')
    let content = textContent?.type === 'text' ? textContent.text : '{}'

    // Strip markdown code blocks if present (Claude sometimes wraps JSON in ```json ... ```)
    content = content.trim()
    if (content.startsWith('```json')) {
      content = content.slice(7) // Remove ```json
    } else if (content.startsWith('```')) {
      content = content.slice(3) // Remove ```
    }
    if (content.endsWith('```')) {
      content = content.slice(0, -3) // Remove trailing ```
    }
    content = content.trim()

    try {
      const processData = JSON.parse(content)
      return res.json(processData)
    } catch (parseError) {
      console.error('Failed to parse extraction response:', content)
      return res.status(500).json({ error: 'Failed to parse process data' })
    }
  } catch (error) {
    console.error('Extraction error:', error)
    return res.status(500).json({ error: 'Failed to extract process data' })
  }
}
