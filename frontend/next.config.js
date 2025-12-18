/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabling Turbopack to resolve font loading issues
  // This will force Next.js to use Webpack instead.
  reactStrictMode: true,
  
  webpack: (config, { isServer }) => {
    // Custom Webpack configurations (if needed) can go here
    return config;
  },
  
  // Ensure turbopack is not causing issues by commenting it out for now
  // turbopack: {},

  // Other configurations can go here
};

module.exports = nextConfig;
