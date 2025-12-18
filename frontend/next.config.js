/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabling Turbopack to resolve font loading issues
  // This will force Next.js to use Webpack instead.
  // Remove this if Turbopack becomes stable with next/font/google.
  reactStrictMode: true,
  
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  },
  
  // Add this line to resolve the build error
  turbopack: {},
  
  // Other Next.js configurations can go here
};

module.exports = nextConfig;