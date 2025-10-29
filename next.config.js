/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib', 'contexts'],
  },
  // Optimize for Vercel
  images: {
    domains: [],
    unoptimized: false,
  },
  // Reduce bundle size - optimize package imports
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'reactflow'],
  },
  // SEO & Performance
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Analytics (if using Vercel Analytics)
  ...(process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID && {
    analyticsId: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
  }),
}

module.exports = nextConfig
