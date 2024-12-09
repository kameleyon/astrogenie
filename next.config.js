/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.ibb.co'], // Allow images from i.ibb.co
  },
  webpack: (config, { isServer }) => {
    // Handle native modules (like swisseph-v2)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    }

    if (isServer) {
      // Server-side configuration
      config.externals = [...config.externals, 'swisseph-v2']
    } else {
      // Client-side configuration
      config.resolve.alias = {
        ...config.resolve.alias,
        'swisseph-v2': false,
      }
    }

    return config
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['swisseph-v2'], // Add swisseph-v2 as external package
  },
}

module.exports = nextConfig
