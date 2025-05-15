# Music Playground 🎵

A dynamic music playlist generator that creates personalized playlists based on moods and emotions. Built with Next.js, OpenAI, and Spotify integration.

## Features

- 🎨 Interactive mood selection with a dynamic orb interface
- 🤖 AI-powered custom mood analysis using OpenAI
- 🎵 Spotify integration for song recommendations and previews
- 🎭 Predefined and custom mood inputs
- 🎪 Beautiful, responsive UI with smooth animations
- 🎧 Song preview functionality
- 🔗 Direct Spotify links for full song access

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **AI Integration**: OpenAI API
- **Music Data**: Spotify Web API
- **Styling**: CSS Modules, TailwindCSS
- **State Management**: React Context

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

- `NEXT_PUBLIC_OPENAI_API_KEY`: Your OpenAI API key
- `SPOTIFY_CLIENT_ID`: Your Spotify application client ID
- `SPOTIFY_CLIENT_SECRET`: Your Spotify application client secret

## Usage

1. Select a mood using the interactive orb interface
2. Enter custom moods in the text input (optional)
3. Wait for the playlist generation
4. Browse through recommended songs
5. Preview songs and click to open in Spotify

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the API for mood analysis and playlist generation
- Unsplash for dynamic playlist cover images
