import '../styles/globals.css';
import { OrbProvider } from '../context/OrbContext';

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className='bg-gray-900 text-white'>
        <OrbProvider>{children}</OrbProvider>
      </body>
    </html>
  );
}
