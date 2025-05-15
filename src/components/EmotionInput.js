'use client';

import { useState } from 'react';
import { useOrb } from '../context/OrbContext';

export default function EmotionInput() {
  const [input, setInput] = useState('');
  const { addMood } = useOrb();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const response = await fetch('/api/analyzeMood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      });

      if (!response.ok) throw new Error('Failed to analyze mood');

      const data = await response.json();
      addMood({ name: data.mood, emoji: data.emoji });
      setInput('');
    } catch (error) {
      console.error('Error analyzing mood:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="input-container w-full max-w-md mx-auto px-4 mt-6">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your mood... (max 100 chars)"
          maxLength={100}
          className="input-field w-full px-4 py-2 rounded-full bg-gray-800 text-white 
            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500
            text-sm md:text-base"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="submit-button w-full sm:w-auto px-6 py-2 bg-purple-600 text-white rounded-full
            hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50 
            disabled:cursor-not-allowed text-sm md:text-base whitespace-nowrap"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
