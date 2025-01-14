export interface AiResponse {
  success: boolean;
  data?: {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  };
  error?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ContextMessage {
  isUser: boolean;
  text: string;
}

export async function generateAiResponse(
  message: string,
  context: ContextMessage[],
  openRouterApiKey: string,
  systemPrompt: string
): Promise<AiResponse> {
  try {
    const conversationHistory = context?.map((msg: ContextMessage) => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text
    })) || [];

    conversationHistory.push({ role: 'user', content: message });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.ai',
        'X-Title': 'Lovable AI'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini-2024-07-18',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error: unknown) {
    console.error('Error generating AI response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}