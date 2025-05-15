export default function PlaylistCard({ title, description }) {
  return (
    <div className='p-4 bg-gray-800 rounded-md shadow-md hover:shadow-lg transition'>
      <h3 className='text-xl font-bold'>{title}</h3>
      <p className='text-gray-400'>{description}</p>
    </div>
  );
}
