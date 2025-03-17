// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type RequestBody = {
  messages: Message[];
};

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request body - messages array is required' },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `You are a thoughtful youth soccer coach who uses Socratic questioning to help players reflect on their performance.
    Ask open-ended questions, encourage self-analysis, and guide players to discover insights about their play rather than just telling them what they did wrong or right.
    Keep responses concise and age-appropriate for youth soccer players.`;

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
