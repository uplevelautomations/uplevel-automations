import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
export async function chatHandler(req, res) {
    try {
        const { messages, systemPrompt } = req.body;
        if (!messages || !systemPrompt) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const anthropicMessages = messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: systemPrompt,
            messages: anthropicMessages,
        });
        const textContent = response.content.find((block) => block.type === 'text');
        const content = textContent?.type === 'text' ? textContent.text : '';
        return res.json({ content });
    }
    catch (error) {
        console.error('Chat error:', error);
        return res.status(500).json({ error: 'Failed to generate response' });
    }
}
