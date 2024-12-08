/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.ibb.co'], // Allow images from i.ibb.co
  },
  webpack: (config, { isServer }) => {
    // Handle native modules (like swisseph)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    }

    if (isServer) {
      // Server-side configuration
      config.module.rules.push({
        test: /\.node$/,
        use: [
          {
            loader: 'node-loader',
            options: {
              name: '[name].[ext]',
            },
          },
        ],
      })
    } else {
      // Client-side configuration
      config.resolve.alias = {
        ...config.resolve.alias,
        swisseph: false,
      }
    }

    // Ensure native addons are processed correctly
    config.module.rules.push({
      test: /\.(m?js|node)$/,
      parser: { amd: false },
      use: {
        loader: '@vercel/webpack-asset-relocator-loader',
        options: {
          outputAssetBase: 'native_modules',
          production: true, // Force production mode for better optimization
        },
      },
    })

    return config
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['swisseph'], // Add swisseph as external package
  },
}

module.exports = nextConfig
