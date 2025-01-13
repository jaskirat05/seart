import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['hairchange.s3.eu-north-1.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hairchange.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
