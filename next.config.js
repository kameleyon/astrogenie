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

    // Add asset relocator for .node files
    config.module.rules.push({
      test: /\.node$/,
      use: [
        {
          loader: "@vercel/webpack-asset-relocator-loader",
          options: {
            production: !dev,
            esModule: false,
          },
        },
      ],
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

      // Copy ephemeris files to output directory
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.afterEmit.tapPromise('CopyEphemerisFiles', async (compilation) => {
            const fs = require('fs');
            const path = require('path');
            const { promisify } = require('util');
            const copyFile = promisify(fs.copyFile);
            const mkdir = promisify(fs.mkdir);

            const sourceDir = path.join(process.cwd(), 'ephe');
            const targetDir = path.join(process.cwd(), '.next/standalone/ephe');

            try {
              await mkdir(targetDir, { recursive: true });
              const files = fs.readdirSync(sourceDir);
              await Promise.all(
                files.map(file =>
                  copyFile(
                    path.join(sourceDir, file),
                    path.join(targetDir, file)
                  )
                )
              );
            } catch (err) {
              console.error('Error copying ephemeris files:', err);
            }
          });
        }
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
