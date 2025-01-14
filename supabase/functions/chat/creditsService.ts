import { countTokens } from './tokenCounter.ts';

export interface CreditsResponse {
  success: boolean;
  error?: string;
  totalTokens?: number;
}

export async function handleCredits(
  userId: string,
  message: string,
  aiResponse: string,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<CreditsResponse> {
  try {
    const inputTokens = countTokens(message);
    const responseTokens = countTokens(aiResponse);
    const totalTokens = inputTokens + responseTokens;

    const updateCreditsResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/update_credits`,
      {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_user_id: userId,
          p_credits_used: totalTokens
        })
      }
    );

    if (!updateCreditsResponse.ok) {
      throw new Error('Failed to update credits');
    }

    return {
      success: true,
      totalTokens
    };
  } catch (error) {
    console.error('Error handling credits:', error);
    return {
      success: false,
      error: error.message
    };
  }
}