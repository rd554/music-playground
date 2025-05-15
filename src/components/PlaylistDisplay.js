'use client';

import { useOrb } from '../context/OrbContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();

  // Handle returning from playlist page
  useEffect(() => {
    // Reset position when component mounts or pathname changes
    if (pathname === '/') {
      // Force the playlist to be visible when coming back from another page
      const storedPlaylist = localStorage.getItem('currentPlaylist');
      if (storedPlaylist && scrollContainerRef.current) {
        // No need to adjust transform, using CSS transform now
      }
    }
  }, [pathname]);

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
    
    // Stop any playing audio before navigation
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    
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
    <div className='absolute inset-0 flex items-center justify-center z-20 playlist-container'>
      <div 
        className={`h-full w-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full 
          shadow-2xl text-white flex flex-col items-center justify-center overflow-hidden
          transition-all duration-500 ease-in-out playlist-orb
          ${isAnimating ? 'scale-110 opacity-90' : 'scale-100 opacity-100'}`}
        ref={scrollContainerRef}
      >
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mb-2"></div>
            <p>Generating playlist...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-between w-full h-full relative pt-5 pb-3">
            {/* Song navigation indicators */}
            <div className="absolute top-1.5 left-0 right-0 flex justify-center items-center">
              <div className="flex space-x-1">
                {playlist.songs.map((_, idx) => (
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
            <div className="flex flex-col items-center justify-center flex-grow w-full px-3 mt-3">
              <div 
                className={`w-[85%] bg-black bg-opacity-30 backdrop-blur-sm
                  rounded-2xl p-2 flex flex-col items-center transition-all duration-500 
                  hover:shadow-glow cursor-pointer song-card-large
                  ${currentPreview === currentSong.previewUrl && isPlaying ? 'pulse-soft' : ''}`}
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Album Art */}
                {currentSong.albumArt ? (
                  <img 
                    src={currentSong.albumArt} 
                    alt={`${currentSong.title} album art`} 
                    className="h-14 w-14 rounded-full mb-1 object-cover border border-white border-opacity-30"
                  />
                ) : (
                  <div className="h-14 w-14 bg-gradient-to-br from-purple-700 to-pink-600 rounded-full mb-1 flex items-center justify-center border border-white border-opacity-30">
                    <span className="text-xl">🎵</span>
                  </div>
                )}
                
                {/* Song Info */}
                <div className="text-center mb-1 w-full px-1">
                  <p className='text-sm font-medium text-white truncate'>{currentSong.title}</p>
                  <p className='text-xs text-gray-300 truncate'>{currentSong.artist}</p>
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-center space-x-1 mt-1">
                  {hasPrevSong && (
                    <button 
                      onClick={prevSong}
                      className="text-white rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
                    >
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-white bg-opacity-20">
                        ⬅️
                      </span>
                    </button>
                  )}
                  
                  {currentSong.previewUrl && (
                    <button 
                      onClick={(e) => togglePlay(currentSong.previewUrl, e)}
                      className="text-white mx-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
                    >
                      <span className={`flex items-center justify-center h-7 w-7 rounded-full bg-white bg-opacity-20 
                        ${currentPreview === currentSong.previewUrl && isPlaying ? 'bg-opacity-40' : ''}`}>
                        {currentPreview === currentSong.previewUrl && isPlaying ? '⏸️' : '▶️'}
                      </span>
                    </button>
                  )}
                  
                  {hasNextSong && (
                    <button 
                      onClick={nextSong}
                      className="text-white rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
                    >
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-white bg-opacity-20">
                        ➡️
                      </span>
                    </button>
                  )}
                  
                  {currentSong.spotifyUrl && (
                    <button 
                      onClick={(e) => openSpotify(currentSong.spotifyUrl, e)}
                      className="text-white ml-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-all"
                    >
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-white bg-opacity-20 text-xs">🎧</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <button 
              onClick={viewFullPlaylist}
              className="mt-auto mb-2 px-4 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 
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
