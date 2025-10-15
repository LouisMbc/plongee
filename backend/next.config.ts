import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour Docker
  output: 'standalone',
  
  // Configuration pour les images
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
