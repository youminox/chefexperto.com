import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'chefexperto.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/category/:slug/',
        destination: '/:slug/',
        permanent: true,
      },
      {
        source: '/category/:slug',
        destination: '/:slug/',
        permanent: true,
      },
      {
        source: '/feed/',
        destination: '/sitemap.xml',
        permanent: true,
      },
      {
        source: '/feed',
        destination: '/sitemap.xml',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
