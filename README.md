# Music Playground

An interactive web application that generates music playlists based on your mood. Select from predefined moods or describe your own, and watch as the orb transforms into a personalized playlist.

## Features

- **Interactive Mood Selection**: Choose from predefined moods or describe your own
- **Dynamic Orb Visualization**: Watch the orb change colors based on your selected moods
- **AI-Powered Mood Analysis**: Custom moods are analyzed using OpenAI to determine the appropriate emotion and emoji
- **Personalized Playlist Generation**: Get song recommendations tailored to your mood combination
- **Smooth Animations**: Enjoy a polished user experience with smooth transitions and animations

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/music-playground.git
   cd music-playground
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   
   Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   Alternatively, run the setup script:
   ```bash
   node setup-env.js
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## How to Use

1. **Select Predefined Moods**: Click on mood buttons like "Calm", "Energetic", etc. to add them to the orb.
2. **Describe Your Own Mood**: Type a short description (max 6 words) in the text input and click "Submit".
3. **Remove Moods**: Click the minus button on any mood tag to remove it from the orb.
4. **View Playlist**: After selecting moods, wait 5 seconds for the playlist to appear.
5. **Hide Playlist**: Click anywhere on the playlist to hide it and return to the orb view.

## Technologies Used

- Next.js
- React
- Tailwind CSS
- OpenAI API

## Future Enhancements

- Spotify integration for playing songs directly
- User accounts to save favorite playlists
- More detailed mood analysis with sentiment scores
- Social sharing features

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the API for mood analysis and playlist generation
- Unsplash for dynamic playlist cover images
