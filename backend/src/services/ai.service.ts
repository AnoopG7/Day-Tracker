export interface NutritionEstimate {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  servingSize: string;
  confidence: 'high' | 'medium' | 'low';
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Get nutrition estimate from food name using Groq AI
 * Uses native fetch API for maximum compatibility
 */
export async function estimateNutritionFromFood(foodName: string): Promise<NutritionEstimate> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY environment variable is not set. Please add it to your .env file.'
    );
  }

  const prompt = `Given the food item "${foodName}", estimate the approximate nutritional values for a typical single serving.

Return ONLY a valid JSON object with these exact fields (no markdown, no explanation):
{
  "calories": <number in kcal>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fats": <number in grams>,
  "fiber": <number in grams>,
  "servingSize": "<string like '1 cup', '100g', '1 piece'>",
  "confidence": "<'high' if common food, 'medium' if regional/specific, 'low' if unusual>"
}

Rules:
- Use typical restaurant/home serving sizes
- Round to 1 decimal place
- If ambiguous, use most common interpretation
- Indian foods should use typical Indian serving sizes`;

  try {
    const response = await globalThis.fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are a nutrition expert. Return ONLY valid JSON, no markdown or explanation.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = (await response.json()) as GroqResponse;
    const text = data.choices[0]?.message?.content?.trim() || '';

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const parsed = JSON.parse(jsonMatch[0]) as NutritionEstimate;

    // Validate and sanitize response
    return {
      calories: Math.round(Number(parsed.calories) || 0),
      protein: Math.round((Number(parsed.protein) || 0) * 10) / 10,
      carbs: Math.round((Number(parsed.carbs) || 0) * 10) / 10,
      fats: Math.round((Number(parsed.fats) || 0) * 10) / 10,
      fiber: Math.round((Number(parsed.fiber) || 0) * 10) / 10,
      servingSize: parsed.servingSize || '1 serving',
      confidence: (['high', 'medium', 'low'].includes(parsed.confidence)
        ? parsed.confidence
        : 'medium') as 'high' | 'medium' | 'low',
    };
  } catch (error) {
    console.error('AI nutrition estimation error:', error);
    if (error instanceof Error && error.message.includes('GROQ_API_KEY')) {
      throw error;
    }
    throw new Error('Failed to estimate nutrition. Please try again or enter values manually.');
  }
}

export default { estimateNutritionFromFood };
