import AnimatedOrb from '../components/AnimatedOrb';
import MoodSelector from '../components/MoodSelector';
import EmotionInput from '../components/EmotionInput';
import PlaylistDisplay from '../components/PlaylistDisplay';

export default function HomePage() {
  return (
    <main className='flex flex-col items-center justify-center min-h-screen p-8 space-y-6'>
      <div className='relative'>
        <AnimatedOrb />
        <PlaylistDisplay />
      </div>
      <MoodSelector />
      <EmotionInput />
    </main>
  );
}
