/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  swcMinify: true,
  compress: true,
  
  // Disable ESLint during builds for production deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during builds (warnings only)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Environment-based asset prefix
  assetPrefix: process.env.NEXT_PUBLIC_CDN_URL || '',
  
  // Image optimization settings
  images: {
    domains: [
      'localhost',
      'campuskinect.net',
      'api.campuskinect.net',
      'cdn.campuskinect.net',
      'res.cloudinary.com',
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
  },
  
  // Performance optimizations
  experimental: {
    scrollRestoration: true,
  },
  
  // Static file serving with enhanced caching
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel.app; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https: wss: *.vercel.app; media-src 'self' data: blob:; object-src 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
    ]
  },
  
  // Redirects for production
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/profile',
        permanent: false,
      },
    ]
  },
  
  // Build output configuration
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
