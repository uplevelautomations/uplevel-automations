import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
const EXTRACTION_PROMPT = `You are a data extraction assistant. Given the following conversation where a business process was mapped out, extract the structured data and return it as valid JSON.

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
  ]
}

Extract all information from the conversation. If something wasn't discussed, use reasonable defaults or empty arrays.`;
export async function extractProcessDataHandler(req, res) {
    try {
        const { messages } = req.body;
        if (!messages) {
            return res.status(400).json({ error: 'Missing messages' });
        }
        const conversationText = messages
            .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
            .join('\n\n');
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            system: EXTRACTION_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: `Here is the conversation to extract data from:\n\n${conversationText}`,
                },
            ],
        });
        const textContent = response.content.find((block) => block.type === 'text');
        const content = textContent?.type === 'text' ? textContent.text : '{}';
        try {
            const processData = JSON.parse(content);
            return res.json(processData);
        }
        catch (parseError) {
            console.error('Failed to parse extraction response:', content);
            return res.status(500).json({ error: 'Failed to parse process data' });
        }
    }
    catch (error) {
        console.error('Extraction error:', error);
        return res.status(500).json({ error: 'Failed to extract process data' });
    }
}
