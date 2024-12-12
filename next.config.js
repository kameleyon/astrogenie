/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.ibb.co'],
  },
  output: 'standalone',
  poweredByHeader: false,
  compress: true,

  // Disable static optimization for API routes
  typescript: {
    ignoreBuildErrors: false,
  },

  webpack: (config, { isServer, dev }) => {
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
      // Remove swisseph modules from externals to ensure they're bundled
      const filteredExternals = config.externals.filter(external => {
        if (typeof external === 'string') {
          return !['swisseph-v2', 'swisseph'].includes(external);
        }
        return true;
      });
      config.externals = filteredExternals;
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

    // Optimize chunks for production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          maxSize: 240000,
          cacheGroups: {
            default: false,
            vendors: false,
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              chunks: 'all',
            },
          },
        },
      }
    }

    return config
  },

  // Configure experimental features
  experimental: {
    serverActions: true,
    // Include swisseph modules in server components
    serverComponentsExternalPackages: [],
  },

  // Configure redirects
  async redirects() {
    return []
  },

  // Configure headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
  transpilePackages: ['moment-timezone', 'swisseph-v2', 'swisseph'], // Add Swiss Ephemeris modules to transpilePackages
}

module.exports = nextConfig
