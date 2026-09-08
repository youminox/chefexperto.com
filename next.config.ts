import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  experimental: {
    inlineCss: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'chefexperto.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
    localPatterns: [
      {
        pathname: '/images/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
  },
  async redirects() {
    return [
      // WordPress category URL compatibility
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
      // Old footer links that were broken
      {
        source: '/recetas/:slug/',
        destination: '/:slug/',
        permanent: true,
      },
      {
        source: '/recetas/:slug',
        destination: '/:slug/',
        permanent: true,
      },
      {
        source: '/politica-de-privacidad/',
        destination: '/privacy-policy/',
        permanent: true,
      },
      {
        source: '/politica-de-privacidad',
        destination: '/privacy-policy/',
        permanent: true,
      },
      {
        source: '/contacto/',
        destination: '/hola-hablamos/',
        permanent: true,
      },
      {
        source: '/contacto',
        destination: '/hola-hablamos/',
        permanent: true,
      },
      {
        source: '/nosotros/',
        destination: '/',
        permanent: true,
      },
      {
        source: '/nosotros',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
