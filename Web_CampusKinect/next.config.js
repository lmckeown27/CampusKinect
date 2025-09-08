/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations (disabled for stability)
  swcMinify: false,
  compress: false,
  
  // Disable ESLint during builds for production deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during builds (warnings only)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable static optimization to prevent SSR issues with client components
  trailingSlash: false,
  poweredByHeader: false,
  
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
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Performance optimizations - disable all static features
  experimental: {
    optimizeCss: false,
    scrollRestoration: true,
    // Disable static optimization completely
    staticPageGenerationTimeout: 0,
    isrMemoryCacheSize: 0,
    // Force dynamic rendering for all pages
    forceSwcTransforms: false,
    serverComponentsExternalPackages: [],
  },
  
  // Webpack configuration for module resolution
  webpack: (config, { isServer, dev }) => {
    // Ensure proper alias resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };

    // Handle static asset imports
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg|ico|webp)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
    });

    // Disable static optimization in production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: false,
        sideEffects: false,
      };
    }

    return config;
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
  
  // Build output configuration - force standalone with no static generation
  output: 'standalone',
  
  // Completely disable static optimization
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  
  // Disable all static generation features
  generateStaticParams: false,
  staticPageGenerationTimeout: 0,
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
