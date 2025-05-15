/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.spotify.com',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
    ],
  },
  // Enable static exports
  trailingSlash: true,
  // Configure static optimization
  experimental: {
    optimizeCss: false,
  },
  // Allow Spotify API and web player domains
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' https://*.spotify.com https://i.scdn.co data:; connect-src 'self' https://*.spotify.com https://api.spotify.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.spotify.com; frame-src https://*.spotify.com; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
