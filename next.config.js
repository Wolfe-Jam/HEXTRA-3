const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to polyfill these on the server
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        util: require.resolve('util/'),
        zlib: require.resolve('browserify-zlib'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
        querystring: require.resolve('querystring-es3'),
      };

      config.plugins = [
        ...config.plugins,
        // Add polyfills for process and buffer
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ];
    }
    return config;
  },
}

module.exports = nextConfig
