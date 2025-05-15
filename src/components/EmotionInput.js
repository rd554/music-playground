'use client';

import { useState } from 'react';
import { useOrb } from '../context/OrbContext';
import { analyzeMood } from '../utils/openai';

export default function EmotionInput() {
  const [emotion, setEmotion] = useState('');
  const { addMood, moods } = useOrb();
  const [isHovering, setIsHovering] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Check if max moods reached
  const isMaxMoodsReached = moods.length >= 4;

  const handleSubmit = async () => {
    if (emotion.trim() && emotion.split(' ').length <= 6 && !isMaxMoodsReached && !isAnalyzing) {
      setIsAnalyzing(true);
      
      try {
        // Analyze the mood using OpenAI
        const analyzedMood = await analyzeMood(emotion.trim());
        
        // Add the mood to the orb
        addMood(analyzedMood);
        
        // Clear the input
        setEmotion('');
      } catch (error) {
        console.error('Error analyzing mood:', error);
        // Fallback to default mood if analysis fails
        addMood({
          name: emotion.trim(),
          icon: '💭',
          isCustom: true
        });
        setEmotion('');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className='mt-4 w-3/4 sm:w-1/2 flex items-center flex-col'>
      <div 
        className="relative w-full mb-3"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <input
          type='text'
          className={`w-full p-3 bg-gray-800 text-white rounded-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${isMaxMoodsReached ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder='Describe your mood... (max 6 words)'
          value={emotion}
          onChange={(e) => setEmotion(e.target.value)}
          onKeyPress={handleKeyPress}
          maxLength={50}
          disabled={isMaxMoodsReached || isAnalyzing}
        />
        {isMaxMoodsReached && isHovering && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-800 bg-opacity-70 transition-opacity duration-200">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">❌</span>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!emotion.trim() || emotion.split(' ').length > 6 || isMaxMoodsReached || isAnalyzing}
        className={`px-4 py-2 bg-blue-500 text-white rounded-full transition whitespace-nowrap mx-auto
          max-w-[150px] w-1/2 flex items-center justify-center
          ${(!emotion.trim() || emotion.split(' ').length > 6 || isMaxMoodsReached || isAnalyzing) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
      >
        {isAnalyzing ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Analyzing</span>
          </div>
        ) : (
          'Submit'
        )}
      </button>
    </div>
  );
}
