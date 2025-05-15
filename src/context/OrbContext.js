'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const OrbContext = createContext();

export function OrbProvider({ children }) {
  const [moods, setMoods] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [playlist, setPlaylist] = useState(null);
  const [isPlaylistVisible, setIsPlaylistVisible] = useState(false);
  const [playlistTimer, setPlaylistTimer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Effect to handle automatic playlist generation after mood changes
  useEffect(() => {
    // Clear any existing timer
    if (playlistTimer) {
      clearTimeout(playlistTimer);
    }
    
    // If there are moods selected, start a new timer
    if (moods.length > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        generatePlaylist();
      }, 5000); // 5 seconds delay
      
      setPlaylistTimer(timer);
    } else {
      // If no moods, reset playlist
      setPlaylist(null);
      setIsPlaylistVisible(false);
    }
    
    // Cleanup function to clear timer
    return () => {
      if (playlistTimer) {
        clearTimeout(playlistTimer);
      }
    };
  }, [moods]); // This effect runs whenever moods change

  // Mood position logic for North, South, East, and West
  const moodPositions = (index) => {
    const positions = [
      'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full', // North
      'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full', // South
      'top-1/2 left-0 transform -translate-y-1/2 -translate-x-full', // West
      'top-1/2 right-0 transform -translate-y-1/2 translate-x-full', // East
    ];
    return positions[index % 4];
  };

  const addMood = (mood) => {
    if (moods.length < 4 && !moods.some((m) => m.name === mood.name)) {
      setMoods([...moods, mood]);
      setIsAnimating(true);
    }
  };

  const removeMood = (moodName) => {
    setMoods(moods.filter((m) => m.name !== moodName));
    setIsAnimating(true);
  };

  const resetOrb = () => {
    setMoods([]);
    setIsAnimating(false);
    setPlaylist(null);
    setIsPlaylistVisible(false);
    if (playlistTimer) {
      clearTimeout(playlistTimer);
      setPlaylistTimer(null);
    }
  };

  const generatePlaylist = async () => {
    if (moods.length === 0) return;
    
    setIsLoading(true);
    try {
      const moodList = moods.map((m) => m.name).join(', ');
      
      const response = await fetch('/api/generatePlaylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moods: moodList }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate playlist');
      }
      
      const data = await response.json();
      setPlaylist(data.playlist);
      setIsPlaylistVisible(true);
      setIsAnimating(false);
    } catch (error) {
      console.error('Error generating playlist:', error);
      // Fallback to a simple playlist if API fails
      const fallbackPlaylist = {
        songs: [
          { title: 'Song A', artist: 'Artist A' },
          { title: 'Song B', artist: 'Artist B' },
          { title: 'Song C', artist: 'Artist C' },
        ],
      };
      setPlaylist(fallbackPlaylist);
      setIsPlaylistVisible(true);
      setIsAnimating(false);
    } finally {
      setIsLoading(false);
    }
  };

  const hidePlaylist = () => {
    setIsPlaylistVisible(false);
    setIsAnimating(true);
  };

  return (
    <OrbContext.Provider
      value={{
        moods,
        addMood,
        removeMood,
        isAnimating,
        setIsAnimating,
        playlist,
        setPlaylist,
        generatePlaylist,
        resetOrb,
        isPlaylistVisible,
        hidePlaylist,
        moodPositions,
        isLoading,
      }}
    >
      {children}
    </OrbContext.Provider>
  );
}

export function useOrb() {
  return useContext(OrbContext);
}
