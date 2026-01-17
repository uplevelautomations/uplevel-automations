import { Request, Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  messages: Message[]
  systemPrompt: string
}

export async function chatHandler(req: Request, res: Response) {
  try {
    const { messages, systemPrompt } = req.body as ChatRequest

    if (!messages || !systemPrompt) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Initialize client inside handler so env vars are loaded
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const anthropicMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
    })

    const textContent = response.content.find((block) => block.type === 'text')
    const content = textContent?.type === 'text' ? textContent.text : ''

    return res.json({ content })
  } catch (error) {
    console.error('Chat error:', error)
    return res.status(500).json({ error: 'Failed to generate response' })
  }
}
