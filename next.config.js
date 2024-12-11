const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.ibb.co'], // Allow images from i.ibb.co
  },
  webpack: (config, { isServer, buildId }) => {
    // Handle native modules (like swisseph-v2)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    // Add node-loader for .node files
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader',
    });

    if (isServer) {
      // Server-side configuration
      config.externals = [...config.externals, 'swisseph-v2', 'swisseph'];
    } else {
      // Client-side configuration
      config.resolve.alias = {
        ...config.resolve.alias,
        'swisseph-v2': false,
        'swisseph': false,
      };
    }

    // Optionally generate stats file for bundle analysis
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(new BundleAnalyzerPlugin({
        analyzerMode: 'disabled', // Disable server that starts automatically
        generateStatsFile: true,
        statsFilename: 'stats.json'
      }));
    }

    return config;
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['swisseph-v2', 'swisseph'], // Add both modules as external packages
  },
};

module.exports = nextConfig;
