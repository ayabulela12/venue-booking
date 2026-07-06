// app/api/ai-briefing/route.ts

import { Ollama } from 'ollama'

const ollama = new Ollama({
  host: 'http://127.0.0.1:11434',
})

export async function POST(req: Request) {
  try {
    const { bookings, district } = await req.json()

    const prompt = `
You are an operations briefing system for ${district}, Cape Town.

Today's bookings:
${JSON.stringify(bookings, null, 2)}

Write a concise operational briefing.

Requirements:
- 2 to 4 sentences
- Flag high-risk events
- Mention attendance concerns
- Mention staffing concerns
- Mention venue conflicts
- Use plain English
- Be specific with names and numbers
`

    const response = await ollama.chat({
      model: 'llama3.2',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    return Response.json({
      briefing: response.message.content,
    })
  } catch (error) {
    console.error('AI briefing error:', error)

    return Response.json(
      {
        error: 'Failed to generate briefing',
      },
      {
        status: 500,
      }
    )
  }
}