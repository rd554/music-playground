import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { moods } = await request.json();
    
    // Get API keys from environment variables
    const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    
    // Debug: Check API key formats (safely)
    if (openaiApiKey) {
      const firstFour = openaiApiKey.substring(0, 4);
      const lastFour = openaiApiKey.substring(openaiApiKey.length - 4);
      const length = openaiApiKey.length;
      console.log(`OpenAI API Key format check: ${firstFour}...${lastFour} (length: ${length})`);
    } else {
      console.log('OpenAI API Key is undefined or empty');
    }
    
    // Debug: Check if Spotify credentials are present
    console.log(`Spotify Client ID present: ${Boolean(spotifyClientId)}`);
    console.log(`Spotify Client Secret present: ${Boolean(spotifyClientSecret)}`);
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not found');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Try to generate a playlist with OpenAI
    try {
      // Generate song recommendations with OpenAI
      const songRecommendations = await generateSongsWithAI(moods, openaiApiKey);
      
      // If Spotify credentials are available, try to enhance the playlist with real Spotify data
      let enhancedSongs = songRecommendations;
      
      if (spotifyClientId && spotifyClientSecret) {
        try {
          // Get Spotify access token
          const spotifyToken = await getSpotifyAccessToken(spotifyClientId, spotifyClientSecret);
          
          // Enhance songs with Spotify data (album art, preview URLs, etc.)
          enhancedSongs = await enhanceSongsWithSpotify(songRecommendations, spotifyToken);
        } catch (spotifyError) {
          console.error('Error enhancing songs with Spotify:', spotifyError);
          // Continue with the OpenAI recommendations if Spotify enhancement fails
        }
      }
      
      const playlist = {
        songs: enhancedSongs,
        coverImage: `https://source.unsplash.com/random/300x300/?music,${moods.split(',')[0]}`,
      };
      
      return NextResponse.json({ playlist });
    } catch (aiError) {
      console.error('Error generating playlist with AI:', aiError);
      // Fall back to mock data if AI generation fails
      const songs = generateMockSongs(moods);
      const playlist = {
        songs: songs,
        coverImage: `https://source.unsplash.com/random/300x300/?music,${moods.split(',')[0]}`,
      };
      
      return NextResponse.json({ playlist });
    }
  } catch (error) {
    console.error('Error generating playlist:', error);
    return NextResponse.json(
      { error: 'Failed to generate playlist' },
      { status: 500 }
    );
  }
}

// Generate songs using OpenAI
async function generateSongsWithAI(moods, apiKey) {
  const prompt = `
    You are a music recommendation system. Generate a playlist of 5 songs that match these mood(s): ${moods}.
    Return ONLY a JSON array of objects with 'title' and 'artist' properties.
    Do not include any markdown formatting, explanations, or additional text.
    Example: [{"title": "Song Name", "artist": "Artist Name"}]
  `;

  let response;
  
  if (apiKey.startsWith('sk-proj-')) {
    // Use the approach for project API keys
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'OpenAI-Beta': 'assistants=v1'  // Add this header for project API keys
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a music recommendation assistant. Always respond with valid JSON only, no markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
  } else {
    // Standard API key
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a music recommendation assistant. Always respond with valid JSON only, no markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
  }

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate songs with OpenAI');
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  
  try {
    // Try to parse the JSON response
    return JSON.parse(content);
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', parseError);
    console.log('Raw content:', content);
    
    // Try to clean the content of any markdown or extra characters
    const cleanedContent = content
      .replace(/```json\n?/g, '')  // Remove ```json
      .replace(/```\n?/g, '')      // Remove closing ```
      .replace(/^\s+|\s+$/g, '');  // Trim whitespace
    
    try {
      return JSON.parse(cleanedContent);
    } catch (e) {
      console.error('Failed to parse cleaned content:', e);
      throw new Error('Could not extract valid JSON from response');
    }
  }
}

// Get Spotify access token
async function getSpotifyAccessToken(clientId, clientSecret) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token');
  }

  const data = await response.json();
  return data.access_token;
}

// Enhance songs with Spotify data
async function enhanceSongsWithSpotify(songs, token) {
  const enhancedSongs = [];

  for (const song of songs) {
    try {
      // Search for the song on Spotify
      const query = `track:${song.title} artist:${song.artist}`;
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!searchResponse.ok) {
        throw new Error('Spotify search failed');
      }

      const searchData = await searchResponse.json();
      
      if (searchData.tracks.items.length > 0) {
        const track = searchData.tracks.items[0];
        enhancedSongs.push({
          title: song.title,
          artist: song.artist,
          albumArt: track.album.images[0]?.url,
          previewUrl: track.preview_url,
          spotifyUri: track.uri,
          spotifyUrl: track.external_urls.spotify
        });
      } else {
        // If no match found, keep the original song
        enhancedSongs.push(song);
      }
    } catch (error) {
      console.error(`Error enhancing song "${song.title}":`, error);
      // Keep the original song if enhancement fails
      enhancedSongs.push(song);
    }
  }

  return enhancedSongs;
}

// Mock function to generate songs based on moods
function generateMockSongs(moods) {
  const moodMap = {
    'Calm': [
      { title: 'Weightless', artist: 'Marconi Union' },
      { title: 'Claire de Lune', artist: 'Claude Debussy' },
      { title: 'Watermark', artist: 'Enya' },
    ],
    'Energetic': [
      { title: 'Don\'t Stop Me Now', artist: 'Queen' },
      { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars' },
      { title: 'Can\'t Hold Us', artist: 'Macklemore & Ryan Lewis' },
    ],
    'Melancholic': [
      { title: 'Hurt', artist: 'Johnny Cash' },
      { title: 'Everybody Hurts', artist: 'R.E.M.' },
      { title: 'Nothing Compares 2 U', artist: 'Sinéad O\'Connor' },
    ],
    'Optimistic': [
      { title: 'Happy', artist: 'Pharrell Williams' },
      { title: 'Walking on Sunshine', artist: 'Katrina and the Waves' },
      { title: 'Good Vibrations', artist: 'The Beach Boys' },
    ],
    'Inspired': [
      { title: 'Eye of the Tiger', artist: 'Survivor' },
      { title: 'Hall of Fame', artist: 'The Script ft. will.i.am' },
      { title: 'Roar', artist: 'Katy Perry' },
    ],
  };
  
  // Parse the moods string
  const moodList = moods.split(',').map(mood => mood.trim());
  
  // Collect songs for each mood
  let songs = [];
  moodList.forEach(mood => {
    // Check if we have predefined songs for this mood
    if (moodMap[mood]) {
      songs = [...songs, ...moodMap[mood]];
    } else {
      // For custom moods, generate generic songs
      songs.push(
        { title: `${mood} Vibes`, artist: 'Various Artists' },
        { title: `Feeling ${mood}`, artist: 'The Mood Makers' },
      );
    }
  });
  
  // Limit to 5 songs and ensure no duplicates
  return [...new Map(songs.map(song => [song.title, song])).values()].slice(0, 5);
} 