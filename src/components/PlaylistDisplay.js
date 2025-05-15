'use client';

import { useOrb } from '../context/OrbContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import './PlaylistDisplay.css';

export default function PlaylistDisplay() {
  const { playlist, isPlaylistVisible, isLoading, moods } = useOrb();
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const router = useRouter();

  // Add animation effect when playlist appears or changes
  useEffect(() => {
    if (isPlaylistVisible && playlist) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      
      // Save playlist to localStorage when it changes
      localStorage.setItem('currentPlaylist', JSON.stringify(playlist));
      
      // Reset to first song when playlist changes
      setCurrentSongIndex(0);
      
      return () => clearTimeout(timer);
    }
  }, [isPlaylistVisible, playlist]);

  // Handle audio playback
  useEffect(() => {
    // Clean up previous audio
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    // Create new audio instance if there's a preview URL
    if (currentPreview) {
      const newAudio = new Audio(currentPreview);
      setAudio(newAudio);
      
      if (isPlaying) {
        newAudio.play().catch(error => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      }
      
      // Add event listener for when audio ends
      newAudio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      
      return () => {
        newAudio.pause();
        newAudio.removeEventListener('ended', () => {
          setIsPlaying(false);
        });
      };
    }
  }, [currentPreview, isPlaying]);

  // Handle scroll to navigate between songs
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    const handleScroll = (event) => {
      if (isLoading || !playlist || !playlist.songs.length) return;
      
      // Determine scroll direction
      const delta = event.deltaY;
      
      if (delta > 0 && currentSongIndex < playlist.songs.length - 1) {
        // Scrolling down - go to next song
        setCurrentSongIndex(prev => Math.min(prev + 1, playlist.songs.length - 1));
      } else if (delta < 0 && currentSongIndex > 0) {
        // Scrolling up - go to previous song
        setCurrentSongIndex(prev => Math.max(prev - 1, 0));
      }
    };
    
    const container = scrollContainerRef.current;
    container.addEventListener('wheel', handleScroll);
    
    return () => {
      container.removeEventListener('wheel', handleScroll);
    };
  }, [currentSongIndex, isLoading, playlist]);

  // Toggle play/pause
  const togglePlay = (previewUrl, event) => {
    event.stopPropagation(); // Prevent the click from closing the playlist
    
    if (!previewUrl) return; // No preview URL available
    
    if (currentPreview === previewUrl) {
      // Toggle play/pause for current song
      setIsPlaying(!isPlaying);
    } else {
      // Switch to new song
      setCurrentPreview(previewUrl);
      setIsPlaying(true);
    }
  };

  // Open Spotify link
  const openSpotify = (url, event) => {
    event.stopPropagation(); // Prevent the click from closing the playlist
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Navigate to full playlist page
  const viewFullPlaylist = (event) => {
    event.stopPropagation(); // Prevent the click from closing the playlist
    
    // Get mood names as a comma-separated string
    const moodNames = moods.map(m => m.name).join(', ');
    
    // Navigate to the playlist page with moods as a query parameter
    router.push(`/playlist?moods=${encodeURIComponent(moodNames)}`);
  };

  // Navigate to next song
  const nextSong = (event) => {
    event.stopPropagation();
    if (currentSongIndex < playlist.songs.length - 1) {
      setCurrentSongIndex(prev => prev + 1);
    }
  };

  // Navigate to previous song
  const prevSong = (event) => {
    event.stopPropagation();
    if (currentSongIndex > 0) {
      setCurrentSongIndex(prev => prev - 1);
    }
  };

  if (!playlist || !isPlaylistVisible) return null;

  const currentSong = playlist.songs[currentSongIndex];
  const hasNextSong = currentSongIndex < playlist.songs.length - 1;
  const hasPrevSong = currentSongIndex > 0;

  return (
    <div className='absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center px-4'>
      <div 
        className={`h-64 w-64 -translate-y-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full 
          shadow-2xl text-white flex flex-col items-center justify-center overflow-hidden
          transition-all duration-500 ease-in-out relative
          ${isAnimating ? 'scale-110 opacity-90' : 'scale-100 opacity-100'}`}
        ref={scrollContainerRef}
      >
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
            <p className="text-sm">Generating playlist...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-between w-full h-full relative pt-4 pb-2">
            {/* Song navigation indicators */}
            <div className="absolute top-1 left-0 right-0 flex justify-center items-center">
              <div className="flex space-x-1">
                {playlist?.songs.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === currentSongIndex 
                        ? 'w-3 bg-white' 
                        : 'w-1 bg-white bg-opacity-40'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSongIndex(idx);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            </div>
            
            {/* Current song card */}
            <div className="flex flex-col items-center justify-center flex-grow w-full px-3">
              <div 
                className={`w-[85%] bg-black bg-opacity-30 backdrop-blur-sm
                  rounded-2xl p-2 flex flex-col items-center transition-all duration-500 
                  hover:shadow-glow cursor-pointer song-card
                  ${currentPreview === currentSong?.previewUrl && isPlaying ? 'pulse-soft' : ''}`}
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Album Art */}
                {currentSong?.albumArt ? (
                  <img 
                    src={currentSong.albumArt} 
                    alt={`${currentSong.title} album art`} 
                    className="h-12 w-12 rounded-full mb-1 object-cover border border-white border-opacity-30"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-700 to-pink-600 rounded-full mb-1 flex items-center justify-center">
                    <span className="text-lg">🎵</span>
                  </div>
                )}
                
                {/* Song Info */}
                <div className="text-center mb-1 w-full px-1">
                  <p className='text-sm font-medium truncate'>{currentSong?.title}</p>
                  <p className='text-xs text-gray-300 truncate'>{currentSong?.artist}</p>
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-center space-x-1">
                  {hasPrevSong && (
                    <button 
                      onClick={prevSong}
                      className="text-white rounded-full hover:bg-white hover:bg-opacity-20 transition-all p-1"
                    >
                      <span className="text-xs">⬅️</span>
                    </button>
                  )}
                  
                  {currentSong?.previewUrl && (
                    <button 
                      onClick={(e) => togglePlay(currentSong.previewUrl, e)}
                      className="text-white mx-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-all p-1"
                    >
                      <span className="text-sm">
                        {currentPreview === currentSong.previewUrl && isPlaying ? '⏸️' : '▶️'}
                      </span>
                    </button>
                  )}
                  
                  {hasNextSong && (
                    <button 
                      onClick={nextSong}
                      className="text-white rounded-full hover:bg-white hover:bg-opacity-20 transition-all p-1"
                    >
                      <span className="text-xs">➡️</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <button 
              onClick={viewFullPlaylist}
              className="mt-auto mb-1 px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 
                rounded-full text-xs font-medium transition-all border border-white border-opacity-30
                hover:shadow-glow-sm"
            >
              View Full Playlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
