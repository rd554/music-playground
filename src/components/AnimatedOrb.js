'use client';

import { useEffect, useState } from 'react';
import { useOrb } from '../context/OrbContext';

export default function AnimatedOrb() {
  const {
    moods,
    removeMood,
    isAnimating,
    setIsAnimating,
    isPlaylistVisible,
    hidePlaylist,
  } = useOrb();
  const [animationProgress, setAnimationProgress] = useState(0);

  // Generate dynamic gradient based on selected moods
  const getOrbGradient = () => {
    const moodColors = {
      Calm: 'from-blue-400 to-indigo-500',
      Energetic: 'from-yellow-400 to-orange-500',
      Melancholic: 'from-indigo-600 to-purple-700',
      Optimistic: 'from-yellow-300 to-green-400',
      Inspired: 'from-pink-400 to-purple-500',
    };

    if (moods.length === 0) {
      return 'from-purple-500 to-blue-500';
    } else if (moods.length === 1) {
      return moodColors[moods[0].name] || 'from-purple-500 to-blue-500';
    } else {
      // Get colors for the first two moods
      const firstMood = moodColors[moods[0].name] || 'from-purple-500';
      const secondMood = moodColors[moods[moods.length - 1].name] || 'to-blue-500';
      
      // Extract the "from" part from firstMood and "to" part from secondMood
      const fromColor = firstMood.split(' ')[0];
      const toColor = secondMood.split(' ')[1];
      
      return `${fromColor} ${toColor}`;
    }
  };

  useEffect(() => {
    if (isAnimating) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 1;
        setAnimationProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isAnimating, setIsAnimating]);

  const moodPositions = ['-top-10', '-bottom-10', '-right-20', '-left-20'];

  const handleClick = () => {
    if (isPlaylistVisible) hidePlaylist();
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex items-center justify-center h-64 w-64 rounded-full 
      bg-gradient-to-r ${getOrbGradient()} 
      ${isAnimating ? 'animate-pulse' : ''} 
      shadow-2xl cursor-pointer mb-16 transition-all duration-500`}
    >
      {moods.length === 0 && (
        <p className='text-lg font-medium text-gray-300'>
          Drop your mood here!
        </p>
      )}
      {moods.map((mood, index) => (
        <div
          key={mood.name}
          className={`absolute flex items-center gap-1 text-white bg-gray-800 px-2 py-1 rounded-full animate-pulse 
            ${moodPositions[index % 4]} mx-8 transition-all duration-300`}
        >
          {mood.icon} {mood.name}
          <button onClick={() => removeMood(mood.name)}>➖</button>
        </div>
      ))}
    </div>
  );
}
