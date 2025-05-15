/**
 * Utility functions for interacting with OpenAI API
 */

/**
 * Analyzes text to determine the mood
 * @param {string} text - The text to analyze
 * @returns {Promise<Object>} - The analyzed mood with name and icon
 */
export async function analyzeMood(text) {
  try {
    const response = await fetch('/api/analyzeMood', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze mood');
    }

    const data = await response.json();
    return data.mood;
  } catch (error) {
    console.error('Error analyzing mood:', error);
    // Default fallback if API fails
    return {
      name: text,
      icon: '💭',
      isCustom: true,
    };
  }
} 