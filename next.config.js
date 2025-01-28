const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  transpilePackages: ['@jimp/core', '@jimp/custom', '@jimp/plugin-print', '@jimp/plugin-resize', 'jimp'],
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      stream: false,
      crypto: false,
      http: false,
      https: false,
      zlib: false,
      buffer: false,
      util: false,
      url: false,
      net: false,
      tls: false,
      child_process: false,
      canvas: false,
      encoding: false,
    };

    config.plugins.push(
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      })
    );

    return config;
  },
}

module.exports = nextConfig
