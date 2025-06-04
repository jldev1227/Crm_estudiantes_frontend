/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignore ESLint errors during the build process
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
