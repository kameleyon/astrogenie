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

    // Add node-loader for .node files
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader',
    })

    if (isServer) {
      // Server-side configuration
      config.externals = [...config.externals, 'swisseph-v2', 'swisseph']
    } else {
      // Client-side configuration
      config.resolve.alias = {
        ...config.resolve.alias,
        'swisseph-v2': false,
        'swisseph': false,
      }
    }

    // Add transpilePackages for moment-timezone
    config.resolve.alias = {
      ...config.resolve.alias,
      'moment-timezone': require.resolve('moment-timezone'),
    }

    return config
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['swisseph-v2', 'swisseph'], // Add both modules as external packages
  },
  transpilePackages: ['moment-timezone'], // Add moment-timezone to transpilePackages
}

module.exports = nextConfig
