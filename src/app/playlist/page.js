'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import './playlist.css';

// Separate client component for handling search params
function PlaylistWithParams() {
  const searchParams = useSearchParams();
  const moods = searchParams?.get('moods') || 'Your Custom';
  return <PlaylistContent moods={moods} />;
}

function PlaylistContent({ moods }) {
  const [playlist, setPlaylist] = useState(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Get the playlist data from localStorage
      const storedPlaylist = localStorage.getItem('currentPlaylist');
      if (storedPlaylist) {
        setPlaylist(JSON.parse(storedPlaylist));
      } else {
        // If no playlist in storage, redirect back to home
        router.push('/');
      }
    } catch (err) {
      setError('Failed to load playlist');
      console.error('Error loading playlist:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleSpotifyClick = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-4">Error: {error}</h1>
        <Link href="/" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full">
          Return Home
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingPlaylist />;
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-4">No playlist found</h1>
        <Link href="/" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="playlist-header flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{moods} Playlist</h1>
            <p className="text-gray-300 mt-2">{playlist.songs.length} songs curated for your mood</p>
          </div>
          <Link href="/" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-all">
            Back to Mood Selector
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {playlist.songs.map((song, index) => (
            <div 
              key={index} 
              className="song-card bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer"
              onClick={() => handleSpotifyClick(song.spotifyUrl)}
            >
              <div className="flex p-4">
                {/* Album Art */}
                <div className="flex-shrink-0 mr-4">
                  {song.albumArt ? (
                    <img 
                      src={song.albumArt} 
                      alt={`${song.title} album art`} 
                      className="h-24 w-24 object-cover rounded album-art"
                    />
                  ) : (
                    <div className="h-24 w-24 bg-gray-700 rounded flex items-center justify-center album-art">
                      <span className="text-4xl">🎵</span>
                    </div>
                  )}
                </div>
                
                {/* Song Info */}
                <div className="flex flex-col justify-center flex-grow">
                  <h3 className="text-xl font-semibold">{song.title}</h3>
                  <p className="text-gray-400">{song.artist}</p>
                  
                  {/* Spotify Link */}
                  {song.spotifyUrl && (
                    <button 
                      className="spotify-button mt-2 w-fit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpotifyClick(song.spotifyUrl);
                      }}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                      Play on Spotify
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingPlaylist() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  );
}

export default function PlaylistPage() {
  return (
    <Suspense fallback={<LoadingPlaylist />}>
      <PlaylistWithParams />
    </Suspense>
  );
} 