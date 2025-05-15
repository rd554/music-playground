/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // Enable static exports
  trailingSlash: true,
  // Configure static optimization
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;
