'use client';

import { useOrb } from '../context/OrbContext';

export default function MoodSelector() {
  const { addMood } = useOrb();

  const moods = [
    { name: 'Calm', emoji: '🌊' },
    { name: 'Energetic', emoji: '⚡' },
    { name: 'Melancholic', emoji: '🌧️' },
    { name: 'Optimistic', emoji: '☀️' },
    { name: 'Inspired', emoji: '💡' },
  ];

  return (
    <div className="mood-buttons-container flex justify-center space-x-2 px-4 py-2 w-full max-w-screen-lg mx-auto">
      {moods.map((mood) => (
        <button
          key={mood.name}
          onClick={() => addMood(mood)}
          className="mood-button bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full 
            transition-all duration-300 flex items-center space-x-2 whitespace-nowrap
            text-sm md:text-base"
        >
          <span className="text-lg">{mood.emoji}</span>
          <span>{mood.name}</span>
        </button>
      ))}
    </div>
  );
}
