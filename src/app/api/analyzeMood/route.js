import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text } = await request.json();
    
    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    
    // Debug: Check API key format (safely)
    if (apiKey) {
      const firstFour = apiKey.substring(0, 4);
      const lastFour = apiKey.substring(apiKey.length - 4);
      const length = apiKey.length;
      console.log(`API Key format check: ${firstFour}...${lastFour} (length: ${length})`);
    } else {
      console.log('API Key is undefined or empty');
    }
    
    if (!apiKey) {
      console.error('OpenAI API key not found');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Prepare the prompt for OpenAI
    const prompt = `
      Analyze the following text and determine the primary mood or emotion expressed.
      Return a JSON object with:
      1. "name": A single word or short phrase (max 2-3 words) that best describes the mood
      2. "icon": An appropriate emoji that represents this mood
      
      Text to analyze: "${text}"
      
      Return ONLY valid JSON without any explanations or additional text.
    `;

    try {
      // Call OpenAI API - try with project API key first
      let response;
      
      if (apiKey.startsWith('sk-proj-')) {
        // Use the Azure-like endpoint for project API keys
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v1'  // Add this header for project API keys
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a mood analysis assistant that returns JSON only.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.5,
            max_tokens: 150,
          }),
        });
      } else {
        // Standard API key
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a mood analysis assistant that returns JSON only.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.5,
            max_tokens: 150,
          }),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        console.error('OpenAI API error:', error);
        throw new Error('Failed to analyze mood with OpenAI');
      }

      const data = await response.json();
      let moodData;
      
      try {
        // Parse the response to get the mood object
        const content = data.choices[0].message.content.trim();
        moodData = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        // Fallback if parsing fails
        moodData = {
          name: text.length > 20 ? `${text.substring(0, 20)}...` : text,
          icon: '💭'
        };
      }
      
      // Add isCustom flag
      moodData.isCustom = true;
      
      return NextResponse.json({ mood: moodData });
    } catch (openAiError) {
      console.error('Error with OpenAI API:', openAiError);
      
      // Fallback to a simple mood
      const fallbackMood = {
        name: text.length > 20 ? `${text.substring(0, 20)}...` : text,
        icon: '💭',
        isCustom: true
      };
      
      return NextResponse.json({ mood: fallbackMood });
    }
  } catch (error) {
    console.error('Error in analyzeMood API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze mood' },
      { status: 500 }
    );
  }
} 