/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.ibb.co'],
  },
  output: 'standalone',
  poweredByHeader: false,
  compress: true,

  webpack: (config, { isServer, dev }) => {
    // Handle native modules (like swisseph-v2)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    }

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

      // Handle .node files
      config.module.rules.push({
        test: /\.node$/,
        loader: 'null-loader',
      });
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

  // Configure experimental features
  experimental: {
    serverActions: true,
    // Include swisseph modules in server components
    serverComponentsExternalPackages: ['swisseph-v2', 'swisseph'],
  },

  // Configure headers for better font loading and caching
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
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  },

  // Configure redirects for compatibility route
  async redirects() {
    return [
      {
        source: '/compatibility',
        destination: '/birth-chart',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
