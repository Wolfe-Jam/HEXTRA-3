module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "stream": require.resolve("stream-browserify"),
          "crypto": require.resolve("crypto-browserify"),
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "util": require.resolve("util/"),
          "zlib": require.resolve("browserify-zlib"),
          "path": require.resolve("path-browserify"),
          "buffer": require.resolve("buffer/"),
          "process": require.resolve("process/browser"),
          "querystring": require.resolve("querystring-es3")
        }
      }
    }
  }
};
