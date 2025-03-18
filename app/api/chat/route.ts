import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

type ClaudeMessage = {
  id: string,
  role: 'user' | 'assistant';
  content: string;
};

type RequestBody = {
  messages: ClaudeMessage[];
  exchangeCount: number;
};

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { messages, exchangeCount } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request body - messages array is required' },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    let systemPrompt = `You are a thoughtful youth soccer coach who uses Socratic questioning to help players reflect on their performance.
    Ask open-ended questions, encourage self-analysis, and guide players to discover insights about their play rather than just telling them what they did wrong or right.
    Keep responses concise and age-appropriate for youth soccer players. Don't sound too rigid in your responses. Talk to them on their level. In your questions, make sure to
    ask them if there have been any recent trainings their coach has worked with them on, or if there is a specific drill or video they could go through to get better. If they don't know of any,
    encourage them to talk with their coach for advice on where to look for things they can work on. If they mention something about defense, make the questions about the 3 'P's. Pressure, Position, Patience.
    If they mention offense, make the questions about the 3 'S's. Shape, Shielding, Space (moving into space to be passed to and draw defenders).
    Keep the follow up questions minimal per message. Only one or two each message.`;

    if (exchangeCount >= 5) {
      systemPrompt += `
      IMPORTANT: Do NOT ask any follow-up questions in your response. Instead, provide a thoughtful summary of the discussion and end with an encourging conclusion.
      Offer one or two clear and actionable takeaways the player can apply in their upcoming games and practices
      `;
    }

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      system: systemPrompt,
      messages: messages,
      max_tokens: 1000,
    });

    const assistantResponse = response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ response: assistantResponse });
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
