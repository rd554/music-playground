'use client';

import { useOrb } from '../context/OrbContext';

export default function MoodSelector() {
  const { addMood, moods: selectedMoods } = useOrb();

  const moods = [
    { name: 'Calm', icon: '🌊' },
    { name: 'Energetic', icon: '⚡' },
    { name: 'Melancholic', icon: '🌧️' },
    { name: 'Optimistic', icon: '☀️' },
    { name: 'Inspired', icon: '💡' },
  ];

  return (
    <div className='flex gap-4 mt-8 w-full justify-start'>
      {moods.map((mood) => (
        <button
          key={mood.name}
          onClick={() => addMood(mood)}
          disabled={selectedMoods.some((m) => m.name === mood.name)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition
            ${
              selectedMoods.some((m) => m.name === mood.name)
                ? 'bg-blue-500 text-white opacity-50 cursor-not-allowed'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
        >
          {mood.icon} {mood.name}
        </button>
      ))}
    </div>
  );
}
